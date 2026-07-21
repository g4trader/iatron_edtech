#!/bin/sh
set -eu

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GITHUB_REPOSITORY:?Set GITHUB_REPOSITORY as owner/repository}"

artifact_repository=iatron
deploy_account=iatron-deploy
runtime_account=iatron-api-staging
pool=github-actions
provider=github
project_number=$(gcloud projects describe "$GCP_PROJECT_ID" --format='value(projectNumber)')

gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iamcredentials.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  sts.googleapis.com \
  --project="$GCP_PROJECT_ID"

cloud_build_account=$(gcloud builds get-default-service-account \
  --project="$GCP_PROJECT_ID")
cloud_build_account=${cloud_build_account##*/}

gcloud artifacts repositories describe "$artifact_repository" \
  --location="$GCP_REGION" --project="$GCP_PROJECT_ID" >/dev/null 2>&1 || \
gcloud artifacts repositories create "$artifact_repository" \
  --repository-format=docker --location="$GCP_REGION" \
  --description='Iatron staging container images' --project="$GCP_PROJECT_ID"

for account in "$deploy_account" "$runtime_account"; do
  gcloud iam service-accounts describe \
    "$account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
    --project="$GCP_PROJECT_ID" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "$account" \
    --display-name="$account" --project="$GCP_PROJECT_ID"
done

for secret in SUPABASE_STAGING_PUBLISHABLE_KEY SUPABASE_STAGING_SERVICE_ROLE_KEY; do
  gcloud secrets describe "$secret" --project="$GCP_PROJECT_ID" >/dev/null 2>&1 || \
  gcloud secrets create "$secret" --replication-policy=automatic \
    --project="$GCP_PROJECT_ID"
done

gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$deploy_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/run.admin --condition=None >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
  --member="serviceAccount:$deploy_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/cloudbuild.builds.editor --condition=None >/dev/null
gcloud artifacts repositories add-iam-policy-binding "$artifact_repository" \
  --location="$GCP_REGION" --project="$GCP_PROJECT_ID" \
  --member="serviceAccount:$cloud_build_account" \
  --role=roles/artifactregistry.writer --condition=None >/dev/null
gcloud iam service-accounts add-iam-policy-binding \
  "$runtime_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --member="serviceAccount:$deploy_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/iam.serviceAccountUser --project="$GCP_PROJECT_ID" >/dev/null
gcloud secrets add-iam-policy-binding SUPABASE_STAGING_PUBLISHABLE_KEY \
  --member="serviceAccount:$runtime_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/secretmanager.secretAccessor --project="$GCP_PROJECT_ID" >/dev/null

gcloud iam workload-identity-pools describe "$pool" --location=global \
  --project="$GCP_PROJECT_ID" >/dev/null 2>&1 || \
gcloud iam workload-identity-pools create "$pool" --location=global \
  --display-name='GitHub Actions' --project="$GCP_PROJECT_ID"
gcloud iam workload-identity-pools providers describe "$provider" \
  --workload-identity-pool="$pool" --location=global \
  --project="$GCP_PROJECT_ID" >/dev/null 2>&1 || \
gcloud iam workload-identity-pools providers create-oidc "$provider" \
  --workload-identity-pool="$pool" --location=global \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository' \
  --attribute-condition="assertion.repository=='$GITHUB_REPOSITORY'" \
  --project="$GCP_PROJECT_ID"
gcloud iam service-accounts add-iam-policy-binding \
  "$deploy_account@$GCP_PROJECT_ID.iam.gserviceaccount.com" \
  --member="principalSet://iam.googleapis.com/projects/$project_number/locations/global/workloadIdentityPools/$pool/attribute.repository/$GITHUB_REPOSITORY" \
  --role=roles/iam.workloadIdentityUser --project="$GCP_PROJECT_ID" >/dev/null

printf '%s\n' "GCP_WORKLOAD_IDENTITY_PROVIDER=projects/$project_number/locations/global/workloadIdentityPools/$pool/providers/$provider"
printf '%s\n' "GCP_DEPLOY_SERVICE_ACCOUNT=$deploy_account@$GCP_PROJECT_ID.iam.gserviceaccount.com"
printf '%s\n' "GCP_RUNTIME_SERVICE_ACCOUNT=$runtime_account@$GCP_PROJECT_ID.iam.gserviceaccount.com"
