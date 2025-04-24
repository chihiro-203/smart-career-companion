from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_API_KEY: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_BUCKET_NAME: str  # default bucket
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
