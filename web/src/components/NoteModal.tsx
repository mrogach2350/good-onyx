import { useState, useEffect } from "react";
import type { UseMutateFunction } from "@tanstack/react-query";
import { Modal } from "react-bulma-components";
import { useUpdateNoteMutation } from "@/mutations";
export default function NoteModal({
  onClose,
  onSuccess,
  selectedVehicle = { id: 0, note: "" },
}: {
  onClose: () => void;
  onSuccess: (arg: any) => void;
  selectedVehicle: { id: number; note: string };
}) {
  const updateNoteMutation = useUpdateNoteMutation();
  const [vehicleNoteValue, setVehicleNoteValue] = useState<string>();
  useEffect(() => {
    setVehicleNoteValue(selectedVehicle.note);
  }, [selectedVehicle.note]);

  return (
    <Modal show showClose onClose={onClose}>
      <Modal.Content>
        <h1 className="title">Note Modal</h1>
        <textarea
          value={vehicleNoteValue}
          onChange={(e) => setVehicleNoteValue(e.target.value)}
          className="textarea"></textarea>
        <div className="flex space-x-3 mt-3">
          <button
            onClick={() =>
              updateNoteMutation.mutate(
                {
                  id: selectedVehicle.id,
                  note: vehicleNoteValue as string,
                },
                { onSuccess: onSuccess }
              )
            }
            className="button is-primary">
            Save
          </button>
          <button onClick={onClose} className="button is-danger">
            Discard
          </button>
        </div>
      </Modal.Content>
    </Modal>
  );
}
