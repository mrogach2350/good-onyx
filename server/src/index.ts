import express from "express";
import cors from "cors";
import { createLogger, format, transports } from "winston";
import { Queue } from "bullmq";
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
import { enqueueJob } from "./handlers/queue";
import {
  getVehiclesHandler,
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
  undoDeleteVehiclesHandler,
} from "./handlers/vehicles";

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

const redisHost = process.env.REDIS_HOST || "mcqueen";
const redisPort = process.env.REDIS_PORT || 6379;
export const offerQueue = new Queue("offer-queue", {
  connection: {
    host: redisHost,
    port: redisPort as number,
  },
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
app.post("/enqueue", enqueueJob);

app.listen(4000, () => {
  logger.info("listening on port 4000");
});
