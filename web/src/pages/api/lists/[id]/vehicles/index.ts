import { NextApiRequest, NextApiResponse } from "next";
import {
  getVehiclesByListId,
  addVehiclesToList,
} from "@/db/interactions/lists";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const METHOD = req.method;
  switch (METHOD) {
    case "GET":
      try {
        const { id } = req.query;
        const vehicles = await getVehiclesByListId(parseInt(id as string));
        return res.json({
          success: true,
          vehicles,
        });
      } catch (e) {
        return res.json({
          success: false,
          error: e,
        });
      }
    case "POST":
      try {
        const { id } = req.query;
        const { vehicleIds } = req.body;
        await addVehiclesToList(parseInt(id as string), vehicleIds);
        return res.json({
          success: true,
        });
      } catch (e) {
        return res.json({
          success: false,
          error: e,
        });
      }
  }
}
