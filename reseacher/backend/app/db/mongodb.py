import logging
from pymongo import MongoClient
from pymongo.database import Database
from app.core.config import settings
import certifi
import dns.resolver

# Configure public DNS resolvers to bypass Windows UDP 53 DNS timeouts on local networks
try:
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']
except Exception:
    pass

logger = logging.getLogger(__name__)

# Direct Atlas URI bypassing local Windows UDP 53 DNS timeouts if needed
ATLAS_DIRECT_URI = (
    "mongodb://saikorikana17_db_user:t7Vwsu6sPyVYMcb4@"
    "ac-rvqltsx-shard-00-00.gvg5tij.mongodb.net:27017,"
    "ac-rvqltsx-shard-00-01.gvg5tij.mongodb.net:27017,"
    "ac-rvqltsx-shard-00-02.gvg5tij.mongodb.net:27017/"
    "trialbridge?ssl=true&authSource=admin&replicaSet=atlas-cs363x-shard-0"
)

class MongoDB:
    client: MongoClient = None
    db: Database = None
    is_connected: bool = False
    connection_error: str = None

db_instance = MongoDB()

def startup_connect():
    # Attempt connecting using primary settings URI, then fallback to direct replica set
    uris = [settings.MONGODB_URI, ATLAS_DIRECT_URI]
    connected = False
    last_err = None

    for uri in uris:
        try:
            logger.info("Attempting MongoDB connection...")
            client = MongoClient(
                uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                socketTimeoutMS=5000,
                maxPoolSize=100,
                minPoolSize=10,
                maxIdleTimeMS=45000,
                waitQueueTimeoutMS=5000,
                retryWrites=True,
                readPreference="primaryPreferred",
                appname="TrailBridgeFastAPI"
            )
            client.admin.command('ping')
            db_instance.client = client
            db_instance.db = client[settings.MONGODB_DATABASE]
            db_instance.is_connected = True
            db_instance.connection_error = None
            logger.info("Successfully connected to MongoDB Atlas.")
            connected = True
            break
        except Exception as e:
            last_err = str(e)
            logger.warning(f"MongoDB connection attempt failed: {e}")

    if not connected:
        db_instance.is_connected = False
        db_instance.connection_error = last_err
        logger.error(
            f"MongoDB Atlas is currently unavailable or current IP is not in Atlas Network Access List: {last_err}"
        )

def shutdown_disconnect():
    if db_instance.client:
        try:
            db_instance.client.close()
            logger.info("Disconnected from MongoDB.")
        except Exception:
            pass

def get_db() -> Database:
    if not db_instance.is_connected or db_instance.db is None:
        startup_connect()
    if not db_instance.is_connected or db_instance.db is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail={
                "status": "error",
                "database": "mongodb",
                "database_status": "disconnected",
                "error": db_instance.connection_error or "Database connection unavailable",
                "hint": "Please add current IP to MongoDB Atlas Network Access (IP Access List) in Atlas dashboard."
            }
        )
    return db_instance.db
