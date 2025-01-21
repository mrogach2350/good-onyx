import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { ColDef, themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
import { secondsToHms } from "@/helpers";
import { getVehicleByIdQuery } from "@/queries";
import { useGetAuctionBidsMutation } from "@/mutations";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);
export default function VehicleShow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const getAuctionBidsMutation = useGetAuctionBidsMutation();

  const [scrapingError, setScrapingError] = useState<string>("");
  const [editNote, setEditNote] = useState<boolean>(false);
  const [vehicleNoteValue, setVehicleNoteValue] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["vehicle"],
    queryFn: getVehicleByIdQuery(router.query.id as string),
  });

  useEffect(() => {
    setVehicleNoteValue(data?.vehicle?.note);
  }, [data?.vehicle?.note]);

  const colDefs: ColDef[] = [
    { field: "amount", sortable: true },
    { field: "code" },
    { field: "offeringCompany" },
    { field: "validUntil" },
    { field: "retrivedAt" },
  ];

  const getOfferMutation = useMutation({
    mutationFn: async () => {
      const { vin, mileage, id } = data?.vehicle;
      return await fetch("/api/receive-offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vin,
          mileage,
          id,
        }),
      });
    },
    onSuccess: async (data) => {
      const { success, message = "" } = await data.json();
      if (!success) {
        setScrapingError(message);
      } else {
        setScrapingError("");
        queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      }
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/vehicles/delete-vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds: [data?.vehicle.id],
        }),
      });
    },
    onSuccess: () => {
      router.push("/");
    },
  });

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/vehicles/update-vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data?.vehicle.id,
          note: vehicleNoteValue,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle"] });
      setEditNote(false);
    },
  });

  const handleDiscard = () => {
    setEditNote(false);
    setVehicleNoteValue(data?.vehicle.note);
  };

  const showLoadingBar =
    isLoading ||
    getOfferMutation.isPending ||
    deleteListingMutation.isPending ||
    saveNoteMutation.isPending ||
    getAuctionBidsMutation.isPending;

  return (
    <div className="section">
      {showLoadingBar && (
        <progress
          className="progress is-small is-primary w-screen fixed top-0 left-0"
          max="100"
        />
      )}
      <div>
        <button
          onClick={() => router.push("/")}
          className="button is-info mb-3">
          Back to Vehicles
        </button>
        <a
          className="button is-primary ml-3"
          target="_blank"
          href={`https://${data?.vehicle?.url}`}
          rel="noopener noreferrer">
          Link to Vehicle Listing Page
        </a>
        <a
          className="button is-danger ml-3"
          onClick={() => deleteListingMutation.mutate()}>
          Delete Listing
        </a>
        <h1 className="title">{data?.vehicle?.title}</h1>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <h1 className="subtitle">Info</h1>
            <p>
              <strong>Make</strong>: <span>{data?.vehicle?.make}</span>
            </p>
            <p>
              <strong>Model</strong>: <span>{data?.vehicle?.model}</span>
            </p>
            <p>
              <strong>Year</strong>: <span>{data?.vehicle?.year}</span>
            </p>
            <p>
              <strong>VIN</strong>: <span>{data?.vehicle?.vin}</span>
            </p>
            <p>
              <strong>Mileage</strong>:{" "}
              <span>{data?.vehicle?.mileage?.toLocaleString()}</span>
            </p>
            <p className="mt-2 border-white border-t flex justify-between items-baseline pr-5 pt-2">
              <span>
                <strong>Current Bid</strong>: {data?.vehicle?.currentBidAmount}
                <br />
                <strong>Time Left to Bid</strong>:{" "}
                {secondsToHms(data?.vehicle?.secondsLeftToBid)}
              </span>
              <button
                onClick={() =>
                  getAuctionBidsMutation.mutate(
                    { selectedNodes: [data] },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["vehicle"],
                        });
                      },
                    }
                  )
                }
                className="button is-small is-info">
                {getAuctionBidsMutation.isPending
                  ? "Loading..."
                  : "Refresh bid"}
              </button>
            </p>
            <p></p>
          </div>
          <div>
            <div className="flex space-x-3 items-baseline">
              <h1 className="subtitle">Note</h1>
              <button
                className={`button is-info is-small ${editNote ? "invisible" : "visible"}`}
                onClick={() => setEditNote(true)}>
                Edit Note
              </button>
            </div>
            {editNote ? (
              <div>
                <textarea
                  className="textarea"
                  value={vehicleNoteValue}
                  onChange={(e) => setVehicleNoteValue(e.target.value)}
                />
                <div className="flex space-x-3 mt-3">
                  <button
                    className="button is-primary"
                    onClick={() => saveNoteMutation.mutate()}>
                    Save
                  </button>
                  <button className="button is-danger" onClick={handleDiscard}>
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <p>{data?.vehicle?.note}</p>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <h3 className="subtitle">Offers</h3>
            <button
              className="button is-info is-small"
              onClick={() => getOfferMutation.mutate()}>
              {getOfferMutation.isPending ? "Loading..." : "Get Offer"}
            </button>
            {scrapingError && <p>{scrapingError}</p>}
          </div>
          <div className="flex flex-col space-y-3">
            <div className="h-96">
              <AgGridReact
                theme={myTheme}
                columnDefs={colDefs}
                rowData={data?.vehicle?.offers || []}
                noRowsOverlayComponent={() => <div>No Offers</div>}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context: any) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["vehicle"],
    queryFn: getVehicleByIdQuery(context.params.id),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
