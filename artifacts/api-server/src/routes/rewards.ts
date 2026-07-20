import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customersTable, redemptionsTable } from "@workspace/db";
import {
  RedeemRewardBody,
  GetCustomerRedemptionsParams,
} from "@workspace/api-zod";

const REWARD_DISCOUNT_50 = "desconto_50";
const REWARD_BIRTHDAY = "aniversario";

const router: IRouter = Router();

router.post("/rewards/redemptions", async (req, res): Promise<void> => {
  const parsed = RedeemRewardBody.safeParse(req.body);
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

  if (parsed.data.rewardType === REWARD_DISCOUNT_50) {
    if (customer.currentPoints <= 0) {
      res.status(400).json({ error: "Sem descontos disponíveis" });
      return;
    }

    const [redemption] = await db
      .insert(redemptionsTable)
      .values({
        customerId: parsed.data.customerId,
        rewardType: parsed.data.rewardType,
        visitId: parsed.data.visitId ?? null,
      })
      .returning();

    await db
      .update(customersTable)
      .set({ currentPoints: customer.currentPoints - 1 })
      .where(eq(customersTable.id, customer.id));

    res.status(201).json({
      ...redemption,
      redeemedAt: redemption.redeemedAt.toISOString(),
      createdAt: redemption.createdAt.toISOString(),
      customerName: customer.fullName,
    });
    return;
  }

  if (parsed.data.rewardType === REWARD_BIRTHDAY) {
    const [redemption] = await db
      .insert(redemptionsTable)
      .values({
        customerId: parsed.data.customerId,
        rewardType: parsed.data.rewardType,
        visitId: parsed.data.visitId ?? null,
      })
      .returning();

    res.status(201).json({
      ...redemption,
      redeemedAt: redemption.redeemedAt.toISOString(),
      createdAt: redemption.createdAt.toISOString(),
      customerName: customer.fullName,
    });
    return;
  }

  res.status(400).json({ error: "Tipo de recompensa inválido" });
});

router.get("/customers/:id/redemptions", async (req, res): Promise<void> => {
  const params = GetCustomerRedemptionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id))
    .limit(1);

  if (!customer) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  const redemptions = await db
    .select()
    .from(redemptionsTable)
    .where(eq(redemptionsTable.customerId, params.data.id))
    .orderBy(redemptionsTable.redeemedAt);

  res.json(
    redemptions.map((r) => ({
      ...r,
      redeemedAt: r.redeemedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      customerName: customer.fullName,
    }))
  );
});

export default router;
