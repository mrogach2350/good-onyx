import express from "express";
import cors from "cors";
import { createLogger, format, transports } from "winston";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import {
  getAuctionsHandler,
  getOfferHandler,
  getBidHandler,
} from "./handlers/services";
import { enqueueJob } from "./handlers/queue";
import { createOffer } from "./db/interactions/offers";
import { vehiclesRouter, listsRouter } from './routers'

const app = express();

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

const REDIS_HOST = process.env.REDIS_HOST || "keydb";
const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT)
  : 6379;

const connection = new IORedis(REDIS_PORT, REDIS_HOST, {
  maxRetriesPerRequest: null,
});

export const offerQueue = new Queue("offer-queue", {
  connection,
});

export const offerResultsWorker = new Worker(
  "offer-results-queue",
  async ({ data }) => {
    try {
      await createOffer(
        {
          amount: data.cleanedAmount,
          code: data.code,
          validUntil: data.validUntilDate,
        },
        data.vehicleId
      );

      logger.info(`created offer for vehicle id:${data.vehicleId}`);
    } catch (e) {
      if (e instanceof Error) {
        logger.error({
          message: `error creating offer for vehicle id:${data.vehicleId}`,
          error: e.message,
        });
      }
    }
  },
  {
    connection,
  }
);

app.use(cors());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use((req, res, next) => {
  req.setTimeout(90000);
  res.setTimeout(90000);
  next();
});

app.use("/vehicles", vehiclesRouter);
app.use("/lists", listsRouter);

app.post("/get-auctions", getAuctionsHandler);
app.post("/get-offer", getOfferHandler);
app.post("/get-bid", getBidHandler);
app.post("/enqueue", enqueueJob);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});
