# app/main.py

from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import events, attendances  # ⬅️ no preferences router
from app.models.preference import PreferenceCreate, Preference

import firebase_admin
from firebase_admin import credentials, firestore
from logging import getLogger

logger = getLogger("uvicorn")

# ---------- Firebase / Firestore setup using settings ----------

FIREBASE_PROJECT_ID = settings.firebase_project_id
FIREBASE_CLIENT_EMAIL = settings.firebase_client_email
FIREBASE_PRIVATE_KEY = settings.firebase_private_key

# Private key from .env has literal '\n' – convert to actual newlines
FIREBASE_PRIVATE_KEY = FIREBASE_PRIVATE_KEY.replace("\\n", "\n")

cred_info = {
    "type": "service_account",
    "project_id": FIREBASE_PROJECT_ID,
    "private_key": FIREBASE_PRIVATE_KEY,
    "client_email": FIREBASE_CLIENT_EMAIL,
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
}

if not firebase_admin._apps:
    firebase_admin.initialize_app(credentials.Certificate(cred_info))

db = firestore.client()

# ------------------------------------------------------------------

app = FastAPI(
    title="Events Backend API",
    version="1.0.0",
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include other routers
app.include_router(events.router)
app.include_router(attendances.router)
# ❌ do NOT include preferences.router; we're defining /preferences right here


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/preferences", response_model=Preference)
async def create_preference(pref: PreferenceCreate):
    """
    Create or overwrite the preference document in Firestore
    using device_id as the document ID.
    """
    logger.info("📩 Received /preferences payload: %s", pref.dict())
    created_at = datetime.utcnow()

    data = {
        "device_id": pref.device_id,
        "name": pref.name,
        "age": pref.age,
        "location": pref.location,
        "activities": pref.activities,
        "topics": pref.topics,
        "chat_times": pref.chat_times,
        "activity_type": pref.activity_type,
        "looking_for": pref.looking_for,
        "timestamp": created_at,
    }

    # Save to Firestore under collection "preferences"
    doc_ref = db.collection("preferences").document(pref.device_id)
    doc_ref.set(data)

    return Preference(**data)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
