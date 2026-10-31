from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.merchants import router as merchants_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.disputes import router as disputes_router
from app.api.v1.documents import router as documents_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.responses import router as responses_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.payments import router as payments_router
from app.api.v1.paypal import router as paypal_router
from app.api.v1.webhooks import router as webhooks_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.settings import router as settings_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(merchants_router)
api_router.include_router(dashboard_router)
api_router.include_router(disputes_router)
api_router.include_router(documents_router)
api_router.include_router(investigations_router)
api_router.include_router(responses_router)
api_router.include_router(transactions_router)
api_router.include_router(payments_router)
api_router.include_router(paypal_router)
api_router.include_router(webhooks_router)
api_router.include_router(analytics_router)
api_router.include_router(notifications_router)
api_router.include_router(settings_router)
