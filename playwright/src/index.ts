import "dotenv/config";
import http from "node:http";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { createLogger, format, transports } from "winston";
import { firefox, BrowserServer } from "playwright-core";
import { getOfferForVehicle } from "./getOfferService";
import { getAuctions } from "./getAuctionsService";

enum QueueNames {
  OffersQueue = "offers-queue",
  OffersResultQueue = "offers-result-queue",
  BidsQueue = "bids-queue",
  BidsResultQueue = "bids-result-queue",
  AuctionsQueue = "auctions-queue",
  AuctionsResultQueue = "auctions-result-queue",
}

const server = http.createServer();

const { combine, label, printf } = format;
const myFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  format: combine(label({ label: "good-onyx-playwright" }), myFormat),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
});

export let browserServer: BrowserServer;
let offerQueueWorker: Worker;
let auctionQueueWorker: Worker;
const PORT = process.env.PORT || 6666;
server.listen(PORT, async () => {
  logger.info(`playwright listening on port:${PORT}`);
  const REDIS_HOST = process.env.REDIS_HOST || "keydb";
  const REDIS_PORT = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT)
    : 6379;

  const connection = new IORedis(REDIS_PORT, REDIS_HOST, {
    maxRetriesPerRequest: null,
  });
  const offerResultQueue = new Queue(QueueNames.OffersResultQueue, {
    connection,
  });

  const auctionResultQueue = new Queue(QueueNames.AuctionsResultQueue, {
    connection,
  });

  browserServer = await firefox.launchServer({
    headless: true,
    logger: {
      isEnabled: () => true,
      log: (name, severity, message) => logger[severity](`${name} ${message}`),
    },
    firefoxUserPrefs: {
      "browser.tabs.remote.autostart": false,
      "browser.tabs.remote.autostart.2": false,
    },
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-xshm", // This can help with shared memory issues in containers
    ],
  });

  const browserEndpoint = browserServer.wsEndpoint();
  offerQueueWorker = new Worker(
    QueueNames.OffersQueue,
    async (job) => {
      logger.info(`starting offer job ${job.name}`);
      const { vin = "", mileage = 0, id = 0 } = job.data;
      if (vin === "" || mileage === 0 || id === 0) return null;

      try {
        const result = await getOfferForVehicle(
          {
            vin,
            mileage,
            vehicleId: id,
          },
          browserEndpoint
        );

        if (!result?.error) {
          offerResultQueue.add(id, { ...result.offerData });
        }
      } catch (error) {
        if (error instanceof Error) {
          return {
            error: error.name,
            message: error.message,
          };
        }
      }
    },
    { connection }
  );

  auctionQueueWorker = new Worker(
    QueueNames.AuctionsQueue,
    async (job) => {
      logger.info(`starting auction job ${job.name}`);
      const { auctionUrl = "" } = job.data;
      if (auctionUrl === "") return null;
      try {
        const result = await getAuctions(auctionUrl);
        if (!result?.error) {
          auctionResultQueue.add(auctionUrl, { ...result });
        }
      } catch (error) {
        if (error instanceof Error) {
          return {
            error: error.name,
            message: error.message,
          };
        }
      }
    },
    { connection }
  );
});

server.on("close", () => {
  browserServer.close();
  offerQueueWorker.close();
  auctionQueueWorker.close();
});
