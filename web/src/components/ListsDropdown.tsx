import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dropdown, Modal, Button, Form, Box } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { useDeleteListMutation } from "@/mutations";

export default function ListDropdown({
  selectedListId,
  onChange,
}: {
  selectedListId: number;
  onChange: (n: number) => void;
}) {
  const [showNewListModal, setShowNewListModal] = useState<boolean>(false);
  const [showDeleteListModal, setShowDeleteModal] = useState<boolean>(false);
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      const result = await fetch(`/api/lists`);
      return await result.json();
    },
    queryKey: ["lists"],
  });

  const handleOnChange = (data: string | number) => {
    switch (data) {
      case "createNew":
        setShowNewListModal(true);
        break;
      case "deleteLists":
        setShowDeleteModal(true);
        break;
      default:
        onChange(data as number);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div>Fetching lists...</div>
      ) : (
        <Dropdown
          onChange={handleOnChange}
          value={selectedListId}
          closeOnSelect
          icon={<FontAwesomeIcon className="ml-2" icon={faAngleDown} />}>
          <Dropdown.Item renderAs="a" value={0}>
            All
          </Dropdown.Item>
          {data?.lists?.map((list: any) => (
            <Dropdown.Item renderAs="a" key={list.id} value={list.id}>
              {list.title}
            </Dropdown.Item>
          ))}
          <Dropdown.Divider />
          <Dropdown.Item renderAs="button" value="createNew">
            Create New List
          </Dropdown.Item>
          <Dropdown.Item renderAs="button" value="deleteLists">
            Delete Lists
          </Dropdown.Item>
        </Dropdown>
      )}
      {showNewListModal && (
        <NewListModal onClose={() => setShowNewListModal(false)} />
      )}
      {showDeleteListModal && (
        <DeleteListModal
          lists={data?.lists}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

export function NewListModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState<string>("");

  const createListMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/lists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      onClose();
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    createListMutation.mutate();
  };

  return (
    <Modal show={true} showClose onClose={onClose}>
      <Modal.Content>
        <Form.Label>Create New List</Form.Label>
        <Form.Input
          type="text"
          renderAs="input"
          value={newTitle}
          onChange={(e: any) => setNewTitle(e.target.value)}
        />
        <div className="flex justify-end space-x-3 pt-3">
          <Button color="success" onClick={handleSubmit}>
            Submit
          </Button>
          <Button color="danger" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export function DeleteListModal({
  lists,
  onClose,
}: {
  lists: any[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const deleteListMutation = useDeleteListMutation();

  const handleDelete = (listId: any) => {
    deleteListMutation.mutate(
      { listId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["lists"] });
          onClose();
        },
      }
    );
  };

  return (
    <Modal show={true} showClose onClose={onClose}>
      <Modal.Content>
        <p className="subtitle is-4">Delete Lists</p>
        {lists?.map((list) => (
          <Box key={list.id}>
            <div className="flex justify-between items-center">
              <span>{list.title}</span>
              <Button color="danger" onClick={() => handleDelete(list.id)}>
                Delete
              </Button>
            </div>
          </Box>
        ))}
      </Modal.Content>
    </Modal>
  );
}
