import { useMutation } from "@tanstack/react-query";

export const useDeleteVehiclesMutation = () =>
  useMutation({
    mutationFn: async ({ vehicleIds }: { vehicleIds: number[] }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/vehicles`, {
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
      return await fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/enqueue`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/receive-auctions`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/vehicles/undo`, {
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
        return fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/get-bids`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_NEXT_PUBLIC_BASE_SERVER_URL}/vehicles`, {
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
