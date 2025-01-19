import { NextApiRequest, NextApiResponse } from "next";
import { getAllLists, createList } from "@/db/interactions/lists";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const METHOD = req.method;
  switch (METHOD) {
    case "GET":
      try {
        const lists = await getAllLists();
        return res.json({
          success: true,
          lists,
        });
      } catch (e) {
        return res.json({
          success: false,
          error: e,
        });
      }
    case "POST":
      const { title = "" } = req.body;
      try {
        const createdLists = await createList({ title });
        return res.json({
          success: true,
          listId: !!createdLists && createdLists[0].id,
        });
      } catch (e) {
        return res.json({
          success: false,
          error: e,
        });
      }
  }
}
