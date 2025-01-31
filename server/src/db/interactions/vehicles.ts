import { eq, asc } from "drizzle-orm";
import { db } from "../index";
import { vehicles, type InsertVehicle, type SelectVehicle } from "../schema";

export const getAllVehicles = async () => {
  const result = await db.query.vehicles.findMany({
    with: {
      offers: true,
    },
    where: (vehicles, { isNull }) => isNull(vehicles.deletedAt),
    orderBy: [asc(vehicles.id)],
  });

  return result.map((vehicle) => ({
    ...vehicle,
    offers: vehicle?.offers.map((o) => ({
      ...o,
      retrivedAt: o.retrivedAt?.toDateString(),
      validUntil: o.validUntil?.toDateString(),
    })),
  }));
};

export const getVehicleById = async (id: number) => {
  const vehicle = await db.query.vehicles.findFirst({
    with: {
      offers: true,
    },
    where: eq(vehicles.id, id),
  });

  return {
    ...vehicle,
    offers: vehicle?.offers.map((o) => ({
      ...o,
      retrivedAt: o.retrivedAt?.toDateString(),
      validUntil: o.validUntil?.toDateString(),
    })),
  };
};

export const getVehicleByVin = async (vin: string) => {
  return await db.query.vehicles.findFirst({
    where: eq(vehicles.vin, vin),
  });
};

export const createVehicle = async (vehicle: InsertVehicle) => {
  await db
    .insert(vehicles)
    .values(vehicle)
    .onConflictDoUpdate({
      target: vehicles.id,
      set: { ...vehicle, deletedAt: null },
    });
};

export const updateVehicle = async (vehicle: SelectVehicle) => {
  const { id, ...vehicleData } = vehicle;

  await db
    .update(vehicles)
    .set({ ...vehicleData })
    .where(eq(vehicles.id, id));
};

export const bulkCreateVehicle = async (
  newVehicles: InsertVehicle[],
  auctionRecordId = 0
) => {
  newVehicles
    .filter((v: InsertVehicle) => v.vin !== "" && v.url !== "")
    .map((v: InsertVehicle) => ({
      auctionId: auctionRecordId,
      ...v,
    }))
    .forEach(async (v: InsertVehicle) => {
      try {
        await db
          .insert(vehicles)
          .values(v)
          .onConflictDoUpdate({
            target: vehicles.vin,
            set: { ...v, deletedAt: null },
          });
      } catch (e) {
        console.log("error creating vehicle record:", {
          e,
          v,
        });
      }
    });
};

export const deleteVehiclesById = async (vehicleIds: number[]) => {
  const results = await Promise.all(
    vehicleIds.map(async (vehicleId) => {
      try {
        return await db
          .update(vehicles)
          .set({ deletedAt: new Date() })
          .where(eq(vehicles.id, vehicleId))
          .returning({ id: vehicles.id });
      } catch (e) {
        console.log("error deleting vehicle record:", {
          e,
          vehicleId,
        });
      }
    })
  );
  return results.map((result) => result && result[0]?.id);
};

export const reinstateVehiclesById = async (vehicleIds: number[]) => {
  return vehicleIds.map(async (vehicleId) => {
    try {
      await db
        .update(vehicles)
        .set({ deletedAt: null })
        .where(eq(vehicles.id, vehicleId))
        .returning({ id: vehicles.id });
    } catch (e) {
      console.log("error reinstating vehicle record:", {
        e,
        vehicleId,
      });
    }
  });
};
