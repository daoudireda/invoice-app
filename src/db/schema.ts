import { integer, pgEnum, serial, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import AVAILABLE_STATUSES from "@/data/invoices";

export type Status = (typeof AVAILABLE_STATUSES)[number]["id"];

const status = AVAILABLE_STATUSES.map(({ id }) => id) as Array<Status>;

export const statusEnum = pgEnum(
  "status",
  status as [Status, ...Array<Status>]
);

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey().notNull(),
  createTs: timestamp("createTs").defaultNow().notNull(),
  status: statusEnum("status").notNull(),
  value: integer("value").notNull(),
  description: text("description").notNull(),
  userId: text("userId").notNull(),
  organizationId: text("organizationId"),
  customerId: integer("customerId")
    .notNull()
    .references(() => Customers.id),
});

export const Customers = pgTable("customers", {
  id: serial("id").primaryKey().notNull(),
  createTs: timestamp("createTs").defaultNow().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  userId: text("userId").notNull(),
  organizationId: text("organizationId"),
});
