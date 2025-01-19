import { useMutation } from "@tanstack/react-query";

export const useDeleteVehiclesMutation = () =>
  useMutation({
    mutationFn: async ({ vehicleIds }: { vehicleIds: number[] }) => {
      const res = await fetch("/api/vehicles/", {
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

export const useGetOfferMutation = () =>
  useMutation({
    mutationFn: async ({ vin, mileage, id }: any) => {
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
  });

export const useAuctionScraperMutation = () =>
  useMutation({
    mutationFn: async ({ scraperUrl }: { scraperUrl: string }) => {
      await fetch("/api/receive-auctions", {
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

export const useUndoDeleteVehiclesMutation = () =>
  useMutation({
    mutationFn: async ({ vehicleIds }: { vehicleIds: number[] }) => {
      const res = await fetch("/api/vehicles/undo", {
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

export const useGetAuctionBidsMutation = () =>
  useMutation({
    mutationFn: async ({ selectedNodes }: any) => {
      const httpCalls = selectedNodes.map((node: any) => {
        return fetch("/api/vehicles/get-bids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleId: node?.data?.id,
            auctionUrl: node?.data?.url,
          }),
        });
      });
      return await Promise.all(httpCalls);
    },
  });

export const useUpdateNoteMutation = () =>
  useMutation<any, unknown, { id: number; note: string }>({
    mutationFn: async ({ id, note }) => {
      await fetch("/api/vehicles/update-vehicles", {
        method: "POST",
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
