const getAllVehiclesQuery = async () => {
  const response = await fetch(`/api/vehicles`);
  return await response.json();
};

const getVehicleByIdQuery = (vehicleId: string | number) => async () => {
  const response = await fetch(`/api/vehicles/${vehicleId}`);
  return await response.json();
};

type GetAllJobsQueryResult = {
  auctionJobs: any[];
  offerJobs: any[];
  bidJobs: any[];
};

type Job = {
  name: string;
};

const getAllJobsQuery = async () => {
  const response = await fetch(`/api/jobs`);
  const { jobs = [] } = await response.json();
  return jobs.flat().reduce(
    (agg: GetAllJobsQueryResult, job: Job) => {
      switch (job.name) {
        case "getOffer":
          agg.offerJobs.push(job);
          break;
        case "getAuction":
          agg.auctionJobs.push(job);
          break;
        case "getBid":
          agg.bidJobs.push(job);
          break;
      }
      return agg;
    },
    {
      auctionJobs: [],
      offerJobs: [],
      bidJobs: [],
    }
  );
};

export { getAllVehiclesQuery, getVehicleByIdQuery, getAllJobsQuery };
