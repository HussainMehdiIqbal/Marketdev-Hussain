# DevMarket3D — 3D Developer Project Marketplace & Source Code Store

A full-stack marketplace for selling software projects/source code, with PKR checkout,
manual (human-verified) payment approval, and secure, authorization-gated downloads.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma + MySQL, NextAuth.js
(credentials), and React Three Fiber for the 3D hero.

---

## ⚠️ Important: run `npm install` and the DB setup on a machine with normal internet access

This project was built in a sandboxed environment whose network egress is restricted to a
small allowlist of domains. That allowlist does **not** include `binaries.prisma.sh`, which
`prisma generate` needs to download its query-engine binary. As a result:

- All application code was written and passed **ESLint** and a **TypeScript check** (`tsc --noEmit`)
  with zero real errors — the only errors seen there were the expected cascade from
  `@prisma/client` not being generated yet (missing exports like `PrismaClient`, `Prisma`,
  `OrderStatus`, and the resulting implicit `any` on query results).
- `npm run build` / `next build` could **not** be executed end-to-end here, because Next's
  build needs the generated Prisma client to type-check the API routes and Server Components.
- On your own machine (or any environment with normal internet access), `npm install` will
  run `prisma generate` automatically via the `postinstall` script, and everything above
  resolves itself. Please run `npm run build` locally before deploying to catch anything
  environment-specific.

---

## 1. Prerequisites

- Node.js 20+
- A MySQL 8+ database (local or hosted — PlanetScale, Railway, RDS, a local `mysql` install, etc.)

## 2. Setup

```bash
npm install                 # also runs `prisma generate` via postinstall
cp .env.example .env        # then fill in DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, etc.
```

Generate a secret for `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Database

```bash
npm run db:push      # creates all tables from prisma/schema.prisma (fastest way to get started)
# or, for tracked migrations instead of db push:
npm run db:migrate

npm run db:seed       # creates your first admin account + starter categories/technologies
```

The seed script reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` from `.env` — it refuses
to run without them, and there is no hard-coded default admin password anywhere in the code.
Log in at `/admin/login` with those credentials, then add real payment methods and projects
from the admin panel (`/admin/payment-methods`, `/admin/projects/new`).

## 4. Run it

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## 5. Private file storage

Source code ZIPs and payment screenshots are written to `PRIVATE_STORAGE_PATH` (default
`./private-storage`, git-ignored) — never to `/public`. The only way a ZIP ever leaves that
folder is through `GET /api/download/[orderId]`, which checks, in order: authenticated
session → order ownership → payment status is `VERIFIED`/`COMPLETED`, before streaming the
file and logging the download. For production behind a process manager or serverless
platform, point `PRIVATE_STORAGE_PATH` at a persistent volume (local disk doesn't survive
redeploys on most serverless hosts — if you outgrow a single VM, swap `src/lib/storage.ts`
for an S3-compatible backend; the function signatures are designed to make that a contained
change).

## What's implemented

- Full Prisma/MySQL schema: users, projects, categories, technologies, orders, payments,
  payment methods, downloads, notifications, licenses, installation guides, admin logs
- NextAuth.js credentials auth (bcrypt, JWT sessions, `USER`/`ADMIN` roles), with middleware
  protecting `/dashboard/*` and `/admin/*`
- Public catalog with search/filter/sort, project detail pages, Buy Now → order creation
- PKR checkout: payment method selection → payment instructions → proof-of-payment upload
  (JPG/PNG/WebP, validated) → 30-minute backend-timestamped verification countdown
  (`VERIFICATION_WINDOW_MINUTES` in `.env`) that **never** auto-approves
- Admin verification queue: view payment proof, Verify (generates a license code, unlocks
  download, notifies the buyer) or Reject (with a reason, notifies the buyer)
- Secure download endpoint enforcing auth + ownership + verified payment before ever reading
  the private ZIP; every download is logged with IP and timestamp
- Admin panel: dashboard with live stats + revenue chart, project CRUD with ZIP upload,
  database-driven payment methods (no hard-coded banks), users, downloads log, notifications,
  admin action audit log (`AdminLog`)
- All 20 requested pages, SEO metadata + Open Graph on project pages, custom 404/error pages,
  responsive layout throughout

## What's stubbed / worth wiring up next

- **Email notifications** — in-app notifications are fully implemented; SMTP is scaffolded in
  `.env.example` but not yet wired to actually send mail on order/payment events.
- **Forgot-password / Contact forms** — UI + client-side flow are built; both currently simulate
  submission. Wire `/api/forgot-password` (token + email) and `/api/contact` (SMTP) when ready.
- **Installation guide authoring UI** — the schema (`InstallationGuide.content`, a block-based
  JSON array) and the purchaser-facing renderer (`installation-guide-renderer.tsx`) are done;
  there's no dedicated admin editor UI yet — populate `content` directly via Prisma Studio
  (`npm run db:studio`) or extend the project edit form with a block editor.
- **QR code uploads for payment methods** — the field (`qrCodeUrl`) exists end-to-end; the
  admin form currently expects a URL rather than a file upload.
