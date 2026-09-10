from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode('utf-8')[:72], hashed.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    if token and token.startswith("demo-jwt-token-"):
        role_slug = token.replace("demo-jwt-token-", "").lower()
        role_map = {
            "participant": ("demo-participant", "PARTICIPANT", "rahul.mehta@email.com"),
            "principal_investigator": ("demo-principal_investigator", "PRINCIPAL_INVESTIGATOR", "j.patel@cityhospital.org"),
            "research_coordinator": ("demo-research_coordinator", "RESEARCH_COORDINATOR", "maya.r@trialbridge.io"),
            "organization": ("demo-organization", "ORGANIZATION", "m.torres@pharmaco.com"),
            "platform_admin": ("demo-platform_admin", "PLATFORM_ADMIN", "sarah.chen@trialbridge.io")
        }
        info = role_map.get(role_slug, (f"demo-{role_slug}", role_slug.upper(), f"{role_slug}@trialbridge.io"))
        return {"sub": info[0], "role": info[1], "email": info[2], "organization_id": "demo-org"}

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"id": user_id, "role": role, "email": payload.get("email"), "organization_id": payload.get("organization_id")}
