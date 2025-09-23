from supabase import create_client, Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            try:
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.info("Supabase client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
    
    @property
    def client(self) -> Client:
        return self._client
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user with Supabase"""
        try:
            response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            raise
    
    def register_user(self, email: str, password: str, metadata: dict = None):
        """Register new user with Supabase"""
        try:
            response = self.client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": metadata or {}
                }
            })
            return response
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            raise
    
    def sign_out(self):
        """Sign out user"""
        try:
            return self.client.auth.sign_out()
        except Exception as e:
            logger.error(f"Sign out failed: {e}")
            raise

# Singleton instance
supabase_service = SupabaseService()