import { db } from "../index";
import { auctions, InsertAuctions } from "../schema";

export const upsertAuction = async (auction: InsertAuctions) => {
  return await db
    .insert(auctions)
    .values(auction)
    .onConflictDoUpdate({
      target: auctions.id,
      set: { ...auction },
    })
    .returning({ id: auctions.id });
};

export const getAllAuctions = async () => {
  return await db.select().from(auctions);
};
