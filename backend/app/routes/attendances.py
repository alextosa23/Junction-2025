from fastapi import APIRouter, HTTPException, status
from app.models.attendance import AttendanceCreate, Attendance
from app.services.firestore import get_firestore

router = APIRouter(prefix="/events", tags=["attendances"])


@router.post("/{event_id}/attendances", response_model=Attendance, status_code=status.HTTP_201_CREATED)
async def create_attendance(event_id: str, attendance: AttendanceCreate):
    try:
        firestore_service = get_firestore()
        
        event = firestore_service.get_event(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        if firestore_service.check_device_attendance(event_id, attendance.device_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Device already registered for this event"
            )
        
        current_count = firestore_service.count_attendances_for_event(event_id)
        if current_count >= event["max_attendance"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event has reached maximum attendance capacity"
            )
        
        attendance_data = {
            "event_id": event_id,
            "device_id": attendance.device_id
        }
        
        attendance_id = firestore_service.create_attendance(attendance_data)
        created_attendance = firestore_service.get_attendance(attendance_id)
        
        return Attendance(**created_attendance)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create attendance: {str(e)}"
        )


@router.get("/{event_id}/attendances/{attendance_id}", response_model=Attendance)
async def get_attendance(event_id: str, attendance_id: str):
    try:
        firestore_service = get_firestore()
        
        event = firestore_service.get_event(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        attendance = firestore_service.get_attendance(attendance_id)
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance with ID {attendance_id} not found"
            )
        
        if attendance["event_id"] != event_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance does not belong to this event"
            )
        
        return Attendance(**attendance)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve attendance: {str(e)}"
        )


@router.delete("/{event_id}/attendances/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attendance(event_id: str, attendance_id: str):
    try:
        firestore_service = get_firestore()
        
        event = firestore_service.get_event(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        attendance = firestore_service.get_attendance(attendance_id)
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attendance with ID {attendance_id} not found"
            )
        
        if attendance["event_id"] != event_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attendance does not belong to this event"
            )
        
        firestore_service.delete_attendance(attendance_id)
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete attendance: {str(e)}"
        )
