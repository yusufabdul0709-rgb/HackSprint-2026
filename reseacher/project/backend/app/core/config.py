from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str
    MONGODB_DATABASE: str
    JWT_SECRET: str
    GEMINI_API_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    class Config:
        env_file = ".env"

settings = Settings()
