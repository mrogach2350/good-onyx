import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllJobsQuery } from "@/queries";

export default function JobTracker() {
  const { data: jobsData } = useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobsQuery,
  });

  useEffect(() => {
    console.log("jobs data:", jobsData);
  }, [jobsData]);

  return <div></div>;
}
