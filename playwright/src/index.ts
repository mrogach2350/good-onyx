import http from "node:http";
import IORedis from "ioredis";
import { Worker } from "bullmq";
import { createLogger, format, transports } from "winston";
import { getOfferForVehicle } from "./getOfferService";
import { firefox, BrowserServer } from "playwright-core";

const server = http.createServer();

const { combine, label, printf } = format;
const myFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  format: combine(label({ label: "good-onyx-server" }), myFormat),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
});

export let browserServer: BrowserServer;

server.listen(6666, async () => {
  const REDIS_HOST = process.env.REDIS_HOST || "keydb";
  const connection = new IORedis(6300, REDIS_HOST, {
    maxRetriesPerRequest: null,
  });

  browserServer = await firefox.launchServer({
    headless: true,
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

  const worker = new Worker(
    "offer-queue",
    async (job) => {
      logger.info(`starting job ${job.name}`);
      const { vin = "", mileage = 0, id = 0 } = job.data;
      if (vin === "" || mileage === 0 || id === 0) return null;

      try {
        const offerData = await getOfferForVehicle({
          vin,
          mileage,
          vehicleId: id,
        });

        return {
          ...offerData,
        };
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

  worker.on("completed", async (job) => {
    // io.emit("job-completed", job);
  });
});

server.on("close", () => {
  browserServer.close();
});
