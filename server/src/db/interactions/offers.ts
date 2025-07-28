import { db } from "../index";
import { offers, type InsertOffer } from "../schema";

export const createOffer = async (
  offer: InsertOffer,
  vehicleId: number = 0
) => {
  if (!offer?.validUntil) return;
  try {
    return await db
      .insert(offers)
      .values({
        ...offer,
        vehicleId,
        validUntil: new Date(offer?.validUntil),
      })
      .returning();
  } catch (e) {
    console.log("error creating offer record", e);
  }
};

export const getAllOffers = async () => {
  return await db.select().from(offers);
};
