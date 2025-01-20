import type { Request, Response } from "express";
import { getOfferForVehicle } from "../services/getOfferService";
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
    const { allListings, auction } = await getAuctions(auctionUrl);

    res.json({
      success: true,
      allListings,
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

const getOfferHandler = async (req: Request, res: Response) => {
  const { vin = "", mileage = 0 } = req.body;
  if (vin === "" || mileage === 0) {
    res.json({
      error: true,
      message: "offer getter requires VIN and Mileage",
    });
  }

  try {
    const offerData = await getOfferForVehicle({
      vin,
      mileage,
    });

    res.json({
      success: true,
      ...offerData,
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
  const { auctionUrl } = req.body;

  try {
    const bidData = await getAuctionBid(auctionUrl);

    res.json({
      success: true,
      bidData,
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

export { getAuctionsHandler, getOfferHandler, getBidHandler };
