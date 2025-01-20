import type { Request, Response } from "express";
import {
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehiclesById,
  reinstateVehiclesById,
} from "../db/interactions/vehicles";

const getVehiclesHandler = async (req: Request, res: Response) => {
  const vehicles = await getAllVehicles();
  res.json({
    vehicles,
  });
};

const getVehicleByIdHandler = async (req: Request, res: Response) => {
  const { id = 0 } = req.params;
  if (id === 0) {
    const error = new Error("Invalid vehicle id");
    res.json({ error: error.name, message: error.message });
  }
  const vehicle = await getVehicleById(parseInt(id as string));
  res.json({
    vehicle,
  });
};

const updateVehicleHandler = async (req: Request, res: Response) => {
  const { id, note } = req.body;

  try {
    await updateVehicle({ id, note });
    res.json({
      success: true,
      message: "vehicle updated",
    });
  } catch (e) {
    res.json({
      success: false,
      message: `Error updating vehicle: ${e}`,
    });
  }
};

const deleteVehicleHandler = async (req: Request, res: Response) => {
  const { vehicleIds = [] } = req.body;

  try {
    const deleteVehicleIds = await deleteVehiclesById(vehicleIds);
    res.json({
      success: true,
      deleteVehicleIds,
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

const undoDeleteVehiclesHandler = async (req: Request, res: Response) => {
  const { vehicleIds = [] } = req.body;

  try {
    const reinstatedVehicleIds = await reinstateVehiclesById(vehicleIds);
    res.json({
      success: true,
      reinstatedVehicleIds,
    });
  } catch (error: any) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

export {
  getVehiclesHandler,
  getVehicleByIdHandler,
  updateVehicleHandler,
  deleteVehicleHandler,
  undoDeleteVehiclesHandler,
};
