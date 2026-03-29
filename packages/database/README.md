# DrivePro Database Setup

This package handles the database schema and access code for the DrivePro monorepo.

## Local Development via Cloud SQL Proxy

To run the database connection locally, we use the Google Cloud SQL Auth Proxy to establish a secure connection with the GCP PostgreSQL instance.

1. **Install Cloud SQL Auth Proxy**: Follow the [Google Cloud documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy) to install it for your operating system.
2. **Authenticate**: Ensure you have authenticated with your GCP project using `gcloud auth application-default login`.
3. **Run the Proxy**: Open a terminal and run the proxy targeting our main instance (ensure your GCP project is `DrivePro-Production` or replace with your `<GOOGLE_PROJECT_ID>`):

   ```bash
   ./cloud-sql-proxy <GOOGLE_PROJECT_ID>:europe-west3:drivepro-db-main
   ```
   *(Ensure to use the correct region like `europe-west3` or `europe-west4` depending on your instance).*

4. **Environment Configuration**: Set your `DATABASE_URL` in `.env` to connect to `localhost:5432` where the proxy is listening. Do not use hardcoded credentials; use placeholders:

   ```env
   DATABASE_URL="postgres://<DB_USER>:<DB_PASSWORD>@127.0.0.1:5432/<DB_NAME>?schema=public"
   ```

Replace `<DB_USER>`, `<DB_PASSWORD>`, and `<DB_NAME>` with your specific database details.