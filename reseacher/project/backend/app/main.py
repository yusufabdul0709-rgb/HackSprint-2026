from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.mongodb import startup_connect, shutdown_disconnect, get_db, db_instance
from app.db.indexes import create_indexes
from app.routes import auth, users, organizations, studies, participants, screening, eligibility, consent, enrollment, visits, tasks, documents, notifications, messages, reports, simulation, audit

@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_connect()
    if db_instance.is_connected and db_instance.db is not None:
        try:
            create_indexes(db_instance.db)
        except Exception as e:
            print(f"Index creation warning: {e}")
    yield
    shutdown_disconnect()

app = FastAPI(title="TrialBridge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
app.include_router(studies.router, prefix="/api/studies", tags=["studies"])
app.include_router(participants.router, prefix="/api/participants", tags=["participants"])
app.include_router(screening.router, prefix="/api/screening", tags=["screening"])
app.include_router(eligibility.router, prefix="/api/eligibility", tags=["eligibility"])
app.include_router(consent.router, prefix="/api/consent", tags=["consent"])
app.include_router(enrollment.router, prefix="/api/enrollment", tags=["enrollment"])
app.include_router(visits.router, prefix="/api/visits", tags=["visits"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(audit.router, prefix="/api/audit", tags=["audit"])

@app.get("/api/health")
def health_check():
    if db_instance.is_connected:
        return {"status": "ok", "database": "mongodb", "database_status": "connected"}
    raise HTTPException(
        status_code=503,
        detail={
            "status": "unavailable",
            "database": "mongodb",
            "database_status": "disconnected",
            "message": "MongoDB Atlas connection unavailable. Ensure current IP is in Atlas IP Access List.",
            "error": db_instance.connection_error
        }
    )
