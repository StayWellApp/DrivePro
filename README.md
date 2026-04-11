# DrivePro MVP

DrivePro is a comprehensive platform for managing driving schools, tracking student progress, and monitoring fleet health.

## MVP Authentication

The system uses NextAuth.js (Auth.js) with a Credentials provider.

### Credentials

- **Global Admin**:
  - Email: `admin@drivepro.com`
  - Password: `admin123`
- **Demo Student**:
  - Email: `student@example.com`
  - Password: `student123`

## Project Structure

- `apps/admin`: Next.js application for school administrators.
- `apps/student`: Next.js application for students to track progress and book lessons.
- `apps/api`: Express.js backend for telemetry, notifications, and Stripe integration.
- `packages/database`: Prisma schema and shared database client.
- `packages/ui`: Shared UI components using Tailwind CSS.

## Getting Started

1. Install dependencies: `npm install`
2. Setup environment: Copy `.env.example` to `.env` and configure `DATABASE_URL`.
3. Generate Prisma client: `npx prisma generate --schema=packages/database/prisma/schema.prisma`
4. Seed the database: `cd packages/database && npx tsx prisma/seed.ts`
5. Run development server: `npm run dev`
