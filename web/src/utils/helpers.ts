import { ColDef, type ICellEditorParams } from "ag-grid-community";
import { costEstimator } from "./costEstimator";
import currencyFormatter from "./currencyFormatter";
import GridTextEditor from "../components/GridTextEditor";

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

export const sortOffersByDate = (offers: any[]): any[] => {
  return [...offers].sort((a, b) => {
    const dateA = new Date(a.retrievedAt);
    const dateB = new Date(b.retrievedAt);
    return dateB.getTime() - dateA.getTime();
  });
};

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
  comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
    if (valueA) {
      if (valueB) {
        const bidNumberStringA = valueA.split(" ")[1];
        const bidNumberA = parseInt(bidNumberStringA.replace(/,/g, ""));
        const bidNumberStringB = valueB.split(" ")[1];
        const bidNumberB = parseInt(bidNumberStringB.replace(/,/g, ""));
        return isDescending ? bidNumberA - bidNumberB : bidNumberB - bidNumberA;
      }
      return 1;
    }
    return 0;
  },
};

const currentBidAmountColDef: ColDef = {
  field: "currentBidAmount",
  sortable: true,
  comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
    if (valueA) {
      if (valueB) {
        const bidNumberStringA = valueA.split(" ")[1];
        const bidNumberA = parseInt(bidNumberStringA.replace(/,/g, ""));
        const bidNumberStringB = valueB.split(" ")[1];
        const bidNumberB = parseInt(bidNumberStringB.replace(/,/g, ""));
        return isDescending ? bidNumberA - bidNumberB : bidNumberB - bidNumberA;
      }
      return 1;
    }
    return 0;
  },
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
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
        if (valueA.length > 0) {
          if (valueB.length > 0) {
            return valueA[0]?.amount - valueB[0]?.amount;
          }
          return 1;
        }
        return 0;
      },
      valueFormatter: (params) =>
        (params?.value && currencyFormatter(params?.value[0]?.amount)) ||
        "No Offers",
    },
    showEstimates ? costEstimatorColDef : currentBidAmountColDef,
    {
      field: "note",
      headerName: "Latest Note",
      editable: true,
      cellEditor: GridTextEditor,
    },
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
