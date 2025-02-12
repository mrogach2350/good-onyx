import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllJobsQuery } from "../queries";

export default function NotificationsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobsQuery,
  });

  useEffect(() => {
    console.log("jobs data", data);
  }, [data]);

  return <div>Notifications will go here!</div>;
}
