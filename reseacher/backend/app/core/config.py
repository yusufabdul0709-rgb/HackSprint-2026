from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://saikorikana17_db_user:t7Vwsu6sPyVYMcb4@ac-rvqltsx-shard-00-00.gvg5tij.mongodb.net:27017,ac-rvqltsx-shard-00-01.gvg5tij.mongodb.net:27017,ac-rvqltsx-shard-00-02.gvg5tij.mongodb.net:27017/trialbridge?ssl=true&authSource=admin&replicaSet=atlas-cs363x-shard-0"
    MONGODB_DATABASE: str = "trialbridge"
    JWT_SECRET: str = "trialbridge-super-secret-jwt-key-2026-secure"
    GEMINI_API_KEY: str = "demo-gemini-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

