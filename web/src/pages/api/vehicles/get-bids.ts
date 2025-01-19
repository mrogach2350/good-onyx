import { NextApiRequest, NextApiResponse } from "next";
import { updateVehicle } from "@/db/interactions/vehicles";

type BidData = {
  secondsLeftToBid: string;
  bidAmount: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let response;
  const { auctionUrl = "", vehicleId } = req.body;
  try {
    response = await fetch(`${process.env.BASE_SCRAPER_URL}/get-bid`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auctionUrl,
      }),
    });
  } catch (e) {
    console.log("error getting auctions: ", e);
  }
  const data = await response?.json();
  const { bidData } = data;
  const { bidAmount, secondsLeftToBid } = bidData as BidData;

  try {
    await updateVehicle({
      id: vehicleId,
      currentBidAmount: bidAmount,
      secondsLeftToBid: parseInt(secondsLeftToBid),
    });
    return res.json({
      success: true,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
}
