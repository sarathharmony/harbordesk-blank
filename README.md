# HarborDesk

Booking and invoicing for independent recording and photo studios.

Built on the ACE beta starter (NestJS + React/Vite).

## Features

- **Clients** — name, email, phone, notes; list, create, edit
- **Bookings** — calendar-style day view; held / confirmed / cancelled; hourly rate
- **Invoices** — from confirmed bookings or manual; draft / sent / paid
- **Public booking** — `#/book` for visitors (no login)

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 (staff) or http://localhost:5173/#/book (public booking).

API health: `GET /api/health`

Data persists in `packages/backend/data/harbordesk.json`.
