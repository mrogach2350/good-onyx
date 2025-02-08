import express from "express";
import {
  getVehiclesHandler,
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
  undoDeleteVehiclesHandler,
} from "../handlers/vehicles";

const vehiclesRouter = express.Router();

vehiclesRouter
  .route("/")
  .get(getVehiclesHandler)
  .put(updateVehicleHandler)
  .delete(deleteVehicleHandler);
vehiclesRouter.post("/undo", undoDeleteVehiclesHandler);
vehiclesRouter.route("/:id").get(getVehicleByIdHandler);

export default vehiclesRouter;
