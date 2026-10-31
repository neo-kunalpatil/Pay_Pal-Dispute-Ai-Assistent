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
