#!/usr/bin/env python3
"""Authenticated HTTP service for on-demand FlowFit Garmin sync."""

from __future__ import annotations

import asyncio
import os
from datetime import date, timedelta
from pathlib import Path

from fastapi import FastAPI, Header, HTTPException
from garminconnect import Garmin

import sync


TOKEN_DIR = Path(os.getenv("GARMIN_TOKEN_DIR", "/data/garmin-tokens"))
SYNC_API_KEY = os.getenv("SYNC_API_KEY", "")
FLOWFIT_ENDPOINT = os.getenv("FLOWFIT_ENDPOINT", "")
FLOWFIT_SECRET = os.getenv("FLOWFIT_SECRET", "")
SYNC_DAYS = max(1, min(90, int(os.getenv("SYNC_DAYS", "14"))))

app = FastAPI(title="FlowFit Garmin Sync", docs_url=None, redoc_url=None)
sync_lock = asyncio.Lock()


def authorize(authorization: str | None) -> None:
    if not SYNC_API_KEY or not FLOWFIT_ENDPOINT or not FLOWFIT_SECRET:
        raise HTTPException(status_code=503, detail="service_not_configured")
    if authorization != f"Bearer {SYNC_API_KEY}":
        raise HTTPException(status_code=401, detail="unauthorized")


def run_sync() -> dict[str, object]:
    if not TOKEN_DIR.exists():
        raise RuntimeError("Garmin tokens are not initialized")
    client = Garmin()
    client.login(str(TOKEN_DIR))
    end = date.today()
    start = end - timedelta(days=SYNC_DAYS - 1)
    activities = [sync.normalize_activity(item) for item in client.get_activities_by_date(start.isoformat(), end.isoformat())]
    health = [sync.normalize_health(client, start + timedelta(days=offset)) for offset in range(SYNC_DAYS)]
    result = sync.post(FLOWFIT_ENDPOINT, FLOWFIT_SECRET, {"action": "syncGarmin", "activities": activities, "health": health})
    return {"ok": True, "activities": result["activities"], "healthDays": result["healthDays"], "syncedThrough": end.isoformat()}


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True, "configured": bool(SYNC_API_KEY and FLOWFIT_ENDPOINT and FLOWFIT_SECRET)}


@app.post("/sync")
async def sync_now(authorization: str | None = Header(default=None)) -> dict[str, object]:
    authorize(authorization)
    if sync_lock.locked():
        raise HTTPException(status_code=409, detail="sync_in_progress")
    async with sync_lock:
        try:
            return await asyncio.to_thread(run_sync)
        except Exception as error:
            raise HTTPException(status_code=502, detail=str(error)) from error
