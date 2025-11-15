from fastapi import APIRouter, HTTPException, status
from app.models.preference import PreferenceCreate, PreferenceUpdate, Preference
from app.services.firestore import get_firestore

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.post("/", response_model=Preference, status_code=status.HTTP_201_CREATED)
async def create_preference(preference: PreferenceCreate):
    try:
        firestore_service = get_firestore()
        
        preference_data = {
            "device_id": preference.device_id,
            "name": preference.name,
            "age": preference.age,
            "location": preference.location,
            "activities": preference.activities,
            "topics": preference.topics,
            "chat_times": preference.chat_times,
            "activity_type": preference.activity_type,
            "looking_for": preference.looking_for
        }
        
        preference_id = firestore_service.create_preference(preference_data)
        created_preference = firestore_service.get_preference(preference_id)
        
        return Preference(**created_preference)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create preference: {str(e)}"
        )


@router.get("/{preference_id}", response_model=Preference)
async def get_preference(preference_id: str):
    try:
        firestore_service = get_firestore()
        preference = firestore_service.get_preference(preference_id)
        
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Preference with ID {preference_id} not found"
            )
        
        return Preference(**preference)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve preference: {str(e)}"
        )


@router.put("/{preference_id}", response_model=Preference)
async def update_preference(preference_id: str, preference_update: PreferenceUpdate):
    try:
        firestore_service = get_firestore()
        preference = firestore_service.get_preference(preference_id)
        
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Preference with ID {preference_id} not found"
            )
        
        update_data = {k: v for k, v in preference_update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        firestore_service.update_preference(preference_id, update_data)
        updated_preference = firestore_service.get_preference(preference_id)
        
        return Preference(**updated_preference)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preference: {str(e)}"
        )


@router.delete("/{preference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_preference(preference_id: str):
    try:
        firestore_service = get_firestore()
        preference = firestore_service.get_preference(preference_id)
        
        if not preference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Preference with ID {preference_id} not found"
            )
        
        firestore_service.delete_preference(preference_id)
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete preference: {str(e)}"
        )
