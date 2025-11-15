from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import events, attendances, preferences
from app.config import settings

app = FastAPI(
    title="Events Backend API",
    version="1.0.0",
    debug=settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(attendances.router)
app.include_router(preferences.router)


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/preferences", response_model=Preference)
async def create_preference(pref: PreferenceCreate):
    # TODO: save to DB here
    new_id = str(uuid.uuid4())
    return Preference(
        id=new_id,
        device_id=pref.device_id,
        name=pref.name,
        location=pref.location,
        activities=pref.activities,
        topics=pref.topics,
        chat_times=pref.chat_times,
        activity_type=pref.activity_type,
        looking_for=pref.looking_for,
        timestamp=datetime.utcnow(),
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
