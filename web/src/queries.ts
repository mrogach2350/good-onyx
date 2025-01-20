export const getAllVehiclesQuery = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/vehicles`);
  return await response.json();
};

export const getVehicleByIdQuery = (vehicleId: string | number) => async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_SERVER_URL}/vehicles/${vehicleId}`
  );
  return await response.json();
};
