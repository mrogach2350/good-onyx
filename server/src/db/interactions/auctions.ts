import { db } from "../index";
import { auctions } from "../schema";

export const upsertAuction = async (auction: any) => {
  return await db
    .insert(auctions)
    .values(auction)
    .onConflictDoUpdate({
      target: auctions.id,
      set: { ...auction },
    })
    .returning({ auctionRecordId: auctions.id });
};

export const getAllAuctions = async () => {
  return await db.select().from(auctions);
};
