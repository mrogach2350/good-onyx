import type { Request, Response } from "express";
import { getAuctions } from "../services/getAuctionsService";
import { getAuctionBid } from "../services/getAuctionBidService";

const getAuctionsHandler = async (req: Request, res: Response) => {
  const { auctionUrl = "" } = req.body;
  if (auctionUrl === "") {
    res.json({
      error: true,
      message: "auction scraper requires auctionUrl",
    });
  }

  try {
    const { vehicles, auction } = await getAuctions(auctionUrl);

    res.json({
      success: true,
      vehicles,
      auction,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
  }
};

const getBidHandler = async (req: Request, res: Response) => {
  const { vehicle } = req.body;

  try {
    const updatedVehicle = await getAuctionBid(vehicle);

    res.json({
      success: true,
      updatedVehicle,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
  }
};

export { getAuctionsHandler, getBidHandler };
