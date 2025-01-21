import * as cheerio from "cheerio";
import { SelectVehicle } from "../db/schema";
import { updateVehicle } from "../db/interactions/vehicles";

export const getAuctionBid = async (vehicle: SelectVehicle) => {
  const response = await fetch(`https://${vehicle.url}`);
  const html = await response.text();
  const $ = cheerio.load(html);

  const secondsLeftToBid = $(".BigBidWidgetTop .lotTimeRemaining")
    .text()
    .replace(/\s+/g, " ") // remove escaped characters
    .trim()
    // extract seconds from update string
    .split(",")?.[1]
    ?.split('"')?.[0];

  const bidAmount = $(".BigBidWidgetTop .lotStatusValue")
    .text()
    .replace(/\s+/g, " ") // remove escaped characters
    .trim();

  const updatedVehicle = await updateVehicle({
    ...vehicle,
    secondsLeftToBid: parseInt(secondsLeftToBid),
    currentBidAmount: bidAmount,
  });

  return {
    vehicle: updatedVehicle,
  };
};
