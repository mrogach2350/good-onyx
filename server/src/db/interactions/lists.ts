import { eq, and } from "drizzle-orm";
import { db } from "../index";
import { lists, vehiclesToLists, vehicles, offers } from "../schema";

const getAllLists = async () => {
  const lists = await db.query.lists.findMany({});
  return lists;
};

const getAllListsWithVehicles = async () => {
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

const getListById = async (id: number) => {
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

const createList = async (list: any) => {
  try {
    return await db.insert(lists).values(list).returning({ id: lists.id });
  } catch (e) {
    console.log(e);
  }
};

const updateList = async (list: any) => {
  try {
    return await db
      .update(lists)
      .set({ title: list.name })
      .where(eq(lists.id, list.id))
      .returning({ id: lists.id });
  } catch (e) {
    console.log(e);
  }
};

const deleteList = async (list: any) => {
  try {
    return await db
      .delete(lists)
      .where(eq(lists.id, list.id))
      .returning({ id: lists.id });
  } catch (e) {
    console.log(e);
  }
};

const addVehiclesToList = async (listId: number, vehicleIds: number[]) => {
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

const removeVehiclesFromList = async (listId: number, vehicleIds: number[]) => {
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

const getVehiclesByListId = async (listId: number) => {
  const result = await db.query.lists.findFirst({
    with: {
      vehiclesToLists: {
        with: {
          vehicle: {
            with: {
              offers: true,
            },
          },
        },
      },
    },
    where: eq(lists.id, listId),
  });
  return result?.vehiclesToLists.map(x => x.vehicle)
};

export {
  getAllLists,
  getAllListsWithVehicles,
  getListById,
  createList,
  updateList,
  deleteList,
  addVehiclesToList,
  removeVehiclesFromList,
  getVehiclesByListId,
};
