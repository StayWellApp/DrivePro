# GCP Service Account & IAM Setup Instructions

Follow these steps to establish a secure connection between the application and the database using GCP Service Accounts:

1. **Create Service Account**:
   Generate a service account named `drivepro-backend-sa`.
   ```bash
   gcloud iam service-accounts create drivepro-backend-sa \
       --description="Backend service account for DrivePro" \
       --display-name="DrivePro Backend SA"
   ```

2. **Assign Roles**:
   Grant this account the necessary permissions (`Cloud SQL Client`, `Storage Object Viewer`, `Cloud Run Developer`). Replace `<YOUR_GOOGLE_PROJECT_ID>` with your actual project ID (e.g., `DrivePro-Production`).
   ```bash
   gcloud projects add-iam-policy-binding <YOUR_GOOGLE_PROJECT_ID> \
       --member="serviceAccount:drivepro-backend-sa@<YOUR_GOOGLE_PROJECT_ID>.iam.gserviceaccount.com" \
       --role="roles/cloudsql.client"

   gcloud projects add-iam-policy-binding <YOUR_GOOGLE_PROJECT_ID> \
       --member="serviceAccount:drivepro-backend-sa@<YOUR_GOOGLE_PROJECT_ID>.iam.gserviceaccount.com" \
       --role="roles/storage.objectViewer"

   gcloud projects add-iam-policy-binding <YOUR_GOOGLE_PROJECT_ID> \
       --member="serviceAccount:drivepro-backend-sa@<YOUR_GOOGLE_PROJECT_ID>.iam.gserviceaccount.com" \
       --role="roles/run.developer"
   ```

3. **Key Management**:
   Generate a JSON key for this service account.
   ```bash
   gcloud iam service-accounts keys create ./drivepro-backend-sa-key.json \
       --iam-account=drivepro-backend-sa@<YOUR_GOOGLE_PROJECT_ID>.iam.gserviceaccount.com
   ```

4. **Environment Configuration**:
   Provide the absolute path to the generated JSON key in your `.env` files (e.g., `apps/admin/.env`, `apps/student/.env`, etc.).
   ```env
   GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/drivepro-backend-sa-key.json"
   ```
   *Note: Do not commit the `drivepro-backend-sa-key.json` file to version control. Ensure it is added to your `.gitignore`.*
