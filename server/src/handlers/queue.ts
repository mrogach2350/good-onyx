import type { Request, Response } from "express";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { createOffer } from "../db/interactions/offers";
import { logger } from "../index";

const REDIS_HOST = process.env.REDIS_HOST || "keydb";
const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT)
  : 6379;

const connection = new IORedis(REDIS_PORT, REDIS_HOST, {
  maxRetriesPerRequest: null,
});

const offerQueue = new Queue("offer-queue", {
  connection,
});

const offerResultsWorker = new Worker(
  "offer-results-queue",
  async (job) => {
    const { data } = job;
    try {
      console.log({ ...job.data });
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

const enqueueJob = async (req: Request, res: Response) => {
  const { queueName, ...args } = req.body;
  if (queueName === "") {
    res.json({
      error: true,
      message: "No queue name",
    });
    return;
  }

  switch (queueName) {
    case "offer-queue":
      const jobId = offerQueue.add(`offer-queue`, { ...args });
      res.json({
        error: false,
        jobId,
      });
      return;
    default:
      res.json({
        error: true,
        message: "No matching queue name",
      });
      return;
  }
};

export { enqueueJob, offerQueue, offerResultsWorker };
