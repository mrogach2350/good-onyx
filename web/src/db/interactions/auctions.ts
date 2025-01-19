import { auctions } from "@/db/schema";
import { db } from "@/db";

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
