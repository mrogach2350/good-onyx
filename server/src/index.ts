import express from "express";
import cors from "cors";
import { createLogger, format, transports } from "winston";
import {
  getAuctionsHandler,
  getOfferHandler,
  getBidHandler,
} from "./handlers/services";
import { enqueueJob } from "./handlers/queue";
import { vehiclesRouter, listsRouter } from './routers'

const app = express();

const { combine, label, printf } = format;
const myFormat = printf(({ level, message, label }) => {
  return `[${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  format: combine(label({ label: "good-onyx-server" }), myFormat),
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
});

app.use(cors());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use((req, res, next) => {
  req.setTimeout(90000);
  res.setTimeout(90000);
  next();
});

app.use("/vehicles", vehiclesRouter);
app.use("/lists", listsRouter);

app.post("/get-auctions", getAuctionsHandler);
app.post("/get-offer", getOfferHandler);
app.post("/get-bid", getBidHandler);
app.post("/enqueue", enqueueJob);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});
