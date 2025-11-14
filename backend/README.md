# Events Backend Service

Python FastAPI backend for registering events to Firestore with ML support.

## Setup

1. **Create virtual environment**:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment**:
```bash
copy .env.example .env
```

Edit `.env` and set:
- `USE_MOCK=true` for development (no Firebase needed)
- `USE_MOCK=false` for production (requires Firebase credentials)

## Running the Server

**Development (with auto-reload)**:
```bash
python app/main.py
```

Or:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### POST /events/register
Register a new event

**Example request**:
```json
{
  "event_type": "user_action",
  "user_id": "user123",
  "data": {
    "action": "button_click",
    "button_id": "submit_form"
  },
  "metadata": {
    "platform": "web",
    "version": "1.0.0"
  }
}
```

### GET /events/{event_id}
Get a specific event by ID

### GET /events/
Get all events

### DELETE /events/{event_id}
Delete a specific event

## Mock vs Real Firestore

The service supports both mock and real Firestore:

- **Mock Mode** (`USE_MOCK=true`): Events stored in memory, no Firebase needed
- **Real Mode** (`USE_MOCK=false`): Events stored in Firestore (requires Firebase credentials)

## Project Structure

```
backend/
├── app/
│   ├── main.py              # Entry point
│   ├── config.py            # Configuration
│   ├── routes/
│   │   └── events.py        # Event endpoints
│   ├── services/
│   │   └── firestore.py     # Firestore operations
│   └── models/
│       └── event.py         # Data models
├── requirements.txt
├── .env.example
└── README.md
```
