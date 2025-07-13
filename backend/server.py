from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from datetime import datetime

# MongoDB setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URL)
db = client.play_modz_pro
apps_collection = db.apps
admin_collection = db.admin

app = FastAPI(title="Play Modz Pro API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class App(BaseModel):
    id: str
    name: str
    description: str
    version: str
    category: str  # "jogos" or "aplicativos"
    icon_url: str
    apk_url: str
    downloads: int
    rating: float
    size: str
    developer: str
    created_at: str

class AppCreate(BaseModel):
    name: str
    description: str
    version: str
    category: str
    icon_url: str
    apk_url: str
    size: str
    developer: str
    rating: Optional[float] = 4.5

class AdminAuth(BaseModel):
    password: str

# Initialize with sample apps if collection is empty
def init_sample_apps():
    if apps_collection.count_documents({}) == 0:
        sample_apps = [
            {
                "id": str(uuid.uuid4()),
                "name": "PUBG Mobile Mod",
                "description": "Battle Royale com recursos desbloqueados e skins grátis",
                "version": "3.2.0",
                "category": "jogos",
                "icon_url": "https://images.unsplash.com/photo-1593789198788-8b21805d5fdb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxtb2JpbGUlMjBhcHAlMjBpY29uc3xlbnwwfHx8fDE3NTIzNjQ3OTZ8MA&ixlib=rb-4.1.0&q=85",
                "apk_url": "https://example.com/pubg-mod.apk",
                "downloads": 125000,
                "rating": 4.8,
                "size": "2.1 GB",
                "developer": "Tencent Games",
                "created_at": "2025-01-15"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "WhatsApp Plus",
                "description": "WhatsApp modificado com recursos extras e personalização",
                "version": "17.50",
                "category": "aplicativos",
                "icon_url": "https://images.pexels.com/photos/267389/pexels-photo-267389.jpeg",
                "apk_url": "https://example.com/whatsapp-plus.apk",
                "downloads": 89000,
                "rating": 4.6,
                "size": "95 MB",
                "developer": "WhatsApp Inc",
                "created_at": "2025-01-14"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Minecraft PE Mod",
                "description": "Minecraft Pocket Edition com todos os recursos desbloqueados",
                "version": "1.20.15",
                "category": "jogos",
                "icon_url": "https://images.pexels.com/photos/424299/pexels-photo-424299.jpeg",
                "apk_url": "https://example.com/minecraft-mod.apk",
                "downloads": 250000,
                "rating": 4.9,
                "size": "450 MB",
                "developer": "Mojang Studios",
                "created_at": "2025-01-13"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Instagram Pro",
                "description": "Instagram com download de fotos/vídeos e sem anúncios",
                "version": "290.0.0",
                "category": "aplicativos",
                "icon_url": "https://images.unsplash.com/photo-1696355607944-650405f2aa2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxhbmRyb2lkJTIwYXBwJTIwaWNvbnN8ZW58MHx8fHwxNzUyMzY0ODAzfDA&ixlib=rb-4.1.0&q=85",
                "apk_url": "https://example.com/instagram-pro.apk",
                "downloads": 75000,
                "rating": 4.4,
                "size": "65 MB",
                "developer": "Meta Platforms",
                "created_at": "2025-01-12"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Among Us Mod",
                "description": "Among Us com todos os pets e skins desbloqueados",
                "version": "2024.3.5",
                "category": "jogos",
                "icon_url": "https://images.pexels.com/photos/32944546/pexels-photo-32944546.jpeg",
                "apk_url": "https://example.com/among-us-mod.apk",
                "downloads": 180000,
                "rating": 4.7,
                "size": "180 MB",
                "developer": "InnerSloth",
                "created_at": "2025-01-11"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "TikTok Pro",
                "description": "TikTok sem marca d'água e com download de vídeos",
                "version": "32.8.4",
                "category": "aplicativos",
                "icon_url": "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg",
                "apk_url": "https://example.com/tiktok-pro.apk",
                "downloads": 95000,
                "rating": 4.3,
                "size": "120 MB",
                "developer": "ByteDance",
                "created_at": "2025-01-10"
            }
        ]
        apps_collection.insert_many(sample_apps)

# API Routes
@app.on_event("startup")
async def startup_event():
    init_sample_apps()

@app.get("/api/apps", response_model=List[App])
async def get_apps(category: Optional[str] = None):
    """Get all apps, optionally filtered by category"""
    query = {}
    if category:
        query["category"] = category
    
    apps = list(apps_collection.find(query, {"_id": 0}).sort("downloads", -1))
    return apps

@app.get("/api/apps/{app_id}", response_model=App)
async def get_app(app_id: str):
    """Get a specific app by ID"""
    app = apps_collection.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    return app

@app.post("/api/apps", response_model=App)
async def create_app(app_data: AppCreate):
    """Create a new app (admin only)"""
    app_dict = app_data.dict()
    app_dict["id"] = str(uuid.uuid4())
    app_dict["downloads"] = 0
    app_dict["created_at"] = datetime.now().strftime("%Y-%m-%d")
    
    try:
        apps_collection.insert_one(app_dict)
        return App(**app_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/apps/{app_id}", response_model=App)
async def update_app(app_id: str, app_data: AppCreate):
    """Update an existing app (admin only)"""
    app_dict = app_data.dict()
    
    result = apps_collection.update_one(
        {"id": app_id},
        {"$set": app_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    
    updated_app = apps_collection.find_one({"id": app_id}, {"_id": 0})
    return App(**updated_app)

@app.delete("/api/apps/{app_id}")
async def delete_app(app_id: str):
    """Delete an app (admin only)"""
    result = apps_collection.delete_one({"id": app_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    
    return {"message": "App deleted successfully"}

@app.post("/api/auth/admin")
async def admin_login(auth_data: AdminAuth):
    """Admin authentication"""
    if auth_data.password == "admin":
        return {"authenticated": True, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@app.post("/api/apps/{app_id}/download")
async def track_download(app_id: str):
    """Track app download"""
    result = apps_collection.update_one(
        {"id": app_id},
        {"$inc": {"downloads": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="App not found")
    
    return {"message": "Download tracked"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Play Modz Pro API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)