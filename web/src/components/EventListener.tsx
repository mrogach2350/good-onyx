import { useEffect } from "react";
import { io } from "socket.io-client";

export default function EventListener() {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_BASE_SERVER_URL);

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
  return <div />;
}
