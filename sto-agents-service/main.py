"""
STO Agents Service - FastAPI wrapper for Python agents

This service wraps existing STO Python agents and provides:
- HTTP endpoints to trigger syncs
- Background task execution
- Health checks and status monitoring
- Integration with MindFlow Express API via REST

Agents:
- SupplyPro Reporter: Syncs orders and deliveries from SupplyPro portal
- Plan Intake Monitor: Watches for new documents from OneDrive/SharePoint
- Completeness Checker: Scans for missing documents and generates alerts
"""

import os
import asyncio
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel

# Import agents (these would be your existing Python scripts)
from agents.supplypro_reporter import SupplyProReporter
from agents.plan_intake import PlanIntakeMonitor
from agents.completeness_checker import CompletenessChecker


# Configuration
MINDFLOW_API_URL = os.getenv("MINDFLOW_API_URL", "http://localhost:3000")
SERVICE_TOKEN = os.getenv("PORTAL_SYNC_SECRET", "")

# Track sync status
sync_status = {
    "supplypro": {"last_sync": None, "status": "idle", "error": None},
    "plan_intake": {"last_sync": None, "status": "idle", "error": None},
    "completeness": {"last_sync": None, "status": "idle", "error": None},
}


def get_headers() -> dict:
    """Get headers for API calls to MindFlow backend"""
    return {
        "x-service-token": SERVICE_TOKEN,
        "Content-Type": "application/json",
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    print(f"STO Agents Service starting...")
    print(f"MindFlow API URL: {MINDFLOW_API_URL}")
    print(f"Service token configured: {'Yes' if SERVICE_TOKEN else 'No'}")
    yield
    # Shutdown
    print("STO Agents Service shutting down...")


app = FastAPI(
    title="STO Agents Service",
    description="Python agents for portal syncing and document management",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================
# PYDANTIC MODELS
# ============================================


class SyncResponse(BaseModel):
    status: str
    timestamp: str
    message: Optional[str] = None


class SyncStatusResponse(BaseModel):
    supplypro: dict
    plan_intake: dict
    completeness: dict


# ============================================
# HELPER FUNCTIONS
# ============================================


async def post_to_mindflow(endpoint: str, data: dict) -> dict:
    """Post data to MindFlow Express API"""
    url = f"{MINDFLOW_API_URL}/api/v1/portal-sync/{endpoint}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=get_headers())
        response.raise_for_status()
        return response.json()


# ============================================
# SUPPLYPRO SYNC
# ============================================


async def run_supplypro_sync():
    """Run the SupplyPro sync and push to MindFlow API"""
    sync_status["supplypro"]["status"] = "running"
    sync_status["supplypro"]["error"] = None

    try:
        reporter = SupplyProReporter()

        # Sync orders
        orders = await reporter.get_orders()
        if orders:
            await post_to_mindflow(
                "orders",
                {
                    "orders": orders,
                    "portal": "supplypro",
                    "syncId": f"sp-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                },
            )

        # Sync deliveries
        deliveries = await reporter.get_todays_deliveries()
        if deliveries:
            await post_to_mindflow(
                "deliveries",
                {"deliveries": deliveries, "portal": "supplypro"},
            )

        # Generate alerts for any issues
        alerts = await reporter.check_for_alerts()
        if alerts:
            await post_to_mindflow("alerts", {"alerts": alerts})

        # Log activity
        await post_to_mindflow(
            "activity",
            {
                "activities": [
                    {
                        "type": "portal_sync",
                        "title": "SupplyPro sync completed",
                        "detail": f"Synced {len(orders)} orders, {len(deliveries)} deliveries",
                        "icon": "🔄",
                    }
                ]
            },
        )

        sync_status["supplypro"]["last_sync"] = datetime.now().isoformat()
        sync_status["supplypro"]["status"] = "completed"

    except Exception as e:
        sync_status["supplypro"]["status"] = "failed"
        sync_status["supplypro"]["error"] = str(e)
        print(f"SupplyPro sync error: {e}")


@app.post("/sync/supplypro", response_model=SyncResponse)
async def sync_supplypro(background_tasks: BackgroundTasks):
    """Trigger SupplyPro sync"""
    if sync_status["supplypro"]["status"] == "running":
        raise HTTPException(status_code=409, detail="Sync already in progress")

    background_tasks.add_task(run_supplypro_sync)
    return SyncResponse(
        status="started",
        timestamp=datetime.now().isoformat(),
        message="SupplyPro sync started in background",
    )


# ============================================
# PLAN INTAKE SYNC
# ============================================


async def run_plan_intake_sync():
    """Run the plan intake monitor and push new documents to MindFlow"""
    sync_status["plan_intake"]["status"] = "running"
    sync_status["plan_intake"]["error"] = None

    try:
        monitor = PlanIntakeMonitor()

        # Check for new documents
        documents = await monitor.scan_for_new_documents()
        if documents:
            await post_to_mindflow(
                "documents",
                {"documents": documents, "portal": "onedrive"},
            )

            # Log activity
            await post_to_mindflow(
                "activity",
                {
                    "activities": [
                        {
                            "type": "document",
                            "title": f"Found {len(documents)} new documents",
                            "detail": "Documents synced from OneDrive/SharePoint",
                            "icon": "📋",
                        }
                    ]
                },
            )

        sync_status["plan_intake"]["last_sync"] = datetime.now().isoformat()
        sync_status["plan_intake"]["status"] = "completed"

    except Exception as e:
        sync_status["plan_intake"]["status"] = "failed"
        sync_status["plan_intake"]["error"] = str(e)
        print(f"Plan intake sync error: {e}")


@app.post("/sync/plan-intake", response_model=SyncResponse)
async def sync_plan_intake(background_tasks: BackgroundTasks):
    """Trigger plan intake sync"""
    if sync_status["plan_intake"]["status"] == "running":
        raise HTTPException(status_code=409, detail="Sync already in progress")

    background_tasks.add_task(run_plan_intake_sync)
    return SyncResponse(
        status="started",
        timestamp=datetime.now().isoformat(),
        message="Plan intake sync started in background",
    )


# ============================================
# COMPLETENESS CHECK
# ============================================


async def run_completeness_check():
    """Check for missing documents and create alerts"""
    sync_status["completeness"]["status"] = "running"
    sync_status["completeness"]["error"] = None

    try:
        checker = CompletenessChecker()
        missing = await checker.scan_all_communities()

        alerts = []
        for item in missing:
            alerts.append(
                {
                    "type": "warning",
                    "source": "completeness_check",
                    "title": f"Missing {item['doc_type']}",
                    "message": f"{item['community']} Lot {item['lot']} - {item['doc_type']} not found",
                    "community_id": item.get("community_id"),
                    "details": item,
                }
            )

        if alerts:
            await post_to_mindflow("alerts", {"alerts": alerts})

        # Log activity
        await post_to_mindflow(
            "activity",
            {
                "activities": [
                    {
                        "type": "completeness_check",
                        "title": "Completeness check completed",
                        "detail": f"Found {len(missing)} missing documents",
                        "icon": "🔍",
                    }
                ]
            },
        )

        sync_status["completeness"]["last_sync"] = datetime.now().isoformat()
        sync_status["completeness"]["status"] = "completed"

    except Exception as e:
        sync_status["completeness"]["status"] = "failed"
        sync_status["completeness"]["error"] = str(e)
        print(f"Completeness check error: {e}")


@app.post("/sync/completeness", response_model=SyncResponse)
async def sync_completeness(background_tasks: BackgroundTasks):
    """Run completeness check and generate alerts"""
    if sync_status["completeness"]["status"] == "running":
        raise HTTPException(status_code=409, detail="Check already in progress")

    background_tasks.add_task(run_completeness_check)
    return SyncResponse(
        status="started",
        timestamp=datetime.now().isoformat(),
        message="Completeness check started in background",
    )


# ============================================
# RUN ALL SYNCS
# ============================================


@app.post("/sync/all", response_model=SyncResponse)
async def sync_all(background_tasks: BackgroundTasks):
    """Trigger all syncs"""
    background_tasks.add_task(run_supplypro_sync)
    background_tasks.add_task(run_plan_intake_sync)
    background_tasks.add_task(run_completeness_check)
    return SyncResponse(
        status="started",
        timestamp=datetime.now().isoformat(),
        message="All syncs started in background",
    )


# ============================================
# HEALTH & STATUS
# ============================================


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "sto-agents",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/status", response_model=SyncStatusResponse)
async def get_sync_status():
    """Get last sync times and status for all agents"""
    return SyncStatusResponse(**sync_status)


@app.get("/")
def root():
    """Root endpoint with API info"""
    return {
        "service": "STO Agents Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "status": "/status",
            "sync_supplypro": "POST /sync/supplypro",
            "sync_plan_intake": "POST /sync/plan-intake",
            "sync_completeness": "POST /sync/completeness",
            "sync_all": "POST /sync/all",
        },
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
