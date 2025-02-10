import { useEffect } from "react";

const NEXT_PUBLIC_BASE_SERVER_URL = process.env.NEXT_PUBLIC_BASE_SERVER_URL || "http://server:4000";

export default function ServerListener() {
  useEffect(() => {
    const eventSource = new EventSource(`${NEXT_PUBLIC_BASE_SERVER_URL}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Data:", { ...data });
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <div></div>;
}
