# EduAdmin Pro

Multi-tenant school administration platform for Indonesian schools — attendance, grading, e-raport, and AI-assisted teaching documents, with strict per-school data isolation enforced at the database level.

**Live demo:** https://adminslop.vercel.app

The interface is in Bahasa Indonesia and mobile-first, built for teachers and school administrators (SD/SMP/SMA/SMK and madrasah).

## Features

- **Multi-school tenancy** — users can belong to several schools and switch the active school explicitly; every record is isolated per school with PostgreSQL Row-Level Security
- **Student and class management** — student records with lifecycle states (active, transferred, graduated), class groups per academic year/semester, promotion with full placement history, and spreadsheet-based import with validation
- **Daily attendance** — per-student daily attendance (Hadir/Izin/Sakit/Alpa) with QR-assisted capture
- **Grading and e-raport** — teacher-created assessments, per-student scores, traceable final grades, and semester report cards with a draft/issued/revision workflow so official reports never change silently
- **AI-assisted teaching content** — draft lesson-planning documents (Modul Ajar, RPP, ATP) and question-bank items with AI, with mandatory teacher review before anything becomes official
- **Question bank** — reusable question items with answer keys and explanations, assembled into question packages for quizzes and exams
- **Printable documents** — controlled print templates with school identity, signature, and stamp areas, plus A4/F4 print preferences and preview
- **Offline-tolerant workflows** — safe tasks like attendance entry keep working on poor connections, with visible pending changes and conflict-safe synchronization

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Database:** PostgreSQL with Row-Level Security, Drizzle ORM
- **Auth:** WorkOS AuthKit
- **UI:** Tailwind CSS v4, shadcn/ui, Motion
- **Testing:** Vitest + Testing Library, Playwright (e2e)
- **Infra:** Docker Compose for local Postgres, Vercel for deployment

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for the local PostgreSQL instance)
- A [WorkOS](https://workos.com) sandbox environment for auth

### Install and run

```bash
npm install

# Copy env template and fill in WorkOS sandbox credentials
cp .env.example .env

# Start Postgres (provisions app + migrator roles), migrate, seed
npm run db:up
npm run db:migrate
npm run db:seed

npm run dev
```

Open http://localhost:3000. Health check: `GET /health` → `{ "status": "ok" }`.

### Environment variables

See `.env.example` for the full annotated list. The essentials:

| Variable | Purpose |
|---|---|
| `WORKOS_API_KEY` | Server-only WorkOS API key (`sk_test_*` in sandbox) |
| `WORKOS_CLIENT_ID` | Public WorkOS client ID |
| `WORKOS_COOKIE_PASSWORD` | Session cookie seal secret (`openssl rand -base64 48`) |
| `DATABASE_URL` | App connection (non-superuser role, RLS enforced) |
| `DATABASE_MIGRATOR_URL` | Privileged connection used only by migrations |

### Useful commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Lint / type-check | `npm run lint` · `npm run typecheck` |
| Unit tests | `npm run test:run` |
| E2E tests | `npm run e2e` |
| Reset local DB | `npm run db:reset` |

## Documentation

- [`docs/domain-glossary.md`](docs/domain-glossary.md) — canonical domain language (tenancy, grading, e-raport, AI review workflow)
- [`docs/architecture/`](docs/architecture) — identity/access model and migration strategy
- [`docs/adr/`](docs/adr) — architecture decision records

## License

MIT — see [LICENSE](LICENSE).
