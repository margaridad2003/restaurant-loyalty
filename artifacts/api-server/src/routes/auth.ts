import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import { AuthCustomerBody, AuthRegisterBody } from "@workspace/api-zod";
import { signToken } from "../lib/auth.js";
import { generateQrToken } from "../lib/loyalty.js";

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

// POST /auth/customer — login by phone
router.post("/auth/customer", async (req, res) => {
  const parsed = AuthCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Número de telefone inválido" });
    return;
  }

  const { phone } = parsed.data;
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.phone, phone))
    .limit(1);

  if (!customer) {
    res.status(404).json({ error: "Telefone não registado" });
    return;
  }

  const token = signToken(customer.id);
  res.json({ token, customer: formatCustomer(customer) });
});

// POST /auth/register — register new customer and return token
router.post("/auth/register", async (req, res) => {
  const parsed = AuthRegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos" });
    return;
  }

  const { fullName, phone, email, birthMonth, birthDay, consentMarketing } =
    parsed.data;

  const existing = await db
    .select({ id: customersTable.id })
    .from(customersTable)
    .where(eq(customersTable.phone, phone))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Número de telefone já registado" });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values({
      fullName,
      phone,
      email: email ?? null,
      birthMonth: birthMonth ?? null,
      birthDay: birthDay ?? null,
      consentMarketing: consentMarketing ?? false,
      qrCodeToken: generateQrToken(),
      currentPoints: 0,
      totalMeals: 0,
      tier: "bronze",
      isActive: true,
    })
    .returning();

  const token = signToken(customer.id);
  res.status(201).json({ token, customer: formatCustomer(customer) });
});

export default router;
