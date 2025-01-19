import express from "express";
import { getOfferForVehicle } from "./services/getOfferService";
import { getAuctions } from "./services/getAuctionsService";
import { getAuctionBid } from "./services/getAuctionBidService";

const app = express();

app.use(express.json());

app.post("/get-auctions", async (req, res) => {
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
    res.json({
      error: true,
      message: error.message,
    });
  }
});

app.post("/get-offer", async (req, res) => {
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
  } catch (e) {
    res.json({
      error: true,
      message: e.message,
    });
  }
});

app.post("/get-bid", async (req, res) => {
  const { auctionUrl } = req.body;

  try {
    const bidData = await getAuctionBid(auctionUrl);

    res.json({
      success: true,
      bidData,
    });
  } catch (e) {
    res.json({
      error: true,
      message: e.message,
    });
  }
});

app.listen(4000);
