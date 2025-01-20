import * as cheerio from "cheerio";
import { logger } from "../index";

function extractCompanyFromUrl(url: string): string {
  // Implement your company extraction logic here
  const urlObj = new URL(url);
  return urlObj.hostname.split(".")[0]; // Basic example
}

export const getAuctions = async (auctionListUrl: string) => {
  try {
    const urlObj = new URL(auctionListUrl);
    const baseSiteUrl = urlObj.hostname;
    const allListings: any[] = [];
    const companyName = extractCompanyFromUrl(auctionListUrl);
    let currentUrl = auctionListUrl;
    // In TypeScript, we'll need to interact with your database/ORM here
    // This is a simplified example returning an Auction object
    const auction = {
      company: companyName,
      url: baseSiteUrl,
    };

    while (true) {
      // Fetch the page content using fetch instead of cheerio.fromURL
      const response = await fetch(currentUrl);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Find all lot divs using the regex pattern
      const lots = $("div").filter((_, element) => {
        const id = $(element).attr("id");
        return id ? /^LotTable:\d+$/.test(id) : false;
      });

      // Process the lots on the current page
      const currentPageListings = lots.map((i, lot) => {
        const result: any = {};
        result["title"] = $(lot).find(".lotListTitle").text().trim();
        result["listNumber"] = $(lot).find(".lotListNumber").text().trim();
        result["url"] = `${baseSiteUrl}${$(lot)
          .find(".lotListNumber > a")
          .attr("href")}`;
        const metadata = $(lot).find(".lotMetaData");
        $(metadata)
          .find("> span")
          .map((i, span) => $(span).text().trim())
          .get()
          .forEach((spanText) => {
            let [key, value] = spanText.split(":");
            if (key.toLowerCase() === "mileage") {
              result[key.toLowerCase()] = parseInt(
                value.replace(/[^0-9]/g, ""),
                10
              );
              return;
            }
            result[key.toLowerCase()] = value.trim();
          });
        return result;
      });

      allListings.push(...currentPageListings);

      // Check for next page
      const nextButton = $(".cnCatNext");
      const nextLinkButton = nextButton.find("a");

      // Break if no more pages
      if (
        nextButton.length === 0 ||
        nextButton.hasClass("paginationDisabled") ||
        nextLinkButton.length === 0
      ) {
        logger.info("No more pages to scrape");
        break;
      }

      // Get next page URL
      const nextPageUrl = nextLinkButton.attr("href");
      if (!nextPageUrl) {
        logger.info("No next page URL found");
        break;
      }

      // Create absolute URL by combining base URL with relative path
      currentUrl = new URL(nextPageUrl, auctionListUrl).toString();
      logger.info("Moving to next page:", currentUrl);

      // Optional delay to be nice to the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      allListings,
      auction,
    };
  } catch (error) {
    console.error("Error scraping auction:", error);
    throw error;
  }
};
