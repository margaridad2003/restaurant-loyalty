import { pgTable, text, integer, real, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const visitsTable = pgTable("visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  visitDate: timestamp("visit_date", { withTimezone: true }).notNull().defaultNow(),
  mealsCount: real("meals_count").notNull().default(1),
  pointsEarned: real("points_earned").notNull().default(0),
  pointsRedeemed: integer("points_redeemed").notNull().default(0),
  notes: text("notes"),
  rewardUsed: text("reward_used"),
  registeredBy: text("registered_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVisitSchema = createInsertSchema(visitsTable).omit({
  id: true,
  pointsEarned: true,
  pointsRedeemed: true,
  visitDate: true,
  createdAt: true,
});

export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visitsTable.$inferSelect;
