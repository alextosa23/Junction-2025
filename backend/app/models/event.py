from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime


class EventCreate(BaseModel):
    name: str
    description: str
    category: str
    coordinates: Dict[str, float]
    start_date: datetime
    end_date: datetime
    max_attendance: int
    amenities: list[str]


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_attendance: Optional[int] = None
    amenities: Optional[list[str]] = None


class Event(BaseModel):
    id: str
    name: str
    description: str
    category: str
    coordinates: Dict[str, float]
    start_date: datetime
    end_date: datetime
    max_attendance: int
    amenities: list[str]
    active: bool
    timestamp: datetime
