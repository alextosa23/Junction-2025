from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PreferenceCreate(BaseModel):
    device_id: str
    name: str
    activities: List[str]
    topics: List[str]
    chat_times: List[str]
    activity_type: str
    looking_for: List[str]


class PreferenceUpdate(BaseModel):
    name: Optional[str] = None
    activities: Optional[List[str]] = None
    topics: Optional[List[str]] = None
    chat_times: Optional[List[str]] = None
    activity_type: Optional[str] = None
    looking_for: Optional[List[str]] = None


class Preference(BaseModel):
    id: str
    device_id: str
    name: str
    activities: List[str]
    topics: List[str]
    chat_times: List[str]
    activity_type: str
    looking_for: List[str]
    timestamp: datetime
