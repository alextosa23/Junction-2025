from fastapi import APIRouter, HTTPException, status
from app.models.event import EventCreate, EventUpdate, Event
from app.services.firestore import get_firestore

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/register", response_model=Event, status_code=status.HTTP_201_CREATED)
async def register_event(event: EventCreate):
    try:
        firestore_service = get_firestore()
        
        event_data = {
            "name": event.name,
            "description": event.description,
            "category": event.category,
            "coordinates": event.coordinates,
            "type": event.type,
            "schedule": event.schedule,
            "max_attendance": event.max_attendance,
            "amenities": event.amenities
        }
        
        event_id = firestore_service.create_event(event_data)
        created_event = firestore_service.get_event(event_id)
        
        return Event(**created_event)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register event: {str(e)}"
        )


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    try:
        firestore_service = get_firestore()
        event = firestore_service.get_event(event_id)
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        return Event(**event)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve event: {str(e)}"
        )


@router.put("/{event_id}", response_model=Event)
async def update_event(event_id: str, event_update: EventUpdate):
    try:
        firestore_service = get_firestore()
        event = firestore_service.get_event(event_id)
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        # Build update data from non-None fields
        update_data = {k: v for k, v in event_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        firestore_service.update_event(event_id, update_data)
        updated_event = firestore_service.get_event(event_id)
        
        return Event(**updated_event)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}"
        )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: str):
    try:
        firestore_service = get_firestore()
        event = firestore_service.get_event(event_id)
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )
        
        firestore_service.update_event(event_id, {"active": False})
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}"
        )
