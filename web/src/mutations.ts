import { useMutation } from "@tanstack/react-query";

export enum QueueNames {
  OffersQueue = "offers-queue",
  OffersResultQueue = "offers-result-queue",
  BidsQueue = "bids-queue",
  BidsResultQueue = "bids-result-queue",
  AuctionsQueue = "auctions-queue",
  AuctionsResultQueue = "auctions-result-queue",
}

const useDeleteVehiclesMutation = () =>
  useMutation({
    mutationFn: async ({ vehicleIds }: { vehicleIds: number[] }) => {
      const res = await fetch(`/api/vehicles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds,
        }),
      });
      return await res.json();
    },
  });

const useGetOfferMutation = () =>
  useMutation({
    mutationFn: async ({ vin, mileage, id }: any) => {
      return await fetch(`/api/enqueue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vin,
          mileage,
          id,
          queueName: QueueNames.OffersQueue,
        }),
      });
    },
  });

const useAuctionScraperMutation = () =>
  useMutation({
    mutationFn: async ({ scraperUrl }: { scraperUrl: string }) => {
      await fetch(`/api/get-auctions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionUrl: scraperUrl,
        }),
      });
    },
  });

const useAuctionScraperQueueMutation = () =>
  useMutation({
    mutationFn: async ({ scraperUrl }: { scraperUrl: string }) => {
      await fetch(`/api/enqueue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionUrl: scraperUrl,
          queueName: QueueNames.AuctionsQueue,
        }),
      });
    },
  });

const useUndoDeleteVehiclesMutation = () =>
  useMutation({
    mutationFn: async ({ vehicleIds }: { vehicleIds: number[] }) => {
      const res = await fetch(`/api/vehicles/undo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds,
        }),
      });
      return await res.json();
    },
  });

const useGetAuctionBidsMutation = () =>
  useMutation({
    mutationFn: async ({ selectedNodes }: any) => {
      const httpCalls = selectedNodes.map((node: any) => {
        return fetch(`/api/get-bid`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicle: node?.data,
          }),
        });
      });
      return await Promise.all(httpCalls);
    },
  });

const useUpdateNoteMutation = () =>
  useMutation<any, unknown, { id: number; note: string }>({
    mutationFn: async ({ id, note }) => {
      await fetch(`/api/vehicles`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          note,
        }),
      });
    },
  });

const useDeleteListMutation = () =>
  useMutation({
    mutationFn: async ({ listId }: { listId: any }) => {
      await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  });

const useAddVehiclesToListMutation = () =>
  useMutation({
    mutationFn: async ({
      selectedListId,
      selectedVehicleNodes,
    }: {
      selectedListId: string | number;
      selectedVehicleNodes: any[];
    }) => {
      await fetch(`/api/lists/${selectedListId}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicleNodes.map((n) => n?.data?.id),
        }),
      });
    },
  });

const useRemoveVehiclesFromListMutation = () =>
  useMutation({
    mutationFn: async ({
      selectedListId,
      selectedVehicleNodes,
    }: {
      selectedListId: string | number;
      selectedVehicleNodes: any[];
    }) => {
      await fetch(`/api/lists/${selectedListId}/vehicles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleIds: selectedVehicleNodes.map((n) => n?.data?.id),
        }),
      });
    },
  });

export {
  useDeleteVehiclesMutation,
  useGetOfferMutation,
  useAuctionScraperMutation,
  useAuctionScraperQueueMutation,
  useUndoDeleteVehiclesMutation,
  useGetAuctionBidsMutation,
  useUpdateNoteMutation,
  useDeleteListMutation,
  useAddVehiclesToListMutation,
  useRemoveVehiclesFromListMutation,
};
