# app/firebase.py

import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

# PRIVATE KEY in .env contains literal "\n" sequences -> convert to actual newlines
private_key = settings.firebase_private_key.replace("\\n", "\n")

cred_info = {
    "type": "service_account",
    "project_id": settings.firebase_project_id,
    "private_key": private_key,
    "client_email": settings.firebase_client_email,
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
}

cred = credentials.Certificate(cred_info)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
