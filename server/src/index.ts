import express from "express";
import cors from "cors";
import { createLogger, format, transports } from "winston";
import { getAuctionsHandler, getBidHandler } from "./handlers/services";
import { enqueueJob, getJobs, getAllJobs } from "./handlers/queue";
import { vehiclesRouter, listsRouter } from "./routers";

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
app.post("/get-bid", getBidHandler);
app.post("/enqueue", enqueueJob);
app.get("/jobs", getAllJobs);
app.get("/jobs/:queueName", getJobs);

const clients = new Set<express.Response>();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write('data: {"type":"connected"}\n\n');

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
    logger.info("client disconnected from SSE");
  });

  logger.info("client connected to SSE");
});

export const notifyClients = (data: any) => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  logger.info(`listening on port ${PORT}`);
});
