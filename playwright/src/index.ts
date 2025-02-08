import "dotenv/config";
import http from "node:http";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { createLogger, format, transports } from "winston";
import { getOfferForVehicle } from "./getOfferService";
import { firefox, BrowserServer } from "playwright-core";

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
  const offerResultQueue = new Queue("offer-results-queue", {
    connection,
  });

  browserServer = await firefox.launchServer({
    headless: true,
    logger: {
      isEnabled: () => true,
      log: (name, severity, message) => logger[severity](`${name} ${message}`),
    },
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-web-security",
      "--window-size=1920,1080",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-setuid-sandbox",
      "--disable-web-security",
    ],
  });

  const browserEndpoint = browserServer.wsEndpoint();
  const worker = new Worker(
    "offer-queue",
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
