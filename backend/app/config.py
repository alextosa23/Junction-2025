from pydantic_settings import BaseSettings
import json


class Settings(BaseSettings):
    firebase_private_key: str
    firebase_project_id: str
    firebase_client_email: str
    firestore_collection: str = "events"
    
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def get_firebase_credentials(self):
        return {
            "type": "service_account",
            "project_id": self.firebase_project_id,
            "private_key": self.firebase_private_key.replace('\\n', '\n'),
            "client_email": self.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }


settings = Settings()  
