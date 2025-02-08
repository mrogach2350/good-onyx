import express from "express";
import {
  getAllListsHandler,
  getListByIdHandler,
  createListHandler,
  updateListHandler,
  deleteListHandler,
  getListVehiclesHandler,
  addVehiclesToListHandler,
  removeVehiclesFromListHandler,
} from "../handlers/lists";

const listsRouter = express.Router();

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

export default listsRouter;
