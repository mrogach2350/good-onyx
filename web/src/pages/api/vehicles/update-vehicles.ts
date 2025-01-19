import { NextApiRequest, NextApiResponse } from "next";
import { updateVehicle } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
}
