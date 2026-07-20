import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import {
  CreateCustomerBody,
  GetCustomerParams,
  UpdateCustomerParams,
  UpdateCustomerBody,
  GetCustomerByPhoneParams,
  ListCustomersQueryParams,
} from "@workspace/api-zod";
import { generateQrToken } from "../lib/loyalty";

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

router.get("/customers", async (req, res): Promise<void> => {
  const parsed = ListCustomersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search } = parsed.data;

  let query = db.select().from(customersTable).$dynamic();

  if (search) {
    query = query.where(
      or(
        ilike(customersTable.fullName, `%${search}%`),
        ilike(customersTable.phone, `%${search}%`)
      )
    );
  }

  const customers = await query.orderBy(customersTable.createdAt);
  res.json(customers.map(enrichCustomer));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.phone, parsed.data.phone))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Número de telemóvel já registado" });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values({
      ...parsed.data,
      qrCodeToken: generateQrToken(),
      consentDataProcessing: true,
    })
    .returning();

  res.status(201).json(enrichCustomer(customer));
});

router.get("/customers/phone/:phone", async (req, res): Promise<void> => {
  const params = GetCustomerByPhoneParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.phone, params.data.phone))
    .limit(1);

  if (!customer) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json(enrichCustomer(customer));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
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

  res.json(enrichCustomer(customer));
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db
    .update(customersTable)
    .set(parsed.data)
    .where(eq(customersTable.id, params.data.id))
    .returning();

  if (!customer) {
    res.status(404).json({ error: "Cliente não encontrado" });
    return;
  }

  res.json(enrichCustomer(customer));
});

export default router;
