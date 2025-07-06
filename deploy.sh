#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
GOOGLE_PROJECT_ID="trazadomus"
CLOUD_RUN_SERVICE="trazadomus-api"
REGION="us-central1"

# --- Artifact Registry Configuration ---
ARTIFACT_REGISTRY_REPO="trazadomus-api-repo"
ARTIFACT_REGISTRY_LOCATION=$REGION

# The full path to your image in Artifact Registry
IMAGE_PATH="${ARTIFACT_REGISTRY_LOCATION}-docker.pkg.dev/${GOOGLE_PROJECT_ID}/${ARTIFACT_REGISTRY_REPO}/${CLOUD_RUN_SERVICE}"

# --- Pre-flight Check ---
# This script doesn't use the .env file for the API_KEY as it's intended for a CI/CD environment
# Secrets should be handled by the CI/CD system (e.g., GitHub Secrets)

# --- Script ---
echo "Building the container image..."
docker build -t $IMAGE_PATH .

echo "Pushing the container image to Artifact Registry..."
docker push $IMAGE_PATH

echo "Deploying service to Cloud Run..."
# In a manual run, you might need to source variables or pass them directly.
# This example assumes they are set in the environment.
gcloud run deploy $CLOUD_RUN_SERVICE \
  --image $IMAGE_PATH \
  --set-env-vars "API_KEY=$API_KEY,DB_USER=$DB_USER,DB_NAME=$DB_NAME,DB_HOST=$DB_HOST,DB_PASS=$DB_PASS" \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project=$GOOGLE_PROJECT_ID

echo "Deployment successful!"
