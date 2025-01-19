export const getAllVehiclesQuery = async () => {
  const response = await fetch("/api/vehicles");
  return await response.json();
};

export const getVehicleByIdQuery = (vehicleId: string | number) => async () => {
  const response = await fetch(`/api/vehicles/${vehicleId}`);
  return await response.json();
};
