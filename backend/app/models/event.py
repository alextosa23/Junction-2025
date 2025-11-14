from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class EventCreate(BaseModel):
    name: str
    description: str
    category: str
    coordinates: Dict[str, float]
    type: str
    schedule: Dict[str, Any]
    max_attendance: int
    amenities: list[str]


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    type: Optional[str] = None
    schedule: Optional[Dict[str, Any]] = None
    max_attendance: Optional[int] = None
    amenities: Optional[list[str]] = None


class Event(BaseModel):
    id: str
    name: str
    description: str
    category: str
    coordinates: Dict[str, float]
    type: str
    schedule: Dict[str, Any]
    max_attendance: int
    amenities: list[str]
    active: bool
    timestamp: datetime
