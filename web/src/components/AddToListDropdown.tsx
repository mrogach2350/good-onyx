import { useQuery, useMutation } from "@tanstack/react-query";
import { Dropdown } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export default function AddToListDropDown({
  selectedVehicleNodes = [],
  onSave,
}: {
  selectedVehicleNodes: any[];
  onSave: (n: number) => void;
}) {
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const result = await fetch("/api/lists");
      return await result.json();
    },
    queryKey: ["lists"],
  });

  const addVehiclesToListMutation = useMutation({
    mutationFn: async (selectedListId: string | number) => {
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

  const handleOnChange = (data: string | number) => {
    addVehiclesToListMutation.mutate(data);
    onSave(data as number);
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
