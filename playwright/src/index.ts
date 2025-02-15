import "dotenv/config";
import http from "node:http";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { createLogger, format, transports } from "winston";
import { getOfferForVehicle } from "./getOfferService";
import { firefox, BrowserServer } from "playwright-core";

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

  browserServer = await firefox.launchServer({
    headless: true,
    logger: {
      isEnabled: () => true,
      log: (name, severity, message) => logger[severity](`${name} ${message}`),
    },
    firefoxUserPrefs: {
      'browser.tabs.remote.autostart': false,
      'browser.tabs.remote.autostart.2': false,
    },
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-xshm",  // This can help with shared memory issues in containers
    ],
  });

  const browserEndpoint = browserServer.wsEndpoint();
  const worker = new Worker(
    QueueNames.OffersQueue,
    async (job) => {
      logger.info(`starting job ${job.name}`);
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
});

server.on("close", () => {
  browserServer.close();
});
