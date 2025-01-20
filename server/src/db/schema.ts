import {
  integer,
  pgTable,
  timestamp,
  text,
  serial,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const vehicles = pgTable("vehicles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text(),
  listNumber: text(),
  engine: text(),
  transmission: text(),
  make: text(),
  model: text(),
  mileage: integer(),
  vin: text().notNull().unique(),
  year: integer(),
  url: text().notNull(),
  auctionId: integer(),
  note: text().default(""),
  currentBidAmount: text(),
  secondsLeftToBid: integer(),
  deletedAt: timestamp(),
});

const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  offers: many(offers),
  vehiclesToLists: many(vehiclesToLists),
  auction: one(auctions, {
    fields: [vehicles.auctionId],
    references: [auctions.id],
  }),
}));

const offers = pgTable("offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  amount: integer(),
  retrivedAt: timestamp().defaultNow(),
  code: text(),
  offeringCompany: text().default("carmax"),
  validUntil: timestamp(),
  vehicleId: integer().references(() => vehicles.id, { onDelete: "cascade" }),
});

const offersRelations = relations(offers, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [offers.vehicleId],
    references: [vehicles.id],
  }),
}));

const auctions = pgTable("auctions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company: text(),
  url: text(),
});

const auctionsRelations = relations(auctions, ({ many }) => ({
  vehicles: many(vehicles),
}));

const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  title: text().notNull().unique(),
  description: text(),
});

const listsRelations = relations(lists, ({ many }) => ({
  vehiclesToLists: many(vehiclesToLists),
}));

const vehiclesToLists = pgTable(
  "vehicles_to_lists",
  {
    vehicleId: integer()
      .notNull()
      .references(() => vehicles.id),
    listId: integer()
      .notNull()
      .references(() => lists.id),
  },
  (t) => [primaryKey({ columns: [t.vehicleId, t.listId] })]
);

const vehiclesToListsRelations = relations(vehiclesToLists, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehiclesToLists.vehicleId],
    references: [vehicles.id],
  }),
  list: one(lists, {
    fields: [vehiclesToLists.listId],
    references: [lists.id],
  }),
}));

export {
  vehicles,
  vehiclesRelations,
  offers,
  offersRelations,
  auctions,
  auctionsRelations,
  lists,
  listsRelations,
  vehiclesToLists,
  vehiclesToListsRelations,
};
