import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.database.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created & seeded
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Payment Dispute Investigation and Evidence Management Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local frontend vite dev server & proxies
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def root_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "paypal_mode": settings.PAYPAL_MODE,
        "ai_mode": settings.AI_MODE
    }

# Mount versioned API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Static Frontend SPA Serving (Single-Service Full-Stack Deployment)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check potential frontend dist paths
possible_dist_dirs = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "frontend", "dist")),
]
frontend_dist = next((d for d in possible_dist_dirs if os.path.exists(d)), None)

if frontend_dist and os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend_spa(full_path: str):
        # Allow API routes, docs, and health checks to pass through
        if full_path.startswith("api") or full_path.startswith("docs") or full_path == "openapi.json" or full_path == "health":
            return None
        file_target = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_target) and os.path.isfile(file_target):
            return FileResponse(file_target)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
