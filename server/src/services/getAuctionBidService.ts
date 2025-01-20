import * as cheerio from "cheerio";

export const getAuctionBid = async (auctionUrl: string) => {
  const response = await fetch(`https://${auctionUrl}`);
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

  return {
    secondsLeftToBid,
    bidAmount,
  };
};
