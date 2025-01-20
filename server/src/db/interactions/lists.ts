import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { lists, vehiclesToLists, vehicles } from "../schema";

export const getAllLists = async () => {
  const lists = await db.query.lists.findMany({});
  return lists;
};

export const getAllListsWithVehicles = async () => {
  const lists = await db.query.lists.findMany({
    with: {
      vehiclesToLists: {
        with: {
          vehicle: true,
        },
      },
    },
  });

  return lists;
};

export const getListById = async (id: number) => {
  const list = await db.query.lists.findFirst({
    with: {
      vehiclesToLists: {
        with: {
          vehicle: true,
        },
      },
    },
    where: eq(lists.id, id),
  });

  return list;
};

export const createList = async (list: any) => {
  try {
    return await db.insert(lists).values(list).returning({ id: lists.id });
  } catch (e) {
    console.log(e);
  }
};

export const addVehiclesToList = async (
  listId: number,
  vehicleIds: number[]
) => {
  await Promise.all(
    vehicleIds.map((id) =>
      db
        .insert(vehiclesToLists)
        .values({ listId: listId, vehicleId: id })
        .onConflictDoNothing({
          where: and(
            eq(vehiclesToLists.listId, listId),
            eq(vehiclesToLists.vehicleId, id)
          ),
        })
    )
  );
};

export const removeVehiclesFromList = async (
  listId: number,
  vehicleIds: number[]
) => {
  await Promise.all(
    vehicleIds.map((id) =>
      db
        .delete(vehiclesToLists)
        .where(
          and(
            eq(vehiclesToLists.listId, listId),
            eq(vehiclesToLists.vehicleId, id)
          )
        )
    )
  );
};

export const getVehiclesByListId = async (listId: number) => {
  const results = await db
    .select()
    .from(vehiclesToLists)
    .leftJoin(vehicles, eq(vehiclesToLists.vehicleId, vehicles.id))
    .leftJoin(lists, eq(vehiclesToLists.listId, lists.id))
    .where(eq(lists.id, listId));

  return results.map((result) => result.vehicles);
};
