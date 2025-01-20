import type { Request, Response } from "express";
import {
  getAllLists,
  createList,
  getVehiclesByListId,
  addVehiclesToList,
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

export {
  getAllListsHandler,
  getListByIdHandler,
  createListHandler,
  getListVehiclesHandler,
  addVehiclesToListHandler,
};
