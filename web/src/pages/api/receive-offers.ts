import { NextApiRequest, NextApiResponse } from "next";
import { createOffer } from "@/db/interactions/offers";
import { isEmpty } from "@/helpers";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { vin = "", mileage = 0, id = 0 } = req.body;
  const response = await fetch(`${process.env.BASE_SCRAPER_URL}/get-offer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vin,
      mileage,
    }),
  });

  const { offer } = await response.json();
  try {
    if (isEmpty(offer)) {
      return res.json({
        success: false,
        message: "Unable to retrive offer, please try again.",
      });
    } else if (!offer?.elegible) {
      return res.json({
        success: false,
        message: "Vehicle not elegible for instant offer.",
      });
    }

    const newOffer = await createOffer(offer, id);

    return res.json({
      success: true,
      newOffer,
    });
  } catch (error: any) {
    return res.json({
      success: false,
      error: error.message,
    });
  }
}
