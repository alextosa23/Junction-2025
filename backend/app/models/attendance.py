from pydantic import BaseModel
from datetime import datetime


class AttendanceCreate(BaseModel):
    device_id: str


class Attendance(BaseModel):
    id: str
    event_id: str
    device_id: str
    timestamp: datetime
