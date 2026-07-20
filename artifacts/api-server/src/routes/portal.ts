import { Router } from "express";
import { eq, desc, gte, lt, and } from "drizzle-orm";
import { db, customersTable, visitsTable } from "@workspace/db";
import { PortalCheckinBody } from "@workspace/api-zod";
import { verifyToken, extractBearerToken } from "../lib/auth.js";
import {
  didEarnFreeMeal,
  getMealPeriod,
  getMealCredit,
  getPeriodBounds,
} from "../lib/loyalty.js";

const router = Router();

function formatCustomer(c: typeof customersTable.$inferSelect) {
  const { currentPoints, tier, tierAchievedAt, updatedAt, ...rest } = c;
  return {
    ...rest,
    lastVisitAt: c.lastVisitAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    freeMealProgress: c.totalMeals % 5,
    freeMealsAvailable: currentPoints,
  };
}

async function requireAuth(req: any, res: any): Promise<number | null> {
  const token = extractBearerToken(req.headers["authorization"]);
  if (!token) {
    res.status(401).json({ error: "Token de autenticação em falta" });
    return null;
  }
  const customerId = verifyToken(token);
  if (!customerId) {
    res.status(401).json({ error: "Token inválido ou expirado" });
    return null;
  }
  return customerId;
}

// GET /portal/me
router.get("/portal/me", async (req, res) => {
  const customerId = await requireAuth(req, res);
  if (!customerId) return;

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, customerId))
    .limit(1);

  if (!customer) {
    res.status(401).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json(formatCustomer(customer));
});

// POST /portal/checkin
router.post("/portal/checkin", async (req, res) => {
  const customerId = await requireAuth(req, res);
  if (!customerId) return;

  // Restrict check-in to opening hours: breakfast 7:30–11:00 or dinner 19:00–23:00
  const now = new Date();
  const period = getMealPeriod(now);
  if (!period) {
    res.status(403).json({
      error: "Check-in disponível ao pequeno-almoço (7h30–11h00) e ao jantar (19h00–23h00).",
    });
    return;
  }

  // Prevent double check-in within the same period
  const { start: periodStart, end: periodEnd } = getPeriodBounds(now, period);
  const [existingVisit] = await db
    .select({ id: visitsTable.id })
    .from(visitsTable)
    .where(
      and(
        eq(visitsTable.customerId, customerId),
        gte(visitsTable.visitDate, periodStart),
        lt(visitsTable.visitDate, periodEnd)
      )
    )
    .limit(1);

  if (existingVisit) {
    const periodLabel = period === "breakfast" ? "pequeno-almoço" : "jantar";
    res.status(400).json({
      error: `Já fizeste o check-in neste ${periodLabel}. Volta na próxima refeição!`,
    });
    return;
  }

  const parsed = PortalCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, customerId))
    .limit(1);

  if (!customer) {
    res.status(401).json({ error: "Cliente não encontrado" });
    return;
  }

  const mealsCount = getMealCredit(period);
  const prevTotalMeals = customer.totalMeals;
  const newTotalMeals = prevTotalMeals + mealsCount;
  const freeMealEarned = didEarnFreeMeal(prevTotalMeals, newTotalMeals);

  const notes = parsed.data.notes ?? null;
  const tableNote = parsed.data.tableNumber != null
    ? `Mesa ${parsed.data.tableNumber}${notes ? ` — ${notes}` : ""}`
    : notes;

  const [visit] = await db
    .insert(visitsTable)
    .values({
      customerId,
      mealsCount,
      pointsEarned: mealsCount,
      pointsRedeemed: 0,
      notes: tableNote,
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
    .where(eq(customersTable.id, customerId))
    .returning();

  res.status(201).json({
    visit: {
      id: visit.id,
      customerId: visit.customerId,
      visitDate: visit.visitDate.toISOString(),
      mealsCount: visit.mealsCount,
      pointsEarned: visit.pointsEarned,
      pointsRedeemed: visit.pointsRedeemed,
      notes: visit.notes,
      rewardUsed: null,
    },
    customer: formatCustomer(updatedCustomer),
    freeMealEarned,
  });
});

// GET /portal/visits
router.get("/portal/visits", async (req, res) => {
  const customerId = await requireAuth(req, res);
  if (!customerId) return;

  const visits = await db
    .select()
    .from(visitsTable)
    .where(eq(visitsTable.customerId, customerId))
    .orderBy(desc(visitsTable.visitDate));

  res.json(
    visits.map((v) => ({
      id: v.id,
      customerId: v.customerId,
      visitDate: v.visitDate.toISOString(),
      mealsCount: v.mealsCount,
      pointsEarned: v.pointsEarned,
      pointsRedeemed: v.pointsRedeemed,
      notes: v.notes,
      rewardUsed: null,
    }))
  );
});

export default router;
