import { ColDef } from "ag-grid-community";
import costEstimator from "./costEstimator";
import currencyFormatter from "./currencyFormatter";

export function isEmpty(obj: {}) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

export function secondsToHms(d: number) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + "hr" : "";
  var mDisplay = m > 0 ? m + "m" : "";
  // var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return !!mDisplay ? `${hDisplay}:${mDisplay}` : hDisplay;
}

const costEstimatorColDef: ColDef = {
  headerName: "Estimated Total Cost",
  field: "currentBidAmount",
  valueFormatter: (params) => {
    if (params.value) {
      const bidNumberString = params.value.split(" ")[1];
      const bidNumber = parseInt(bidNumberString.replace(/,/g, ""));
      const estimatedCost = costEstimator(bidNumber);
      return currencyFormatter(estimatedCost) || "";
    }
    return "";
  },
};

const currentBidAmountColDef: ColDef = {
  field: "currentBidAmount",
  sortable: true,
  valueFormatter: (params) => {
    if (params.value) {
      const bidNumberString = params.value.split(" ")[1];
      const bidNumber = parseInt(bidNumberString.replace(/,/g, ""));
      return currencyFormatter(bidNumber) || "";
    }
    return "";
  },
};

export const getColDefs = (
  actionsCellRenderer: any,
  showEstimates?: boolean
): ColDef[] => {
  return [
    { field: "title", filter: true },
    {
      field: "action",
      cellRenderer: actionsCellRenderer,
      suppressSizeToFit: true,
    },
    {
      field: "offers",
      headerName: "Latest Offer",
      valueFormatter: (params) =>
        (params?.value && currencyFormatter(params?.value[0]?.amount)) ||
        "No Offers",
    },
    showEstimates ? costEstimatorColDef : currentBidAmountColDef,
    {
      field: "secondsLeftToBid",
      sortable: true,
      headerName: "Time Left To Bid",
      valueFormatter: (params) => secondsToHms(params.value),
    },
    { field: "vin" },
    { field: "make", sortable: true },
    { field: "model" },
    {
      field: "mileage",
      sortable: true,
      valueFormatter: (params) => params.value && params.value.toLocaleString(),
    },
    { field: "year", sortable: true },
  ];
};
