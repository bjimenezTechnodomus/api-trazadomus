GOOGLE_PROJECT_ID="trazadomus"
CLOUD_RUN_SERVICE="trazadomus-api"
INSTANCE_CONNECTION_NAME="trazadomus-api:"
export $(cat .env | xargs)

gcloud builds submit --tag gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE --project=$GOOGLE_PROJECT_ID

gcloud run deploy $CLOUD_RUN_SERVICE \
	--image gcr.io/$GOOGLE_PROJECT_ID/$CLOUD_RUN_SERVICE \
	--update-env-vars DB_USER=$DB_USER,DB_NAME=$DB_NAME,DB_PORT=$DB_PORT,DB_HOST=$DB_HOST,DB_PASS=$DB_PASS \
	--platform managed \
	--region us-central1 --allow-unauthenticated \
	--project=$GOOGLE_PROJECT_ID
