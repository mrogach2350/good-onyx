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

const getOfferHandler = async (req: Request, res: Response) => {
  const { vin = "", mileage = 0, id = 0 } = req.body;
  if (vin === "" || mileage === 0 || id === 0) {
    res.json({
      error: true,
      message: "offer getter requires VIN, Mileage, and ID",
    });
  }

  try {
    const offerData = await getOfferForVehicle({
      vin,
      mileage,
      vehicleId: id,
    });

    res.json({
      error: false,
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

export { getAuctionsHandler, getOfferHandler, getBidHandler };
