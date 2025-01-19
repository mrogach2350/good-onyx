import { firefox } from "playwright";
import { logger } from "../index";

export const getOfferForVehicle = async ({ vin, mileage }: any) => {
  const RECEIVER_EMAIL = "quotes.estimator@proton.me";
  const browser = await firefox.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-web-security",
      "--window-size=1920,1080",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-setuid-sandbox",
      "--disable-web-security",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  context.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  // Navigate to the page and wait for it to load
  await page.goto("https://www.carmax.com/sell-my-car");
  await page.waitForLoadState();
  await page.waitForTimeout(2000); // 2 second delay

  // Enter VIN and location
  console.log("Clicking VIN button...");
  await page.click("#button-VIN");

  console.log("Filling VIN...");
  await page.fill('input[name="vin"]', vin);

  console.log("Filling ZIP code...");
  await page.fill('input[name="zipCode"]', "94519");

  console.log("Clicking get started button...");
  await page.click("#ico-getstarted-button");

  await page.waitForTimeout(3000); // equivalent to sleep(3)

  console.log("Looking for close button...");
  const closeButton = await page.waitForSelector(
    "#full-screen-container-close",
    {
      state: "visible",
      timeout: 5000,
    }
  );

  if (closeButton) {
    console.log("Close button found, attempting to click...");
    await closeButton.click();

    // Wait for modal to close
    await page.waitForSelector("#full-screen-container-close", {
      state: "hidden",
      timeout: 5000,
    });

    console.log("Modal closed successfully");
  } else {
    console.warn("Close button not found");
  }

  const vinButton = await page.locator("#button-VIN");
  if (vinButton) {
    console.log("Found VIN button in main content");
    console.log("Clicking VIN button...");
    await page.click("#button-VIN");

    console.log("Filling VIN...");
    await page.fill('input[name="vin"]', vin);

    console.log("Filling ZIP code...");
    await page.fill('input[name="zipCode"]', "94519");

    console.log("Clicking get started button...");
    await page.click("#ico-getstarted-button");
  } else {
    console.log("VIN button not found, continuing with flow...");
  }

  // Style selection
  console.log("Selecting style...");
  await page.waitForSelector('input[name="style"]');
  await page.click('input[name="style"]', { delay: 100 });

  // Select drive type
  await page.waitForSelector("#select-ico-features-drive");
  await page.selectOption("#select-ico-features-drive", { index: 1 });

  // Select transmission type
  await page.waitForSelector("#select-ico-features-transmission");
  await page.selectOption("#select-ico-features-transmission", { index: 1 });

  console.log("Attempting to click Mileage and Condition button...");

  // Wait for button and check its state
  const mileageButton = await page.waitForSelector(
    "#ico-step-Mileage_and_Condition-btn"
  );

  // Scroll into view
  await mileageButton.scrollIntoViewIfNeeded();

  // Wait a moment for any animations
  await page.waitForTimeout(1000);

  // Try regular click first
  await mileageButton.click({
    delay: 100, // Small delay between mousedown and mouseup
    timeout: 5000, // 5 second timeout
  });

  // Enter mileage
  console.log("Entering mileage...");
  await page.fill('input[name="currentMileage"]', mileage.toString());

  // Check for and click Excellent condition if present
  console.log("Checking for Excellent condition option...");
  try {
    const excellentOption = await page.locator('text="Excellent"').first();

    // Try to find the element with a reasonable timeout
    const isVisible = await excellentOption.isVisible({ timeout: 5000 });

    if (isVisible) {
      await excellentOption.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500); // Short pause after scroll

      await excellentOption.click({ timeout: 5000 });
      console.log("Clicked Excellent condition");
    } else {
      console.log(
        "Excellent condition option not found or not visible, continuing..."
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        "Could not interact with Excellent condition option:",
        error.message
      );
    }
    // Continue with the flow rather than failing
  }

  // Process condition questions
  logger.info("Starting fieldset processing...");

  // Wait for condition div
  await page.waitForSelector("#DynamicConditionQuestions");

  // Process each fieldset
  const fieldsets = await page
    .locator("#DynamicConditionQuestions fieldset")
    .all();

  for (let index = 0; index < fieldsets.length; index++) {
    logger.info(`\nProcessing fieldset ${index + 1}`);

    // Find first radio in fieldset
    const firstRadio = await fieldsets[index]
      .locator('input[type="radio"]')
      .first();

    if (firstRadio) {
      // Scroll and click
      await firstRadio.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250); // Short pause after scroll

      await firstRadio.click({ delay: 100 });
      logger.info(`Successfully clicked radio in fieldset ${index + 1}`);
    } else {
      console.warn(`No radio button found in fieldset ${index + 1}`);
    }
  }

  // Fill email and continue
  logger.info("Filling email and submitting...");
  await page.fill('input[name="preferredEmail"]', RECEIVER_EMAIL);
  await page.click("#ico-continue-button");

  // Wait for instant offer to appear
  logger.info("Waiting for instant offer...");
  await page.waitForSelector("#instant-cash-offer", { state: "visible" });

  // Get offer details
  logger.info("Collecting offer details...");

  logger.info("Waiting for offer result...");
  const result = await Promise.race([
    page
      .waitForSelector("#icoIneligible", { state: "visible", timeout: 30000 })
      .then(() => "ineligible"),
    page
      .waitForSelector('[data-qa="offer-amount"]', {
        state: "visible",
        timeout: 30000,
      })
      .then(() => "eligible"),
  ]).catch(() => "timeout");

  if (result === "ineligible") {
    logger.info("Inelegible for instant offer");
    // browser.close();
    return {
      vin,
      mileage,
      offer: {
        elegible: false,
      },
    };
  }
  const offerElement = await page.waitForSelector('[data-qa="offer-amount"]');
  const offerAmount = await offerElement.textContent();
  if (!offerAmount) throw new Error("Could not find offer amount");
  const cleanedAmount = parseFloat(offerAmount.replace(/[$,]/g, ""));

  // Get offer code
  const offerCodeText = await page.textContent(
    ".Offer-module__offerCode--XWbKk"
  );
  if (!offerCodeText) throw new Error("Could not find offer code");
  const offerCode = offerCodeText.replace("Offer code: ", "");

  // Get valid until date
  const validUntilText = await page.textContent(
    ".Offer-module__expiration--d_mGC"
  );
  if (!validUntilText) throw new Error("Could not find expiration date");
  const validUntilDate = new Date(validUntilText.replace("Valid through ", ""));

  logger.info("Offer details collected:");
  logger.info(`VIN: $${vin}`);
  logger.info(`Mileage: $${mileage}`);
  logger.info(`Amount: $${cleanedAmount}`);
  logger.info(`Code: ${offerCode}`);
  logger.info(`Valid until: ${validUntilDate.toLocaleDateString()}`);

  browser.close();
  return {
    vin,
    mileage,
    offer: {
      elegible: true,
      amount: cleanedAmount,
      code: offerCode,
      validUntil: validUntilDate,
    },
  };
};
