# Expense Easy — Full-Stack Scaffold

Generated against three source documents:
- `EMS-ExpenseEasy33.html` — the visual design system (colors, type, components)
- `Full_Stack_Application_Architecture_and_Deployment_Plan.pdf` — the target stack
- `Role-Based_Menu_Visibility___Authorization.pdf` — the RBAC spec

## What's implemented (Phases 1–3)

**Backend** (`/backend`, NestJS + Prisma + PostgreSQL)
- Full DB schema covering every table listed in the architecture doc §3
- JWT auth: short-lived access tokens + rotating refresh tokens in HttpOnly cookies, argon2 password hashing, login-attempt logging, refresh-token-reuse detection
- RBAC core: `MenuPermissionService` implements the exact access matrix from the RBAC spec (`isApprovingAuthority` tracked independently of role, as required); `MenuGuard` + `@RequireMenu()` enforce it on every route
- Jest tests covering all 16 test cases + edge cases from the RBAC spec (`src/rbac/menu-permission.service.spec.ts`)
- Seed script creating one demo login per test case (see below)

**Frontend** (`/frontend`, React + TypeScript + Vite + Tailwind)
- Design tokens and components (`Button`, `Panel`, `StatusPill`, `KpiCard`, `Table`, `Sidebar`, `TopBar`) ported from the HTML demo's color palette, typography, and spacing
- `canAccessMenu()` — a client-side mirror of the backend's permission function, used only to decide what renders
- `ProtectedRoute` — redirects unauthenticated users to `/login` and unauthorized users to `/unauthorized`, so a bookmarked/typed URL can't bypass the matrix (this is still just the UI half — the API independently rejects the same request)
- Auth context with silent refresh-on-load, login/logout, axios client with automatic 401→refresh→retry

**Deployment**
- `docker-compose.yml` — Postgres, Redis, backend, frontend, NGINX
- `nginx/nginx.conf` — routes `/` to the frontend, `/api` to the backend, with basic security headers and API rate limiting (per architecture doc §12–13)

## Not yet built

The feature modules themselves are scaffolded as placeholder pages only:
- Expense entry, approvals workflow, declaration vouchers, bulk reports, notifications, audit log UI, reports/export, Company Admin & Super Admin consoles
- The full component library from the 14k-line demo (only the base primitives were ported)
- CI/CD, automated backups, background job queue (Redis-backed) wiring

## A note on base image versions

The Dockerfiles and `docker-compose.yml` intentionally use **floating** minor-version tags (`node:20-alpine`, `postgres:16-alpine`, `redis:7-alpine`, `nginxinc/nginx-unprivileged:1.27-alpine`) rather than exact patch/Alpine-sub-version pins. Docker's official images rebuild these tags regularly with security patches; a frozen patch pin (e.g. `postgres:16.4-alpine3.20`) stops receiving those rebuilds the moment a newer patch ships, which quietly gets *less* secure over time, not more. If you want reproducible, pinned builds for production, pin to a **digest** you've verified yourself once your CI is in place to re-pin on a schedule:

```bash
docker pull node:20-alpine
docker inspect --format='{{index .RepoDigests 0}}' node:20-alpine
# node@sha256:<digest> — use this in FROM instead of the tag
```

## Local development

```bash
cp .env.example .env        # then fill in real secrets
docker compose up --build
```

Once up:
```bash
docker compose exec backend npx prisma migrate dev --name init
docker compose exec backend npm run prisma:seed
```

The seed script prints a shared demo password. Each of the 11 demo accounts
corresponds to one row of the RBAC spec's test-case table (TC-01–TC-11) —
log in as any of them and confirm the sidebar and route access match the
matrix exactly.

Visit `http://localhost` (routed through the NGINX container).

## Deploying to Hostinger VPS via Dokploy

1. Push this repo to GitHub.
2. In Dokploy, create a new project and point it at the repo; it will pick up `docker-compose.yml`.
3. Set the environment variables from `.env.example` in Dokploy's env panel — **never commit real secrets**. Generate `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` with `openssl rand -base64 48`.
4. Point your domain's DNS at the VPS, and let Dokploy (or NGINX/Certbot in front of it) terminate HTTPS — the app's `nginx.conf` here handles plain HTTP; add a `443 ssl` server block or let Dokploy's proxy do it, per architecture doc §11.
5. On first deploy, run the migration + seed commands above inside the backend container (drop the seed step once you have real users).

## Extending the RBAC matrix

If the access rules ever change, **`backend/src/rbac/menu-permission.service.ts` is the single source of truth.** Update it and its test file first; then port the same change to `frontend/src/lib/canAccessMenu.ts`. The frontend copy is UI convenience only — it is never what actually protects anything.
