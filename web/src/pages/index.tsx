import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { getSelectorsByUserAgent } from "react-device-detect";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  themeQuartz,
  colorSchemeDarkBlue,
  SelectionChangedEvent,
  type CellEditingStoppedEvent,
} from "ag-grid-community";
import MobileControls from "@/components/MobileControls";
import DesktopControls from "@/components/DesktopControls";
import { isProfitable } from "@/utils/costEstimator";
import { getColDefs } from "@/utils/helpers";
import { getAllVehiclesQuery } from "@/queries";
import {
  useDeleteVehiclesMutation,
  useGetOfferMutation,
  useAuctionScraperMutation,
  useUpdateNoteMutation,
} from "@/mutations";

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

export default function Home({ isMobile }: { isMobile: boolean }) {
  const gridRef = useRef<AgGridReact<any>>(null);
  const queryClient = useQueryClient();
  const getOfferMutation = useGetOfferMutation();
  const deleteVehiclesMutation = useDeleteVehiclesMutation();
  const auctionScraperMutation = useAuctionScraperMutation();
  const updateNoteMutation = useUpdateNoteMutation();

  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [gettingOfferId, setGettingOfferId] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState<number>(0);
  const [showCostEstimates, setShowCostEstimates] = useState<boolean>(true);

  const onGetOffer = (node: any) => {
    const { vin, mileage, id } = node.data;
    setGettingOfferId(id);
    getOfferMutation.mutate(
      { vin, mileage, id },
      { onSettled: () => setGettingOfferId(null) }
    );
  };

  const colDefs: ColDef[] = useMemo(
    () =>
      getColDefs(({ node }: { node: any }) => {
        return (
          <div className="flex space-x-3 items-center h-full">
            <button
              onClick={() =>
                window.open(
                  `/vehicles/${node.data.id}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="button is-info is-small">
              View
            </button>
            <button
              onClick={() => onGetOffer(node)}
              className="button is-info is-small">
              {getOfferMutation.isPending && gettingOfferId === node.data.id
                ? "Loading..."
                : "Get Offer"}
            </button>
          </div>
        );
      }, showCostEstimates),
    [showCostEstimates]
  );

  const { data: allVehiclesData, isLoading: areVehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  const { data: vehiclesByListData, isLoading: areVehiclesByListLoading } =
    useQuery({
      queryKey: ["vehiclesByList", selectedListId],
      queryFn: async () => {
        const res = await fetch(`/api/lists/${selectedListId}/vehicles`);
        return await res.json();
      },
    });

  useEffect(() => {
    if (selectedListId !== 0) {
      queryClient.invalidateQueries({
        queryKey: ["vehiclesByList", selectedListId],
      });
    }
  }, [selectedListId]);

  const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedNodes(selectedNodes);
  }, []);

  const onCellEditingStopped = ({
    data,
    newValue,
    valueChanged,
  }: CellEditingStoppedEvent) => {
    if (valueChanged) {
      updateNoteMutation.mutate(
        { id: data.id, note: newValue },
        {
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        }
      );
    }
  };

  const showLoadingBar =
    areVehiclesByListLoading ||
    areVehiclesLoading ||
    auctionScraperMutation.isPending ||
    deleteVehiclesMutation.isPending ||
    getOfferMutation.isPending;

  return (
    <div className="section h-full">
      {showLoadingBar && (
        <progress
          className="progress is-small is-primary w-screen fixed top-0 left-0"
          max="100"
        />
      )}
      <h1 className="title">Vehicles</h1>
      {isMobile ? (
        <MobileControls
          gridRef={gridRef}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          selectedListId={selectedListId}
          setSelectedListId={setSelectedListId}
          showCostEstimates={showCostEstimates}
          setShowCostEstimates={setShowCostEstimates}
        />
      ) : (
        <DesktopControls
          gridRef={gridRef}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          selectedListId={selectedListId}
          setSelectedListId={setSelectedListId}
          showCostEstimates={showCostEstimates}
          setShowCostEstimates={setShowCostEstimates}
        />
      )}
      <div className="h-5/6">
        <AgGridReact
          ref={gridRef}
          pagination
          className="h-full pb-5"
          rowSelection={{
            mode: "multiRow",
            selectAll: "currentPage",
          }}
          rowClassRules={{
            "bg-red-800": (params) => !isProfitable(params.data),
          }}
          theme={myTheme}
          columnDefs={colDefs}
          rowData={
            selectedListId === 0
              ? allVehiclesData?.vehicles
              : vehiclesByListData?.vehicles
          }
          onSelectionChanged={onSelectionChanged}
          autoSizeStrategy={{
            type: "fitCellContents",
          }}
          noRowsOverlayComponent={() => <div>No Vehicles</div>}
          onCellEditingStopped={onCellEditingStopped}
        />
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const userAgent = context.req.headers["user-agent"];

  const { isMobile } = getSelectorsByUserAgent(userAgent);
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["vehicles"],
    queryFn: getAllVehiclesQuery,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      isMobile,
    },
  };
}
