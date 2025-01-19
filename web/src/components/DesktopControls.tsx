import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "react-bulma-components";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateLeft } from "@fortawesome/free-solid-svg-icons";
import ListDropdown from "@/components/ListsDropdown";
import AddToListDropDown from "@/components/AddToListDropdown";
import {
  useDeleteVehiclesMutation,
  useAuctionScraperMutation,
  useUndoDeleteVehiclesMutation,
  useGetAuctionBidsMutation,
} from "@/mutations";

export default function DesktopControls({
  gridRef,
  selectedNodes,
  setSelectedNodes,
  selectedListId,
  setSelectedListId,
}: any) {
  const queryClient = useQueryClient();
  const auctionScraperMutation = useAuctionScraperMutation();
  const getAuctionBidsMutation = useGetAuctionBidsMutation();
  const deleteVehiclesMutation = useDeleteVehiclesMutation();
  const undoDeleteVehiclesMutation = useUndoDeleteVehiclesMutation();

  const [scraperUrl, setScrapeUrl] = useState<string>("");
  const [lastDeletedVehicleIds, setLastDeletedVehicleIds] = useState<number[]>(
    []
  );

  const handleListChange = (id: any) => {
    setSelectedListId(id);
  };

  const onAddVehicleToList = (listId: number) => {
    gridRef?.current?.api.setFilterModel(null);
    gridRef?.current?.api.deselectAll();
    setSelectedListId(listId);
  };

  const handleDeleteVehicles = async () => {
    const vehicleIds: number[] = selectedNodes.map((n: any) => n?.data?.id);
    deleteVehiclesMutation.mutate(
      { vehicleIds },
      {
        onSuccess: ({ deleteVehicleIds = [] }) => {
          setLastDeletedVehicleIds(deleteVehicleIds);
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
          setSelectedNodes([]);
        },
      }
    );
  };

  const handleUndoDelete = async () => {
    undoDeleteVehiclesMutation.mutate(
      { vehicleIds: lastDeletedVehicleIds },
      {
        onSuccess: () => {
          setLastDeletedVehicleIds([]);
          queryClient.invalidateQueries({ queryKey: ["vehicles"] });
        },
      }
    );
  };
  return (
    <div>
      <div className="flex space-x-2 w-1/2 items-baseline">
        <label htmlFor="scraperUrl" className="subtitle flex-none">
          Scrape Url
        </label>
        <input
          name="scraperUrl"
          className="input"
          value={scraperUrl}
          onChange={(e) => setScrapeUrl(e.target.value)}
        />
        <button
          onClick={() =>
            auctionScraperMutation.mutate(
              { scraperUrl },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["vehicles"] });
                  setScrapeUrl("");
                },
              }
            )
          }
          className="button is-primary"
          disabled={!scraperUrl.trim() || auctionScraperMutation.isPending}>
          {auctionScraperMutation.isPending ? "Loading..." : "Submit"}
        </button>
      </div>
      <div className="flex justify-between">
        <ListDropdown
          selectedListId={selectedListId}
          onChange={handleListChange}
        />
        <div className="flex justify-end space-x-2 mb-2">
          <AddToListDropDown
            selectedVehicleNodes={selectedNodes}
            onSave={onAddVehicleToList}
          />
          <button
            className="button is-primary"
            disabled={!selectedNodes.length || getAuctionBidsMutation.isPending}
            onClick={() =>
              getAuctionBidsMutation.mutate(
                { selectedNodes },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: ["vehicles"],
                    });
                    setSelectedNodes([]);
                  },
                }
              )
            }>
            {getAuctionBidsMutation.isPending
              ? "Loading..."
              : "Get Bids for Selected Rows"}
          </button>
          <button
            className="button is-danger"
            disabled={!selectedNodes.length || deleteVehiclesMutation.isPending}
            onClick={handleDeleteVehicles}>
            {deleteVehiclesMutation.isPending ? "Loading..." : "Delete"}
          </button>
          <Button
            disabled={lastDeletedVehicleIds.length === 0}
            onClick={handleUndoDelete}
            color="warning">
            <span>
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
