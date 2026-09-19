#!/usr/bin/env python3
"""Read-only Garmin Connect to FlowFit sync. Credentials are never persisted."""

from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from garminconnect import Garmin

ROOT = Path(__file__).resolve().parents[1]
PRIVATE_DIR = ROOT / ".flowfit-private"
TOKEN_DIR = PRIVATE_DIR / "garmin-tokens"
CONFIG_FILE = PRIVATE_DIR / "sync-config.json"


def pick(data: Any, *keys: str, default: Any = None) -> Any:
    if not isinstance(data, dict):
        return default
    for key in keys:
        value = data.get(key)
        if value is not None:
            return value
    return default


def number(value: Any, divisor: float = 1.0) -> float:
    try:
        return round(float(value) / divisor, 2)
    except (TypeError, ValueError):
        return 0


def load_config() -> dict[str, str]:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def save_config(config: dict[str, str]) -> None:
    PRIVATE_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(config, indent=2))
    CONFIG_FILE.chmod(0o600)


def connect() -> Garmin:
    config = load_config()
    if TOKEN_DIR.exists():
        client = Garmin()
        client.login(str(TOKEN_DIR))
        return client

    email = config.get("garmin_email") or input("Garmin email: ").strip()
    password = getpass.getpass("Garmin password (not stored): ")
    client = Garmin(email, password, prompt_mfa=lambda: input("Garmin MFA code: ").strip())
    TOKEN_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    client.login(str(TOKEN_DIR))
    save_config({**config, "garmin_email": email})
    return client


def normalize_activity(item: dict[str, Any]) -> dict[str, Any]:
    activity_type = pick(item.get("activityType"), "typeKey", "typeId", default="unknown")
    return {
        "activityId": str(pick(item, "activityId", "id", default="")),
        "startTime": pick(item, "startTimeLocal", "startTimeGMT", default=""),
        "activityType": str(activity_type),
        "name": pick(item, "activityName", "name", default="Garmin activity"),
        "durationMin": number(pick(item, "duration", default=0), 60),
        "distanceKm": number(pick(item, "distance", default=0), 1000),
        "calories": number(pick(item, "calories", default=0)),
        "avgHr": number(pick(item, "averageHR", "avgHr", default=0)),
        "maxHr": number(pick(item, "maxHR", "maxHr", default=0)),
        "aerobicEffect": number(pick(item, "aerobicTrainingEffect", default=0)),
        "anaerobicEffect": number(pick(item, "anaerobicTrainingEffect", default=0)),
        "trainingLoad": number(pick(item, "activityTrainingLoad", "trainingLoad", default=0)),
        "sourceDevice": pick(item, "deviceId", "manufacturer", default="Garmin"),
    }


def normalize_health(client: Garmin, day: date) -> dict[str, Any]:
    day_string = day.isoformat()
    def safe(fetch, fallback):
        try:
            return fetch() or fallback
        except Exception:
            # Garmin occasionally returns 5xx for one metric/day. Preserve the
            # rest of that day's health record instead of aborting the sync.
            return fallback

    stats = safe(lambda: client.get_stats(day_string), {})
    sleep = safe(lambda: client.get_sleep_data(day_string), {})
    hrv = safe(lambda: client.get_hrv_data(day_string), {})
    readiness = safe(lambda: client.get_training_readiness(day_string), [])
    battery = safe(lambda: client.get_body_battery(day_string, day_string), [])
    sleep_dto = sleep.get("dailySleepDTO", sleep)
    hrv_summary = hrv.get("hrvSummary", hrv)
    readiness_item = readiness[0] if readiness else {}
    battery_values = [point[1] for block in battery for point in block.get("bodyBatteryValuesArray", []) if isinstance(point, list) and len(point) > 1 and isinstance(point[1], (int, float))]
    return {
        "date": day_string,
        "sleepScore": number(pick(sleep_dto.get("sleepScores", {}).get("overall", {}), "value", default=pick(sleep_dto, "sleepScore", default=0))),
        "sleepHours": number(pick(sleep_dto, "sleepTimeSeconds", default=0), 3600),
        "hrvStatus": str(pick(hrv_summary, "status", "statusKey", default="")),
        "hrvLastNightMs": number(pick(hrv_summary, "lastNightAvg", "lastNight5MinHigh", default=0)),
        "restingHr": number(pick(stats, "restingHeartRate", "restingHeartRateAverage", default=0)),
        "bodyBatteryHigh": max(battery_values, default=number(pick(stats, "bodyBatteryHighestValue", default=0))),
        "bodyBatteryLow": min(battery_values, default=number(pick(stats, "bodyBatteryLowestValue", default=0))),
        "stressAvg": number(pick(stats, "averageStressLevel", default=0)),
        "steps": number(pick(stats, "totalSteps", "steps", default=0)),
        "calories": number(pick(stats, "totalKilocalories", default=0)),
        "intensityMinutes": number(pick(stats, "moderateIntensityMinutes", default=0)) + 2 * number(pick(stats, "vigorousIntensityMinutes", default=0)),
        "readinessScore": number(pick(readiness_item, "score", "trainingReadinessScore", default=0)),
    }


def post(endpoint: str, secret: str, payload: dict[str, Any]) -> dict[str, Any]:
    body = json.dumps({**payload, "secret": secret}).encode()
    request = urllib.request.Request(endpoint, data=body, headers={"Content-Type": "text/plain;charset=utf-8"})
    with urllib.request.urlopen(request, timeout=90) as response:
        result = json.loads(response.read())
    if not result.get("ok"):
        raise RuntimeError(result.get("error", "FlowFit sync failed"))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync Garmin data to FlowFit")
    parser.add_argument("--days", type=int, default=14, help="Days of health/activity history")
    args = parser.parse_args()
    config = load_config()
    endpoint = config.get("endpoint") or input("FlowFit Apps Script /exec URL: ").strip()
    secret = os.getenv("FLOWFIT_SECRET") or getpass.getpass("FlowFit secret (not stored): ")
    client = connect()
    end = date.today()
    start = end - timedelta(days=max(1, args.days) - 1)
    activities = [normalize_activity(item) for item in client.get_activities_by_date(start.isoformat(), end.isoformat())]
    health = [normalize_health(client, start + timedelta(days=offset)) for offset in range((end - start).days + 1)]
    result = post(endpoint, secret, {"action": "syncGarmin", "activities": activities, "health": health})
    save_config({**config, "endpoint": endpoint})
    print(f"Synced {result['activities']} activities and {result['healthDays']} health days.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nCancelled.", file=sys.stderr)
        raise SystemExit(130)
