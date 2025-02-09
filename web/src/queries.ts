const getAllVehiclesQuery = async () => {
  const response = await fetch(`/api/vehicles`);
  return await response.json();
};

const getVehicleByIdQuery = (vehicleId: string | number) => async () => {
  const response = await fetch(`/api/vehicles/${vehicleId}`);
  return await response.json();
};

const getAllJobsQuery = async () => {
  const response = await fetch(`/api/jobs`);
  return await response.json();
};

export { getAllVehiclesQuery, getVehicleByIdQuery, getAllJobsQuery };
