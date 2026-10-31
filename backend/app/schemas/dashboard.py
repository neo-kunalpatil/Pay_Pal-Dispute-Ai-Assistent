from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.dispute import DisputeSchema, ActivityTimelineItemSchema

class OverviewStats(BaseModel):
    availableBalance: float
    pendingHold: float
    totalDisputed: float
    activeDisputesCount: int
    winRate: float
    resolvedCount: int
    needsResponseCount: int
    avgResolutionDays: float

    model_config = ConfigDict(from_attributes=True)

class DashboardOverviewResponse(BaseModel):
    stats: OverviewStats
    recentDisputes: List[DisputeSchema]
    upcomingDeadlines: List[DisputeSchema]
    recentActivities: List[ActivityTimelineItemSchema]

    model_config = ConfigDict(from_attributes=True)

class AdminDashboardResponse(BaseModel):
    totalMerchants: int
    activeMerchants: int
    totalUsers: int
    totalDisputes: int
    totalTransactions: int
    totalVolume: float
    resolvedDisputes: int
    activeDisputes: int
    paypalHealth: Dict[str, Any]
    systemHealth: Dict[str, Any]
    topMerchants: List[Dict[str, Any]]
    recentActivities: List[Dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)

class AnalystDashboardResponse(BaseModel):
    assignedDisputes: List[DisputeSchema]
    pendingInvestigations: int
    inProgressInvestigations: int
    completedInvestigations: int
    urgentDeadlinesCount: int
    missingEvidenceCount: int
    contradictionsCount: int
    recentActivity: List[ActivityTimelineItemSchema]

    model_config = ConfigDict(from_attributes=True)

