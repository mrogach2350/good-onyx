import { useEffect } from "react";

export default function ServerListener() {
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:4000/events");

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
