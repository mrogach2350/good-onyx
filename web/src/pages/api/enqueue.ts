import { NextApiRequest, NextApiResponse } from "next";
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
  try {
    const { vin = "", mileage = 0, id = 0 } = req.body;
    const queue = new Queue(QUEUES.GET_OFFER);

    const job = await queue.add(`get_offer_for_${id}`, { vin, mileage });
    return res.json({
      ...job,
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.json({
        success: false,
        message: e.message,
      });
    }
  }
}
