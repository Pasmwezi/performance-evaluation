# Performance Evaluation App (PerfEval)

[![CI Pipeline](https://github.com/Pasmwezi/performance-evaluation/actions/workflows/ci.yml/badge.svg)](https://github.com/Pasmwezi/performance-evaluation/actions)

PerfEval is a secure procurement QA performance tracker for recording, reviewing, and monitoring contractor and consultant evaluations. It provides authorized Protected B users with a dashboard, evaluation entry forms, vendor profile pages, score history, uploaded form storage, and an underperforming watchlist.

## App Functionality

- Authenticated access with user registration, login, sign out, Admin-managed user groups, and Protected B authorization.
- Procurement dashboard with counts for contractors, consultants, total evaluations, and flagged vendors.
- Underperforming watchlist for contractors or consultants whose average evaluation score is below 60.
- Contractor evaluation workflow with vendor selection or new contractor creation.
- Consultant evaluation workflow with firm selection or new consultant creation.
- Automatic total score calculation from five 20-point categories.
- Contractor scoring categories: quality of workmanship, time, project management, contract management, and health and safety.
- Consultant scoring categories: design, quality of results, management, time, and cost.
- Vendor list pages showing average score, evaluation count, status, and score bar.
- Vendor detail pages showing evaluation history and average standing.
- Individual evaluation detail pages with contract details, project manager contact information, comments, scores, and downloadable uploaded forms.
- Optional PDF/form upload for each evaluation, stored outside `public` and served only through a Protected B authorized download route.

## Tech Stack

- Next.js 16 App Router
- React 19
- NextAuth credentials authentication
- Prisma 7
- PostgreSQL
- Docker Compose for local production-style runs

## Main Routes

- `/` - protected procurement dashboard
- `/login` - sign in
- `/register` - create user account
- `/admin/users` - Admin-only user group and Protected B access management
- `/admin/audit` - Admin-only security audit log tracker
- `/reports` - procurement QA reports with charts and trend analytics
- `/contractors` - contractor performance list
- `/contractors/[id]` - contractor profile and evaluation history
- `/contractors/[id]/evaluations/[evaluationId]` - contractor evaluation detail
- `/contractor/new` - create contractor evaluation
- `/consultants` - consultant performance list
- `/consultants/[id]` - consultant profile and evaluation history
- `/consultants/[id]/evaluations/[evaluationId]` - consultant evaluation detail
- `/consultant/new` - create consultant evaluation

## Environment

Create a `.env` file with values like:

```env
DATABASE_URL="postgresql://user:password@localhost:5433/performance_eval?schema=public"
NEXTAUTH_SECRET="super-secret-key-for-dev-only"
NEXTAUTH_URL="http://localhost:3001"
PROTECTED_B_ADMIN_EMAILS="security.officer@example.com"
PROTECTED_B_AUTHORIZED_EMAILS="project.manager@example.com"
PROTECTED_UPLOAD_DIR="./protected-uploads"
WEB_PORT=3001
POSTGRES_PORT=5433
```

For Docker Compose, the web container connects to PostgreSQL through the internal `db` service while the host machine can reach the database on `POSTGRES_PORT`. `PROTECTED_B_ADMIN_EMAILS` bootstraps the first Admins. Admins can then manage users from `/admin/users`. `PROTECTED_B_AUTHORIZED_EMAILS` remains available as a temporary bootstrap allowlist for contracting officers, but normal access should be granted in the app.

## Run With Docker

```bash
docker compose up -d --build
```

The app will be available at:

```text
http://localhost:3001
```

If port `3001` is already in use, either stop the process using it or change `WEB_PORT` and `NEXTAUTH_URL` in `.env` to another matching port.

## Run Locally

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

By default, Next.js serves the local dev app at:

```text
http://localhost:3000
```

If you want local development to use port `3001`, start Next.js with a port flag and keep `NEXTAUTH_URL` aligned:

```bash
npx next dev -p 3001
```

## Seed Data

The project includes a Prisma seed script with sample contractor and consultant evaluation data.

```bash
npx prisma db seed
```

## System Architecture & Components

```mermaid
graph TD
    Client[Web Browser] -->|HTTPS| Proxy[proxy.ts - Routing Security & HSTS]
    Proxy -->|API/Page Requests| Web[Next.js App Server]
    Web -->|Database Queries| DB[(PostgreSQL Database)]
    Web -->|File Storage| Storage[Protected Storage - protected-uploads/]
```

## User Roles & Permissions

- `ADMIN`: full administration access. Can manage user roles, reset user passwords, and view immutable security audit logs.
- `CONTRACTING_OFFICER`: standard user role. Can view contractor/consultant listings, submit new evaluations, and download/upload forms once granted Protected B access.
- `EVALUATOR`: entry role. Can fill out and save new contractor/consultant evaluations, but cannot modify administrative user scopes.

## Notes & QA Constraints

- **Low Score Justification**: If any score for any category is rated 7/20 or less, the system dynamically requires a narrative justification explaining the reasons for the low score before the evaluation can be saved.
- **Score Scaling**: If a specific category does not apply (e.g. Design is N/A for a project), checking the N/A checkbox automatically scales the final score out of the remaining applicable categories.
- **Protected File Storage**: Uploaded PDF evaluation forms are saved securely inside `protected-uploads/` (not accessible publicly) and served via an authenticated streaming endpoint that forces attachment downloads and path traversal protection.
