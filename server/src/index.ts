import express from "express";
import cors from "cors";
import { createLogger, format, transports } from "winston";
import { createServer } from "http";
import { Server } from "socket.io";
import IORedis from "ioredis";
import { Worker } from "bullmq";
import { getOfferForVehicle } from "./services/getOfferService";
import {
  getAuctionsHandler,
  getOfferHandler,
  getBidHandler,
} from "./handlers/services";
import {
  getAllListsHandler,
  getListByIdHandler,
  createListHandler,
  updateListHandler,
  deleteListHandler,
  getListVehiclesHandler,
  addVehiclesToListHandler,
  removeVehiclesFromListHandler,
} from "./handlers/lists";
import {
  getVehiclesHandler,
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
  undoDeleteVehiclesHandler,
} from "./handlers/vehicles";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

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

io.on("connection", (socket) => {
  logger.info("socket connected");
});

app.use(express.json());
const vehiclesRouter = express.Router();
const listsRouter = express.Router();
app.use("/vehicles", vehiclesRouter);
app.use("/lists", listsRouter);

vehiclesRouter
  .route("/")
  .get(getVehiclesHandler)
  .put(updateVehicleHandler)
  .delete(deleteVehicleHandler);
vehiclesRouter.post("/undo", undoDeleteVehiclesHandler);
vehiclesRouter.route("/:id").get(getVehicleByIdHandler);

listsRouter.route("/").get(getAllListsHandler).post(createListHandler);
listsRouter
  .route("/:id")
  .get(getListByIdHandler)
  .put(updateListHandler)
  .delete(deleteListHandler);
listsRouter
  .route("/:id/vehicles")
  .get(getListVehiclesHandler)
  .post(addVehiclesToListHandler)
  .delete(removeVehiclesFromListHandler);

app.post("/get-auctions", getAuctionsHandler);
app.post("/get-offer", getOfferHandler);
app.post("/get-bid", getBidHandler);

httpServer.listen(4000, () => {
  logger.info("listening on port 4000");

  const REDIS_HOST = process.env.REDIS_HOST || "keydb";
  const connection = new IORedis(6379, REDIS_HOST, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    "get_offer",
    async (job) => {
      logger.info(`starting job ${job.name}`);
      const { vin = "", mileage = 0 } = job.data;
      if (vin === "" || mileage === 0) return null;

      try {
        const offerData = await getOfferForVehicle({
          vin,
          mileage,
        });

        return {
          ...offerData,
        };
      } catch (error) {
        if (error instanceof Error) {
          return {
            error: error.name,
            message: error.message,
          };
        }
      }
    },
    { connection }
  );

  worker.on("completed", async (job) => {
    io.emit("job-completed", job);
  });
});
