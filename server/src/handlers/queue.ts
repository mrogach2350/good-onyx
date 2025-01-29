import type { Request, Response } from "express";
import { offerQueue } from "../index";

const enqueueJob = async (req: Request, res: Response) => {
  const { queueName, ...args } = req.body;
  if (queueName === "") {
    res.json({
      error: true,
      message: "No queue name",
    });
    return;
  }

  switch (queueName) {
    case "offer-queue":
      const jobId = offerQueue.add(`get-offer`, { ...args });
      res.json({
        error: false,
        jobId,
      });
      return;
    default:
      res.json({
        error: true,
        message: "No matching queue name",
      });
      return;
  }
};

export { enqueueJob };
