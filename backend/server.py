from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Admin credentials (in production, this should be in database)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt())

# Models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    token: str
    message: str

class KundaliUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    birth_date: str
    birth_time: str
    birth_place: str
    phone: str
    email: str
    horoscope_data: str
    consultation_history: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KundaliUserCreate(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    birth_place: str
    phone: str
    email: str
    horoscope_data: str
    consultation_history: List[str] = []

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    date: str
    time: str
    description: str
    category: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    name: str
    date: str
    time: str
    description: str
    category: str

class TempleItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    description: str
    category: str
    image_base64: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TempleItemCreate(BaseModel):
    name: str
    price: float
    description: str
    category: str
    image_base64: str

class Donation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_name: str
    amount: float
    date: str
    purpose: str
    contact_details: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DonationCreate(BaseModel):
    donor_name: str
    amount: float
    date: str
    purpose: str
    contact_details: str

class Story(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str
    author: str
    date: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StoryCreate(BaseModel):
    title: str
    content: str
    category: str
    author: str
    date: str

# Helper function to verify token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != "admin_token_123":
        raise HTTPException(status_code=403, detail="Invalid token")
    return credentials.credentials

# Admin Authentication
@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    if credentials.username != ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return AdminToken(token="admin_token_123", message="Login successful")

# Kundali Users
@api_router.get("/kundali-users", response_model=List[KundaliUser])
async def get_kundali_users(token: str = Depends(verify_token)):
    users = await db.kundali_users.find().to_list(1000)
    return [KundaliUser(**user) for user in users]

@api_router.post("/kundali-users", response_model=KundaliUser)
async def create_kundali_user(user: KundaliUserCreate, token: str = Depends(verify_token)):
    user_dict = user.dict()
    user_obj = KundaliUser(**user_dict)
    await db.kundali_users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/kundali-users/{user_id}", response_model=KundaliUser)
async def get_kundali_user(user_id: str, token: str = Depends(verify_token)):
    user = await db.kundali_users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return KundaliUser(**user)

# Events
@api_router.get("/events", response_model=List[Event])
async def get_events(token: str = Depends(verify_token)):
    events = await db.events.find().to_list(1000)
    return [Event(**event) for event in events]

@api_router.post("/events", response_model=Event)
async def create_event(event: EventCreate, token: str = Depends(verify_token)):
    event_dict = event.dict()
    event_obj = Event(**event_dict)
    await db.events.insert_one(event_obj.dict())
    return event_obj

@api_router.put("/events/{event_id}", response_model=Event)
async def update_event(event_id: str, event: EventCreate, token: str = Depends(verify_token)):
    event_dict = event.dict()
    event_dict["id"] = event_id
    event_obj = Event(**event_dict)
    await db.events.replace_one({"id": event_id}, event_obj.dict())
    return event_obj

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, token: str = Depends(verify_token)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# Temple Items
@api_router.get("/temple-items", response_model=List[TempleItem])
async def get_temple_items(token: str = Depends(verify_token)):
    items = await db.temple_items.find().to_list(1000)
    return [TempleItem(**item) for item in items]

@api_router.post("/temple-items", response_model=TempleItem)
async def create_temple_item(item: TempleItemCreate, token: str = Depends(verify_token)):
    item_dict = item.dict()
    item_obj = TempleItem(**item_dict)
    await db.temple_items.insert_one(item_obj.dict())
    return item_obj

@api_router.put("/temple-items/{item_id}", response_model=TempleItem)
async def update_temple_item(item_id: str, item: TempleItemCreate, token: str = Depends(verify_token)):
    item_dict = item.dict()
    item_dict["id"] = item_id
    item_obj = TempleItem(**item_dict)
    await db.temple_items.replace_one({"id": item_id}, item_obj.dict())
    return item_obj

@api_router.delete("/temple-items/{item_id}")
async def delete_temple_item(item_id: str, token: str = Depends(verify_token)):
    result = await db.temple_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# Donations
@api_router.get("/donations", response_model=List[Donation])
async def get_donations(token: str = Depends(verify_token)):
    donations = await db.donations.find().to_list(1000)
    return [Donation(**donation) for donation in donations]

@api_router.post("/donations", response_model=Donation)
async def create_donation(donation: DonationCreate, token: str = Depends(verify_token)):
    donation_dict = donation.dict()
    donation_obj = Donation(**donation_dict)
    await db.donations.insert_one(donation_obj.dict())
    return donation_obj

# Stories
@api_router.get("/stories", response_model=List[Story])
async def get_stories(token: str = Depends(verify_token)):
    stories = await db.stories.find().to_list(1000)
    return [Story(**story) for story in stories]

@api_router.post("/stories", response_model=Story)
async def create_story(story: StoryCreate, token: str = Depends(verify_token)):
    story_dict = story.dict()
    story_obj = Story(**story_dict)
    await db.stories.insert_one(story_obj.dict())
    return story_obj

@api_router.put("/stories/{story_id}", response_model=Story)
async def update_story(story_id: str, story: StoryCreate, token: str = Depends(verify_token)):
    story_dict = story.dict()
    story_dict["id"] = story_id
    story_obj = Story(**story_dict)
    await db.stories.replace_one({"id": story_id}, story_obj.dict())
    return story_obj

@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, token: str = Depends(verify_token)):
    result = await db.stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"message": "Story deleted successfully"}

# Statistics endpoint
@api_router.get("/stats")
async def get_stats(token: str = Depends(verify_token)):
    kundali_count = await db.kundali_users.count_documents({})
    events_count = await db.events.count_documents({})
    items_count = await db.temple_items.count_documents({})
    donations_count = await db.donations.count_documents({})
    stories_count = await db.stories.count_documents({})
    
    total_donations = await db.donations.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    total_donation_amount = total_donations[0]["total"] if total_donations else 0
    
    return {
        "kundali_users": kundali_count,
        "events": events_count,
        "temple_items": items_count,
        "donations": donations_count,
        "stories": stories_count,
        "total_donation_amount": total_donation_amount
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()