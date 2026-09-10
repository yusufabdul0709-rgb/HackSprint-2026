import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from app.core.connections import connection_manager
from app.core.security import verify_token

logger = logging.getLogger("ws")
router = APIRouter()

DEMO_ROLE_MAP = {
    "participant": ("demo-participant", "PARTICIPANT"),
    "principal_investigator": ("demo-principal_investigator", "PRINCIPAL_INVESTIGATOR"),
    "research_coordinator": ("demo-research_coordinator", "RESEARCH_COORDINATOR"),
    "organization": ("demo-organization", "ORGANIZATION"),
    "platform_admin": ("demo-platform_admin", "PLATFORM_ADMIN"),
}

def resolve_user_and_role(token: Optional[str], fallback_user_id: Optional[str] = None, fallback_role: Optional[str] = None):
    if not token:
        if fallback_user_id and fallback_role:
            return fallback_user_id, fallback_role
        return "anonymous", "GUEST"

    # Support demo token format (e.g., demo-jwt-token-participant)
    if token.startswith("demo-jwt-token-"):
        role_slug = token.replace("demo-jwt-token-", "").lower()
        if role_slug in DEMO_ROLE_MAP:
            return DEMO_ROLE_MAP[role_slug]
        return f"demo-{role_slug}", role_slug.upper()

    # Real JWT verification
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        role = payload.get("role", "PARTICIPANT")
        if user_id:
            return str(user_id), role
    except Exception as e:
        logger.debug(f"JWT verification fallback for token in WS: {e}")

    # Fallback to query params if provided
    if fallback_user_id and fallback_role:
        return fallback_user_id, fallback_role

    return "guest", "GUEST"

@router.websocket("/notifications")
async def websocket_notifications(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
):
    resolved_user_id, resolved_role = resolve_user_and_role(token, user_id, role)

    await connection_manager.connect(websocket, resolved_user_id, resolved_role)
    try:
        # Send initial confirmation
        await websocket.send_text(json.dumps({
            "event": "WS_CONNECTED",
            "user_id": resolved_user_id,
            "role": resolved_role,
            "timestamp": datetime.utcnow().isoformat()
        }))

        while True:
            data = await websocket.receive_text()
            # Support ping keepalives
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "pong", "timestamp": datetime.utcnow().isoformat()}))
                continue
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping" or msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"event": "pong", "timestamp": datetime.utcnow().isoformat()}))
            except Exception:
                pass
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, resolved_user_id, resolved_role)
    except Exception as e:
        logger.warning(f"WebSocket session error for {resolved_user_id}: {e}")
        connection_manager.disconnect(websocket, resolved_user_id, resolved_role)
