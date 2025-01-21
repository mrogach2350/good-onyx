import type { Request, Response } from "express";
import { logger } from "../index";
import {
  getAllLists,
  createList,
  updateList,
  deleteList,
  getVehiclesByListId,
  addVehiclesToList,
  removeVehiclesFromList,
} from "../db/interactions/lists";

const getAllListsHandler = async (req: Request, res: Response) => {
  try {
    const lists = await getAllLists();
    res.json({
      success: true,
      lists,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const getListByIdHandler = async (req: Request, res: Response) => {};

const createListHandler = async (req: Request, res: Response) => {
  const { title = "" } = req.body;
  try {
    const createdLists = await createList({ title });
    res.json({
      success: true,
      listId: !!createdLists && createdLists[0].id,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const updateListHandler = async (req: Request, res: Response) => {
  const { id = 0 } = req.params;
  const { title = "" } = req.body;
  try {
    const updatedListId = await updateList({ title, id });
    res.json({
      success: true,
      listId: updatedListId,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const deleteListHandler = async (req: Request, res: Response) => {
  const { id = 0 } = req.params;
  logger.debug({ id });

  try {
    const deletedList = await deleteList({ id });
    res.json({
      success: true,
      listId: deletedList,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const getListVehiclesHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicles = await getVehiclesByListId(parseInt(id as string));
    res.json({
      success: true,
      vehicles,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const addVehiclesToListHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleIds } = req.body;
    await addVehiclesToList(parseInt(id as string), vehicleIds);
    res.json({
      success: true,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

const removeVehiclesFromListHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vehicleIds } = req.body;
    await removeVehiclesFromList(parseInt(id as string), vehicleIds);
    res.json({
      success: true,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e,
    });
  }
};

export {
  getAllListsHandler,
  getListByIdHandler,
  createListHandler,
  updateListHandler,
  deleteListHandler,
  getListVehiclesHandler,
  addVehiclesToListHandler,
  removeVehiclesFromListHandler,
};
