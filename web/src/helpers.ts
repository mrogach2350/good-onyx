import { ColDef } from "ag-grid-community";

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

export const getColDefs = (actionsCellRenderer: any): ColDef[] => {
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
        (params?.value && params?.value[0]?.amount) || "No Offers",
    },
    { field: "currentBidAmount", sortable: true },
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
      valueFormatter: (m) => m.value && m.value.toLocaleString(),
    },
    { field: "year", sortable: true },
  ];
};
