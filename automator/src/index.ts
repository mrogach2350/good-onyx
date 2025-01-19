import express from "express";
import { createLogger, format, transports } from "winston";
import { createServer } from "http";
import { Server } from "socket.io";
import IORedis from "ioredis";
import { Worker } from "bullmq";
import { getOfferForVehicle } from "./services/getOfferService";
import { getAuctions } from "./services/getAuctionsService";
import { getAuctionBid } from "./services/getAuctionBidService";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

const { combine, label, printf } = format;
const myFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});
export const logger = createLogger({
  format: combine(label({ label: "good-onyx-automator" }), myFormat),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

io.on("connection", (socket) => {
  logger.info("socket connected");
});

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
    if (error instanceof Error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
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
  } catch (error) {
    if (error instanceof Error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
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
  } catch (error) {
    if (error instanceof Error) {
      res.json({
        error: true,
        message: error.message,
      });
    }
  }
});

httpServer.listen(4000, () => {
  logger.info("listening on port 4000");
  const connection = new IORedis(6379, "localhost", {
    maxRetriesPerRequest: null,
  });
  const worker = new Worker(
    "offer_getter",
    async (job) => {
      logger.info(`starting job ${job.name}`);
      return null;
    },
    { connection }
  );

  worker.on("completed", async (job) => {
    io.emit("job-completed", job);
  });
});
