import { NextApiRequest, NextApiResponse } from "next";
import { getAllVehicles, deleteVehiclesById } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const METHOD = req.method;
  switch (METHOD) {
    case "GET":
      const vehicles = await getAllVehicles();
      return res.json({
        vehicles,
      });
    case "DELETE":
      const { vehicleIds = [] } = req.body;

      try {
        const deleteVehicleIds = await deleteVehiclesById(vehicleIds);
        return res.json({
          success: true,
          deleteVehicleIds,
        });
      } catch (error: any) {
        return res.json({
          success: false,
          error: error.message,
        });
      }
  }
}
