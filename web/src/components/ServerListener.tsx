import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const NEXT_PUBLIC_BASE_SERVER_URL =
  process.env.NEXT_PUBLIC_BASE_SERVER_URL || "http://server:4000";

export default function ServerListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(
      `${NEXT_PUBLIC_BASE_SERVER_URL}/events`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data:", { ...data });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <div></div>;
}
