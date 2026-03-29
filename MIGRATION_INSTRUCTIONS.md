# Database Migration Instructions

To run the initial migration to the GCP Cloud SQL instance, perform the following steps:

1. **Start Cloud SQL Proxy:** Ensure your proxy is running in a terminal window (as documented in `packages/database/README.md`).

2. **Set Environment Variables:** Ensure your `.env` file contains the `DATABASE_URL` pointing to localhost and the proxy.
   ```env
   DATABASE_URL="postgres://<DB_USER>:<DB_PASSWORD>@127.0.0.1:5432/<DB_NAME>?schema=public"
   ```

3. **Run the Prisma Migration Command:** Run this from the root of the workspace or from within `packages/database`:
   ```bash
   cd packages/database
   npx prisma migrate dev --name init
   ```
   *Note: If Prisma complains about needing an empty database, or if you prefer a simpler schema push without migration history initially, use `npx prisma db push`.*
