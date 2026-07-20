import { Router, type IRouter } from "express";
import { db, customersTable, visitsTable, redemptionsTable } from "@workspace/db";
import { count, eq, gte, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalCustomers] = await db.select({ count: count() }).from(customersTable);
  const [activeCustomers] = await db
    .select({ count: count() })
    .from(customersTable)
    .where(eq(customersTable.isActive, true));
  const [visitsToday] = await db
    .select({ count: count() })
    .from(visitsTable)
    .where(gte(visitsTable.visitDate, todayStart));
  const [visitsThisMonth] = await db
    .select({ count: count() })
    .from(visitsTable)
    .where(gte(visitsTable.visitDate, monthStart));
  const [totalVisits] = await db.select({ count: count() }).from(visitsTable);
  const [totalRedemptions] = await db.select({ count: count() }).from(redemptionsTable);

  res.json({
    totalCustomers: totalCustomers.count,
    activeCustomers: activeCustomers.count,
    visitsToday: visitsToday.count,
    visitsThisMonth: visitsThisMonth.count,
    totalVisitsAllTime: totalVisits.count,
    totalRedemptions: totalRedemptions.count,
  });
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const recentVisits = await db
    .select({
      id: visitsTable.id,
      type: sql<string>`'visit'`,
      customerName: customersTable.fullName,
      tier: sql<string | null>`null`,
      description: sql<string>`'Visita registada — ' || ${visitsTable.mealsCount} || ' refeição/refeições'`,
      timestamp: visitsTable.visitDate,
    })
    .from(visitsTable)
    .innerJoin(customersTable, eq(visitsTable.customerId, customersTable.id))
    .orderBy(sql`${visitsTable.visitDate} DESC`)
    .limit(10);

  const recentRedemptions = await db
    .select({
      id: redemptionsTable.id,
      type: sql<string>`'redemption'`,
      customerName: customersTable.fullName,
      tier: sql<string | null>`null`,
      description: sql<string>`'Recompensa utilizada: ' || ${redemptionsTable.rewardType}`,
      timestamp: redemptionsTable.redeemedAt,
    })
    .from(redemptionsTable)
    .innerJoin(customersTable, eq(redemptionsTable.customerId, customersTable.id))
    .orderBy(sql`${redemptionsTable.redeemedAt} DESC`)
    .limit(5);

  const recentCustomers = await db
    .select({
      id: customersTable.id,
      type: sql<string>`'new_customer'`,
      customerName: customersTable.fullName,
      tier: sql<string | null>`null`,
      description: sql<string>`'Novo cliente registado'`,
      timestamp: customersTable.createdAt,
    })
    .from(customersTable)
    .orderBy(sql`${customersTable.createdAt} DESC`)
    .limit(5);

  const all = [...recentVisits, ...recentRedemptions, ...recentCustomers]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15)
    .map((item) => ({
      ...item,
      timestamp: new Date(item.timestamp).toISOString(),
    }));

  res.json(all);
});

router.get("/dashboard/birthdays-today", async (_req, res): Promise<void> => {
  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();

  const customers = await db
    .select()
    .from(customersTable)
    .where(
      and(
        eq(customersTable.isActive, true),
        eq(customersTable.birthMonth, todayMonth),
        eq(customersTable.birthDay, todayDay)
      )
    );

  res.json(
    customers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      birthMonth: c.birthMonth,
      birthDay: c.birthDay,
      qrCodeToken: c.qrCodeToken,
      totalMeals: c.totalMeals,
      freeMealProgress: c.totalMeals % 5,
      freeMealsAvailable: c.currentPoints,
      lastVisitAt: c.lastVisitAt?.toISOString() ?? null,
      consentMarketing: c.consentMarketing,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    }))
  );
});

export default router;
