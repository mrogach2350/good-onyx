import { NextApiRequest, NextApiResponse } from "next";
import IORedis from "ioredis";
import { Queue } from "bullmq";

export enum QUEUES {
  GET_OFFER = "get_offer",
  GET_AUCTION_BID = "get_auction_bid",
  GET_AUCTION_LISTINGS = "get_auction_listings",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vin = "", mileage = 0, id = 0 } = req.body;
  const connection = new IORedis(6379, "http://localhost");
  const queue = new Queue(QUEUES.GET_OFFER, { connection });

  queue.add(`get_offer_for_${id}`, { vin, mileage });

  return res.json({
    message: `enqueued job for ${id}`,
  });
}
