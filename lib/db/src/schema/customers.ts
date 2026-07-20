import { pgTable, text, integer, boolean, timestamp, serial, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  birthMonth: integer("birth_month"),
  birthDay: integer("birth_day"),
  qrCodeToken: text("qr_code_token").notNull().unique(),
  tier: text("tier").notNull().default("bronze"),
  currentPoints: integer("current_points").notNull().default(0),
  totalMeals: real("total_meals").notNull().default(0),
  tierAchievedAt: timestamp("tier_achieved_at", { withTimezone: true }),
  lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
  consentMarketing: boolean("consent_marketing").notNull().default(false),
  consentDataProcessing: boolean("consent_data_processing").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  qrCodeToken: true,
  currentPoints: true,
  totalMeals: true,
  tier: true,
  tierAchievedAt: true,
  lastVisitAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
