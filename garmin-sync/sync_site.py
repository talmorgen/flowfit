#!/usr/bin/env python3
"""Sync Garmin data from this Mac into FlowFit's cloud database."""

from __future__ import annotations

import json
from datetime import date, timedelta

from curl_cffi import requests

import sync


DEFAULT_ENDPOINT = "https://flowfit-tal.talmorgen318054.chatgpt.site/api/garmin-sync"


def main() -> int:
    config = sync.load_config()
    endpoint = config.get("site_endpoint", DEFAULT_ENDPOINT)
    key = config.get("site_sync_key", "")
    if not key:
        raise RuntimeError("FlowFit cloud sync key is not configured")

    client = sync.connect()
    end = date.today()
    # The first successful upload preserves the complete Garmin history. Later
    # runs re-fetch a 30-day overlap so edited/reclassified recent activities
    # are updated without downloading years of unchanged data each time.
    activity_start = (
        config.get("history_start", "2018-01-01")
        if not config.get("last_site_sync")
        else (end - timedelta(days=30)).isoformat()
    )
    health_days = max(1, min(30, int(config.get("health_days", "14"))))
    health_start = end - timedelta(days=health_days - 1)
    activities = [
        sync.normalize_activity(item)
        for item in client.get_activities_by_date(activity_start, end.isoformat())
    ]
    health = [
        sync.normalize_health(client, health_start + timedelta(days=offset))
        for offset in range(health_days)
    ]
    # Sites limits public request-body size. Upload bounded batches so a first
    # historical import is just as reliable as the small daily increment.
    result: dict[str, object] = {"totalActivities": 0}
    batches = [activities[index:index + 50] for index in range(0, len(activities), 50)] or [[]]
    for index, activity_batch in enumerate(batches):
        response = requests.post(
            endpoint,
            json={"activities": activity_batch, "health": health if index == len(batches) - 1 else []},
            headers={"X-FlowFit-Sync-Key": key},
            impersonate="chrome",
            timeout=180,
        )
        response.raise_for_status()
        result = response.json()
        if not result.get("ok"):
            raise RuntimeError(str(result.get("error", "FlowFit cloud sync failed")))
    sync.save_config({**config, "last_site_sync": end.isoformat()})
    print(
        f"Synced {len(activities)} activities and "
        f"{len(health)} health days; "
        f"{result['totalActivities']} activities stored."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
