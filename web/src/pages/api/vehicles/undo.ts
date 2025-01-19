import { NextApiRequest, NextApiResponse } from "next";
import { reinstateVehiclesById } from "@/db/interactions/vehicles";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const METHOD = req.method;
  switch (METHOD) {
    case "POST":
      const { vehicleIds = [] } = req.body;

      try {
        const reinstatedVehicleIds = await reinstateVehiclesById(vehicleIds);
        return res.json({
          success: true,
          reinstatedVehicleIds,
        });
      } catch (error: any) {
        return res.json({
          success: false,
          error: error.message,
        });
      }
  }
}
