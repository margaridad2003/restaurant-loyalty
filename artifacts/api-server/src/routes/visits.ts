import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, customersTable, visitsTable } from "@workspace/db";
import {
  RegisterVisitBody,
  GetCustomerVisitsParams,
} from "@workspace/api-zod";
import {
  didEarnFreeMeal,
  getMealPeriod,
  getMealCredit,
} from "../lib/loyalty.js";

const router: IRouter = Router();

function enrichCustomer(c: typeof customersTable.$inferSelect) {
  const { currentPoints, tier, tierAchievedAt, updatedAt, ...rest } = c;
  return {
    ...rest,
    lastVisitAt: c.lastVisitAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    freeMealProgress: c.totalMeals % 5,
    freeMealsAvailable: currentPoints,
  };
}

router.get("/customers/:id/visits", async (req, res): Promise<void> => {
  const params = GetCustomerVisitsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const visits = await db
    .select()
    .from(visitsTable)
    .where(eq(visitsTable.customerId, params.data.id))
    .orderBy(desc(visitsTable.visitDate));

  res.json(
    visits.map((v) => ({
      ...v,
      visitDate: v.visitDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
    }))
  );
});

router.post("/visits", async (req, res): Promise<void> => {
  const parsed = RegisterVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, parsed.data.customerId))
    .limit(1);

  if (!customer) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  // Auto-detect period to determine meal credit; default to 1 outside hours (staff correction)
  const now = new Date();
  const period = getMealPeriod(now);
  const mealsCount = period ? getMealCredit(period) : 1;

  const prevTotalMeals = customer.totalMeals;
  const newTotalMeals = prevTotalMeals + mealsCount;
  const freeMealEarned = didEarnFreeMeal(prevTotalMeals, newTotalMeals);

  const [visit] = await db
    .insert(visitsTable)
    .values({
      customerId: parsed.data.customerId,
      mealsCount,
      pointsEarned: mealsCount,
      pointsRedeemed: 0,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  const newFreeMealsAvailable = customer.currentPoints + (freeMealEarned ? 1 : 0);

  const [updatedCustomer] = await db
    .update(customersTable)
    .set({
      currentPoints: newFreeMealsAvailable,
      totalMeals: newTotalMeals,
      lastVisitAt: new Date(),
    })
    .where(eq(customersTable.id, customer.id))
    .returning();

  res.status(201).json({
    visit: {
      ...visit,
      visitDate: visit.visitDate.toISOString(),
      createdAt: visit.createdAt.toISOString(),
    },
    customer: enrichCustomer(updatedCustomer),
    freeMealEarned,
  });
});

export default router;
