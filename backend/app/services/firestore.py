from typing import Dict, Any, Optional
from datetime import datetime
import uuid
import firebase_admin
from  firebase_admin import credentials, firestore
from app.config import settings


class FirestoreService:
    
    def __init__(self):
        if not firebase_admin._apps:
            firebase_creds = settings.get_firebase_credentials()
            cred = credentials.Certificate(firebase_creds)
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()
        self.collection_name = settings.firestore_collection
        self.attendances_collection = "attendances"
        self.preferences_collection = "preferences"
    
    def create_event(self, event_data: Dict[str, Any]) -> str:
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        event = {
            "id": event_id,
            "name": event_data.get("name"),
            "description": event_data.get("description"),
            "category": event_data.get("category"),
            "coordinates": event_data.get("coordinates"),
            "start_date": event_data.get("start_date"),
            "end_date": event_data.get("end_date"),
            "max_attendance": event_data.get("max_attendance"),
            "amenities": event_data.get("amenities"),
            "active": True,
            "timestamp": datetime.utcnow()
        }
        self.db.collection(self.collection_name).document(event_id).set(event)
        return event_id
    
    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection(self.collection_name).document(event_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def update_event(self, event_id: str, updates: Dict[str, Any]) -> bool:
        self.db.collection(self.collection_name).document(event_id).update(updates)
        return True
    
    def create_attendance(self, attendance_data: Dict[str, Any]) -> str:
        attendance_id = f"att_{uuid.uuid4().hex[:12]}"
        
        attendance = {
            "id": attendance_id,
            "event_id": attendance_data.get("event_id"),
            "device_id": attendance_data.get("device_id"),
            "timestamp": datetime.utcnow()
        }
        
        self.db.collection(self.attendances_collection).document(attendance_id).set(attendance)
        return attendance_id
    
    def get_attendance(self, attendance_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection(self.attendances_collection).document(attendance_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def delete_attendance(self, attendance_id: str) -> bool:
        self.db.collection(self.attendances_collection).document(attendance_id).delete()
        return True
    
    def count_attendances_for_event(self, event_id: str) -> int:
        query = self.db.collection(self.attendances_collection).where("event_id", "==", event_id)
        return len(list(query.stream()))
    
    def check_device_attendance(self, event_id: str, device_id: str) -> bool:
        query = self.db.collection(self.attendances_collection).where("event_id", "==", event_id).where("device_id", "==", device_id)
        return len(list(query.stream())) > 0
    
    def create_preference(self, preference_data: Dict[str, Any]) -> str:
        preference_id = f"prf_{uuid.uuid4().hex[:12]}"
        
        preference = {
            "id": preference_id,
            "device_id": preference_data.get("device_id"),
            "name": preference_data.get("name"),
            "age": preference_data.get("age"),
            "location": preference_data.get("location"),
            "activities": preference_data.get("activities"),
            "topics": preference_data.get("topics"),
            "chat_times": preference_data.get("chat_times"),
            "activity_type": preference_data.get("activity_type"),
            "looking_for": preference_data.get("looking_for"),
            "timestamp": datetime.utcnow()
        }
        
        self.db.collection(self.preferences_collection).document(preference_id).set(preference)
        return preference_id
    
    def get_preference(self, preference_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection(self.preferences_collection).document(preference_id).get()
        if doc.exists:
            return doc.to_dict()
        return None
    
    def update_preference(self, preference_id: str, updates: Dict[str, Any]) -> bool:
        self.db.collection(self.preferences_collection).document(preference_id).update(updates)
        return True
    
    def delete_preference(self, preference_id: str) -> bool:
        self.db.collection(self.preferences_collection).document(preference_id).delete()
        return True

    def list_events(self) -> list[Dict[str, Any]]:
        query = self.db.collection(self.collection_name).where("active", "==", True)
        return [doc.to_dict() for doc in query.stream()]

    def list_attendances_by_device(self, device_id: str) -> list[Dict[str, Any]]:
        query = self.db.collection(self.attendances_collection).where("device_id", "==", device_id)
        return [doc.to_dict() for doc in query.stream()]

    def get_preference_by_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        # preference documents may not use device_id as document id; query by field
        query = self.db.collection(self.preferences_collection).where("device_id", "==", device_id).limit(1)
        docs = list(query.stream())
        if docs:
            return docs[0].to_dict()
        return None


_firestore_service = None


def get_firestore() -> FirestoreService:
    global _firestore_service
    if _firestore_service is None:
        _firestore_service = FirestoreService()
    return _firestore_service
