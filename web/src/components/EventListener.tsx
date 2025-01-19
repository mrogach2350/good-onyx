import { useEffect } from "react";
import { io } from "socket.io-client";

export default async function EventListener() {
  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      console.log("socket connected");
    });

    socket.on("job-completed", (data) => {
      console.log("job completed!");
      console.log({ data });
    });

    return () => {
      socket.off("connect", () => {
        console.log("socket disconnected");
      });

      socket.off("job-completed", (data) => {
        console.log("job completed!");
        console.log({ data });
      });
    };
  }, []);
  return <div>Event Listener</div>;
}
