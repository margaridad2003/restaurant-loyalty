# Ficheiro de Clientes

Sistema de fidelização para restaurante com níveis gamificados (Bronze → Prata → Ouro → Platina → VIP).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/loyalty-app run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind + shadcn/ui + TanStack Query

## Where things live

- `lib/db/src/schema/` — DB tables: customers, visits, redemptions
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation
- `artifacts/api-server/src/routes/` — Express route handlers (customers, visits, rewards, dashboard)
- `artifacts/api-server/src/lib/loyalty.ts` — tier logic, points calculation
- `artifacts/loyalty-app/src/` — React frontend

## Architecture decisions

- **Hybrid points system**: 10 pts per meal (no euro-based tracking, removed per user request)
- **Tier gates use dual criteria**: minimum points AND minimum meals to prevent single-visit tier jumps
- **No authentication on first build**: staff backoffice is open; auth can be added via Clerk
- **Points never decrease on tier downgrade**: only `currentPoints` resets after 12-month inactivity (job not yet implemented)
- **QR token generated server-side**: random 32-char hex, stored in DB, used for check-in lookup

## Product

- **Dashboard**: live stats (active customers, visits today/month, redemptions), activity feed, tier distribution
- **Customer list**: search by name/phone, filter by tier
- **Customer profile**: tier badge, progress bar to next level, visit history, reward redemption
- **Quick check-in**: staff searches by phone, registers visit (meals count), sees points earned + tier upgrade
- **New customer registration**: name, phone, optional email + birthday month/day

## Tier system

| Nível    | Pontos mínimos | Refeições mínimas |
|----------|---------------|-------------------|
| Bronze   | 0             | —                 |
| Prata    | 300           | 10                |
| Ouro     | 700           | 25                |
| Platina  | 1500          | 50                |
| VIP      | 3000          | 100               |

## User preferences

- Sem campo `total_spent_eur` — sistema baseado apenas em refeições e pontos

## Gotchas

- After any OpenAPI spec change, always re-run codegen before writing route handlers
- `pnpm --filter @workspace/db run push` must be run after schema changes
- Route `/customers/phone/:phone` must be registered BEFORE `/customers/:id` to avoid Express matching "phone" as an ID

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
