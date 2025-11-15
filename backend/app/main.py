# app/main.py

from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import events, attendances
from app.routes import recommendations
from app.routes import aihelper
from app.models.preference import PreferenceCreate, Preference
from app.services.firestore import get_firestore

import firebase_admin
from firebase_admin import credentials, firestore
from logging import getLogger

from google.cloud import speech
import base64
import os

FFMPEG_PATH = r"C:\ffmpeg\bin\ffmpeg.exe"

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

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\Alex\Junction-2025\backend\google-credentials.json"

try:
    client = speech.SpeechClient()
    logger.info("✅ Google Speech client initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Google Speech client: {e}")
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
app.include_router(recommendations.router)
app.include_router(aihelper.router)
# ❌ do NOT include preferences.router; we're defining /preferences right here


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/preferences", response_model=Preference)
async def create_preference(pref: PreferenceCreate):
    logger.info("/preferences payload: %s", pref.dict())
    firestore = get_firestore()

    preference_data = {
        "device_id": pref.device_id,
        "name": pref.name,
        "age": pref.age,
        "location": pref.location,
        "activities": pref.activities,
        "topics": pref.topics,
        "chat_times": pref.chat_times,
        "activity_type": pref.activity_type,
        "looking_for": pref.looking_for,
    }

    pref_id = firestore.create_preference(preference_data)
    created = firestore.get_preference(pref_id)
    return Preference(**created)

from google.cloud import speech
import base64
import os
import tempfile
import subprocess

@app.post("/speech-to-text")
async def speech_to_text(audio_data: dict):
    """
    Receive base64 audio (whatever iPhone recorded) and:
    1. Save it as a temp file.
    2. Convert with ffmpeg -> FLAC 16kHz mono.
    3. Send FLAC bytes to Google STT.
    """
    try:
        logger.info("🎯 Request reached /speech-to-text endpoint!")
        client = speech.SpeechClient()

        # 1) Decode base64 to raw bytes
        raw_bytes = base64.b64decode(audio_data["audio"])
        logger.info(f"🎯 Raw audio bytes size: {len(raw_bytes)}")

        # 2) Save original audio to a temp file (no need to know exact extension)
        with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp_in:
            tmp_in.write(raw_bytes)
            input_path = tmp_in.name

        # 3) Transcode to FLAC 16k mono using ffmpeg
        tmp_out = tempfile.NamedTemporaryFile(suffix=".flac", delete=False)
        output_path = tmp_out.name
        tmp_out.close()

        logger.info(f"🎯 Converting with ffmpeg: {input_path} -> {output_path}")

        # ffmpeg -i input -ac 1 -ar 16000 output.flac
        subprocess.run(
        [FFMPEG_PATH, "-y", "-i", input_path, "-ac", "1", "-ar", "16000", output_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )

        with open(output_path, "rb") as f:
            flac_bytes = f.read()

        # Clean up temp files
        os.remove(input_path)
        os.remove(output_path)

        logger.info(f"🎯 FLAC bytes size: {len(flac_bytes)}")

        audio = speech.RecognitionAudio(content=flac_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_automatic_punctuation=True,
        )

        response = client.recognize(config=config, audio=audio)

        transcripts = [
            result.alternatives[0].transcript
            for result in response.results
            if result.alternatives
        ]
        final_text = " ".join(transcripts).strip()

        if not final_text:
            logger.warning("❌ No text recognized")
            return {
                "text": "",
                "success": False,
                "error": "No speech recognized",
            }

        logger.info(f"✅ SUCCESS! Text: '{final_text}'")
        return {"text": final_text, "success": True}

    except subprocess.CalledProcessError as ff_err:
        logger.error(f"❌ ffmpeg failed: {ff_err.stderr.decode(errors='ignore')}")
        return {
            "text": "",
            "success": False,
            "error": "Audio conversion failed",
        }
    except Exception as e:
        logger.error(f"❌ ERROR in /speech-to-text: {e}")
        return {
            "text": "",
            "success": False,
            "error": str(e),
        }
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
