import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { useAddVehiclesToListMutation } from "@/mutations";

export default function AddToListDropDown({
  selectedVehicleNodes = [],
  onSave,
}: {
  selectedVehicleNodes: any[];
  onSave: (n: number) => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const result = await fetch(
        `/api/lists"`
      );
      return await result.json();
    },
    queryKey: ["lists"],
  });

  const addVehiclesToListMutation = useAddVehiclesToListMutation();

  const handleOnChange = (selectedListId: string | number) => {
    addVehiclesToListMutation.mutate(
      { selectedListId, selectedVehicleNodes },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["vehiclesByList", selectedListId],
          });
        },
      }
    );
    onSave(selectedListId as number);
  };

  return (
    <div>
      {isLoading ? (
        <div>Fetching lists...</div>
      ) : (
        <Dropdown
          disabled={selectedVehicleNodes.length === 0}
          onChange={handleOnChange}
          closeOnSelect={true}
          color="success"
          icon={<FontAwesomeIcon className="ml-2" icon={faAngleDown} />}
          label="Add To List">
          {data?.lists?.length !== 0 ? (
            data?.lists?.map((list: any) => (
              <Dropdown.Item renderAs="a" key={list.id} value={list.id}>
                {list.title}
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item value={0}>No Lists</Dropdown.Item>
          )}
        </Dropdown>
      )}
    </div>
  );
}
