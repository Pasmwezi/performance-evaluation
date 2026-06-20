# PerfEval

PerfEval is a procurement performance tracker for recording, reviewing, and monitoring contractor and consultant evaluations. It provides authenticated users with a dashboard, evaluation entry forms, vendor profile pages, score history, uploaded form storage, and an underperforming watchlist.

## App Functionality

- Authenticated access with user registration, login, and sign out.
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
- Optional PDF/form upload for each evaluation, stored under `public/uploads`.

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
WEB_PORT=3001
POSTGRES_PORT=5433
```

For Docker Compose, the web container connects to PostgreSQL through the internal `db` service while the host machine can reach the database on `POSTGRES_PORT`.

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

## Notes

- Scores are stored out of 100 and averaged per vendor for list pages, detail pages, and dashboard flagging.
- Vendors are flagged as underperforming when their average score is below 60.
- Uploaded evaluation forms are persisted in the Docker `uploads` volume when using Compose.
- The Docker image uses Next.js standalone output and listens on container port `3000`, mapped to `WEB_PORT` on the host.
