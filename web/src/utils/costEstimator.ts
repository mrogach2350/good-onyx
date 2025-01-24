import { prod, format } from "mathjs";

const BUYERS_FEE: number = 1.15; // 15%
const SALES_TAX: number = 1.0775; // 7.75%
const DOC_FEE: number = 70; // $70
const SMOG_TEST_FEE: number = 50; // $50
const SMOG_CERT_FEE: number = 8.25; // $8.25
const ADMIN_FEE: number = 125; // $125
const NON_PERCENT_FEES =
  SALES_TAX + DOC_FEE + SMOG_TEST_FEE + SMOG_CERT_FEE + ADMIN_FEE;

export default function costEstimator(
  baseCost: number,
  isWholesaler: boolean = false
) {
  const withBuyersFee = prod(baseCost, BUYERS_FEE);
  const withNonPercentFees = withBuyersFee + NON_PERCENT_FEES;

  if (isWholesaler) {
    return withNonPercentFees;
  }

  const estimateTotal = prod(withNonPercentFees, SALES_TAX);
  return Math.round(estimateTotal * 100) / 100;
}