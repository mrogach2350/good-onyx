import { Button } from "react-bulma-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRemoveVehiclesFromListMutation } from "@/mutations";

export default function RemoveFromListButton({
  selectedVehicleNodes = [],
  onDelete,
  selectedListId,
}: {
  selectedVehicleNodes: any[];
  onDelete: (n: number) => void;
  selectedListId: number;
}) {
  const queryClient = useQueryClient();
  const removeVehiclesFromListMutation = useRemoveVehiclesFromListMutation();

  const handleDelete = () => {
    removeVehiclesFromListMutation.mutate(
      { selectedListId, selectedVehicleNodes },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["vehiclesByList", selectedListId],
          });
        },
      }
    );
    onDelete(selectedListId as number);
  };

  return (
    <Button
      disabled={selectedVehicleNodes.length === 0}
      onClick={handleDelete}
      color="danger">
      Remove
    </Button>
  );
}
