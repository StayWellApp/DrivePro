# DrivePro GCP Setup Guide (Workload Identity Federation)

Since Service Account Key creation is blocked, you must set up Workload Identity Federation to allow your GitHub repository (`StayWellApp/DrivePro`) to securely trigger Cloud Build deployments without needing a long-lived JSON key.

## 1. Create a Workload Identity Pool

This pool will manage external identities.

```bash
gcloud iam workload-identity-pools create "github-pool" \
  --project="drivepro-production" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

Get the pool's ID to use in the next steps:

```bash
gcloud iam workload-identity-pools describe "github-pool" \
  --project="drivepro-production" \
  --location="global" \
  --format="value(name)"
```

_(Keep this value handy, you'll need it later)._

## 2. Create a Workload Identity Provider

This provider tells the pool to trust tokens issued by GitHub Actions for your specific repository.

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="drivepro-production" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == 'StayWellApp/DrivePro'" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

## 3. Bind the Service Account to the Identity Pool

To actually perform actions, the GitHub identity needs to impersonate a Google Cloud Service Account.

Assuming you want to use the default Compute Engine service account or a dedicated deployment account (e.g., `drivepro-deployer@drivepro-production.iam.gserviceaccount.com`), run the following command to bind the GitHub identity to it:

```bash
# Set your Service Account Email
export SERVICE_ACCOUNT_EMAIL="drivepro-deployer@drivepro-production.iam.gserviceaccount.com"

# Set the Project Number (you can get this from the GCP Console or `gcloud projects describe drivepro-production`)
export PROJECT_NUMBER="123456789012" # Replace with your actual Project Number

gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --project="drivepro-production" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github-pool/attribute.repository/StayWellApp/DrivePro"
```

---

## Required IAM Roles for Cloud Build Service Account

To successfully build and deploy the app, the Cloud Build Service Account (or the `drivepro-deployer` service account if specified in the build) needs the following IAM roles in the `drivepro-production` project:

1. **`roles/cloudbuild.builds.editor`** (or `roles/cloudbuild.builds.builder`)
   - **Why:** Required to actually run builds in Google Cloud Build.
2. **`roles/artifactregistry.writer`**
   - **Why:** Required to push the built Docker image to the Artifact Registry (`europe-west4-docker.pkg.dev/drivepro-production/drivepro-repo/admin`).
3. **`roles/run.admin`**
   - **Why:** Required to deploy the new revision to Cloud Run (`admin-app`).
4. **`roles/iam.serviceAccountUser`**
   - **Why:** Required by Cloud Run to attach its runtime service account to the new revision.
5. **`roles/cloudsql.client`**
   - **Why:** Required to connect to the Cloud SQL instance (`drivepro-production:europe-west4:drivepro-db-main`) during the migration step (via Cloud SQL Auth Proxy) and natively when the Cloud Run service boots.
6. **`roles/secretmanager.secretAccessor`**
   - **Why:** Required to access database credentials (`DB_USER`, `DB_PASS`, `DB_NAME`, `DATABASE_URL_UNIX`) stored in Google Secret Manager during the Cloud Build steps.
