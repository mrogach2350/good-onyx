import type { Request, Response } from "express";
import IORedis from "ioredis";
import { Queue, Worker } from "bullmq";
import { createOffer } from "../db/interactions/offers";
import { logger, notifyClients } from "../index";

enum QueueNames {
  OffersQueue = "offers-queue",
  OffersResultQueue = "offers-result-queue",
  BidsQueue = "bids-queue",
  BidsResultQueue = "bids-result-queue",
  AuctionsQueue = "auctions-queue",
  AuctionsResultQueue = "auctions-result-queue"
}

const REDIS_HOST = process.env.REDIS_HOST || "keydb";
const REDIS_PORT = process.env.REDIS_PORT
  ? parseInt(process.env.REDIS_PORT)
  : 6379;

const connection = new IORedis(REDIS_PORT, REDIS_HOST, {
  maxRetriesPerRequest: null,
});

const offersQueue = new Queue(QueueNames.OffersQueue, {
  connection,
});

const offersResultWorker = new Worker(
  QueueNames.OffersResultQueue,
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

      notifyClients({
        type: "newOffer",
        vehicleId: data.vehicleId,
      });

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

const bidsQueue = new Queue(QueueNames.BidsQueue, {
  connection,
});

const auctionsQueue = new Queue(QueueNames.AuctionsQueue, {
  connection,
});

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
    case QueueNames.OffersQueue:
      const offersJobId = offersQueue.add(`getOffer`, { ...args });
      res.json({
        error: false,
        jobId: offersJobId,
      });
      return;
    case QueueNames.BidsQueue:
      const bidsJobId = bidsQueue.add("getBid", { ...args });
      res.json({
        error: false,
        jobId: bidsJobId,
      });
      return;
    case QueueNames.AuctionsQueue:
      const auctionsJobId = auctionsQueue.add("getAuction", {
        ...args,
      });
      res.json({
        error: false,
        jobId: auctionsJobId,
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

const getJobs = async (req: Request, res: Response) => {
  const { queueName } = req.params;
  switch (queueName) {
    case QueueNames.OffersQueue:
      const offersJobs = await offersQueue.getJobs();
      res.json({
        jobs: offersJobs,
      });
    case QueueNames.BidsQueue:
      const bidsJobs = await bidsQueue.getJobs();
      res.json({
        jobs: bidsJobs,
      });
    case QueueNames.AuctionsQueue:
      const auctionsJobs = await auctionsQueue.getJobs();
      res.json({
        jobs: auctionsJobs,
      });
    default:
      res.json({
        error: true,
        message: "No matching queue name",
      });
      return;
  }
};

const getAllJobs = async (req: Request, res: Response) => {
  const allJobs = await Promise.all([
    offersQueue.getJobs(),
    bidsQueue.getJobs(),
    auctionsQueue.getJobs(),
  ]);

  res.json({
    jobs: allJobs,
  });
};

export { enqueueJob, offersQueue, offersResultWorker, getJobs, getAllJobs };
