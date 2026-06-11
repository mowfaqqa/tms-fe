# Tenancy Manager — Frontend (`tms-fe`)

Web app for the **A.T Tenancy Reminder & Notice Management System**. Property
managers and admin staff use it to track tenancy expiry, act on automated
reminders, manage tenants, and issue notices. It talks to the [`tms-be`](../tms-be)
backend API.

## Stack
- **Next.js** (App Router) + **TypeScript** + **Tailwind v4**
- **shadcn/ui** (Radix) components, **lucide** icons
- **TanStack Query** for server state, **axios** API client
- **react-hook-form + zod** forms, **sonner** toasts, **date-fns**

## Features
- JWT auth (login, forgot/reset password) with client-side route guarding and
  role-aware UI (`ADMIN` vs `STAFF`).
- **Dashboard** — metric cards (active, expiring 6m/3m/30d, expired) and an
  Upcoming Actions table with one-click reminder acknowledgement; admins can
  trigger the reminder sweep.
- **Tenants** — searchable, filterable, paginated list; detail view with the
  reminders timeline and issued notices; create/edit forms.
- **Notices** — generate quit/renewal/general notices, edit drafts, issue them
  (emails the tenant), and download the PDF.
- **Notifications** — list with unread filtering, mark-read / mark-all-read, and
  a live unread badge in the topbar.
- **Reports** — upcoming expirations, active, and expired tenants, with CSV
  export.

## Getting started

**1. Start the backend** (in `../tms-be`):
```bash
docker compose up -d --build   # API on http://localhost:3000
```

**2. Configure and run the frontend:**
```bash
cp .env.example .env.local      # NEXT_PUBLIC_API_URL=http://localhost:3000
npm install
npm run dev -- -p 3001          # use a port other than the backend's 3000
```
Open `http://localhost:3001` and sign in with the seeded admin
(`admin@example.com` / `ChangeMe123!`).

> The backend occupies port 3000, so run the frontend on another port (e.g.
> 3001). `NEXT_PUBLIC_API_URL` should point at the backend (3000).

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Dev server (add `-- -p 3001` to avoid the backend's port) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint |

## Project structure
```
src/
  app/
    (auth)/        login, forgot-password, reset-password
    (app)/         guarded shell: dashboard, tenants, notices, notifications, reports
  components/
    ui/            shadcn primitives
    layout/        sidebar, topbar
    shared/        page header, status badge, pagination, empty state, confirm dialog
    tenants/ notices/ dashboard/ reports/   feature components
  lib/
    api/           axios client + per-domain API modules
    hooks/         React Query hooks
    auth/          auth context + token storage
    types.ts labels.ts format.ts query-keys.ts csv.ts
```

## Configuration
| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend API base URL |

The full API contract this app is built against is documented in
[`../tms-be/docs/FRONTEND_GUIDE.md`](../tms-be/docs/FRONTEND_GUIDE.md).
