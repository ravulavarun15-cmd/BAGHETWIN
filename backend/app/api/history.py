from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
import random
from app.ml.model_loader import records

router = APIRouter()

class HistoryEventCreate(BaseModel):
    well_id: str
    category: str  # 'telemetry', 'css', 'srp', 'anomaly', 'audit', 'ai'
    event_type: str
    message: str
    severity: str = "NORMAL"  # 'NORMAL', 'WARNING', 'CRITICAL', 'SUCCESS'
    operator: str = "Operator"
    metrics: Optional[Dict[str, Any]] = None

# In-memory dynamic log storage for real-time operator & twin events
AUDIT_LOGS: List[Dict[str, Any]] = []

def _generate_baseline_history() -> List[Dict[str, Any]]:
    """Generates comprehensive historical records for the Baghewala 35-well fleet."""
    events = []
    base_time = datetime.now(timezone.utc)
    rng = random.Random(26120)

    # 1. Recent Audit & AI actions
    audit_templates = [
        ("BGW-001", "audit", "VFD Frequency Adjusted", "Applied safe SRP recommendation: lowered VFD from 54 Hz to 45 Hz to mitigate rod floating.", "SUCCESS", "Supervisor (admin)", {"vfd_hz": 45.0, "spm": 5.5, "efficiency": 78}),
        ("BGW-001", "ai", "Copilot Diagnostics Executed", "AI Copilot analyzed dynagraph card; confirmed unseated travelling valve risk resolved.", "NORMAL", "BAGHETWIN Copilot", {"confidence": 0.94}),
        ("BGW-002", "css", "CSS Cycle 2 Completed", "Steam soak phase completed at 52 hours. Switched wellhead manifold to production line.", "SUCCESS", "Field Operator (user)", {"soak_hours": 52, "steam_volume_t": 430}),
        ("BGW-005", "anomaly", "Hydrodynamic Rod Floating Alert", "Downstroke peak acceleration exceeded critical damping threshold. Viscosity ~2,100 cP.", "WARNING", "Automated Sensor", {"viscosity_cp": 2100, "spm": 6.8}),
        ("BGW-003", "srp", "Polished Rod Inspection", "Scheduled ultrasonic non-destructive testing (NDT) completed on 1-1/4 inch sucker rod.", "NORMAL", "Maintenance Team", {"rod_stress_mpa": 185}),
        ("BGW-001", "telemetry", "Heavy Oil Viscosity Shift", "Reservoir thermal breakthrough elevated temperature to 68°C; viscosity dropped to 1,620 cP.", "NORMAL", "SCADA Mirror", {"temp_c": 68.2, "viscosity_cp": 1620}),
        ("BGW-004", "anomaly", "Fluid Pound Anomaly Resolved", "Incomplete pump fillage compensated via VFD throttling; normal stroke restored.", "SUCCESS", "Field Operator (user)", {"pump_fillage_pct": 92}),
        ("BGW-012", "audit", "Digital Twin State Synchronized", "Full 3D kinematic model parameters calibrated against surface dynagraph test.", "NORMAL", "Digital Twin Engine", {"error_pct": 1.2}),
        ("BGW-007", "css", "Steam Injection Phase Initiated", "Continuous 12 t/h steam injection started at 32 bar header pressure.", "NORMAL", "Steam Plant Ops", {"steam_rate_tph": 12.0, "pressure_bar": 32.0}),
        ("BGW-015", "anomaly", "Stuffing Box Temperature Warning", "Stuffing box seal friction temperature elevated to 78°C. Lubrication gland flushed.", "WARNING", "Automated Sensor", {"temp_c": 78.4}),
        ("BGW-029", "audit", "Non-Operational Well Inspection", "Well BGW-029 scheduled for secondary reservoir pressure survey in Q4.", "NORMAL", "Reservoir Engineer", {"status": "Awaiting Status Confirmation"}),
        ("BGW-008", "telemetry", "Production Surge Post-Steam", "Well response post-soak yielded 48 BOPD heavy crude at 26% watercut.", "SUCCESS", "SCADA Mirror", {"oil_bopd": 48.2, "watercut_pct": 26.1}),
    ]

    for i, item in enumerate(audit_templates):
        ts = (base_time - timedelta(hours=i * 5 + rng.randint(5, 30))).isoformat()
        events.append({
            "id": f"EVT-{1000 + i}",
            "timestamp": ts,
            "well_id": item[0],
            "category": item[1],
            "event_type": item[2],
            "message": item[3],
            "severity": item[4],
            "operator": item[5],
            "metrics": item[6]
        })

    # 2. Historical Daily Telemetry Records for major wells (Past 30 days)
    wells_to_sample = ["BGW-001", "BGW-002", "BGW-003", "BGW-004", "BGW-005", "BGW-012"]
    for w_idx, w_id in enumerate(wells_to_sample):
        base_bopd = 38.0 + w_idx * 2.5
        base_temp = 64.0 - w_idx * 1.2
        for day in range(1, 31):
            ts = (base_time - timedelta(days=day, hours=rng.randint(1, 8))).isoformat()
            temp = round(base_temp + rng.uniform(-2.5, 3.0), 1)
            bopd = round(base_bopd + rng.uniform(-3.0, 4.0), 1)
            watercut = round(28.0 + rng.uniform(-3.0, 5.0), 1)
            visc = round(max(400.0, 5800.0 * 2.718 ** (-0.0185 * temp)), 1)
            press = round(18.0 + rng.uniform(-1.5, 2.0), 1)
            rod_load = round(32.0 + rng.uniform(-2.0, 3.5), 1)
            spm = 5.5 if day > 3 else (6.2 if day > 7 else 5.8)

            events.append({
                "id": f"TLM-{w_id}-{day:02d}",
                "timestamp": ts,
                "well_id": w_id,
                "category": "telemetry",
                "event_type": "Daily Telemetry Log",
                "message": f"Daily SCADA sync: {bopd} BOPD, {watercut}% watercut, {temp}°C reservoir temp, {visc} cP viscosity.",
                "severity": "NORMAL",
                "operator": "Automated SCADA Gateway",
                "metrics": {
                    "oil_bopd": bopd,
                    "watercut_pct": watercut,
                    "temperature_c": temp,
                    "viscosity_cp": visc,
                    "pressure_bar": press,
                    "rod_load_kn": rod_load,
                    "spm": spm,
                    "energy_kwh": round(140.0 + bopd * 1.8, 1)
                }
            })

    # Sort newest first
    events.sort(key=lambda x: x["timestamp"], reverse=True)
    return events

# Pre-populate static historical events
SEED_EVENTS = _generate_baseline_history()

@router.get("")
def get_history(
    well_id: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    time_range: Optional[str] = "all",
    search: Optional[str] = None,
    limit: int = 100
):
    """Retrieve filtered historical operational logs."""
    all_events = AUDIT_LOGS + SEED_EVENTS

    # Calculate cutoff date
    now = datetime.now(timezone.utc)
    cutoff = None
    if time_range == "24h":
        cutoff = now - timedelta(hours=24)
    elif time_range == "7d":
        cutoff = now - timedelta(days=7)
    elif time_range == "30d":
        cutoff = now - timedelta(days=30)
    elif time_range == "90d":
        cutoff = now - timedelta(days=90)

    filtered = []
    for ev in all_events:
        # Time filter
        if cutoff:
            try:
                ev_time = datetime.fromisoformat(ev["timestamp"])
                if ev_time < cutoff:
                    continue
            except Exception:
                pass

        # Well filter
        if well_id and well_id.strip() and well_id.lower() != "all":
            if ev["well_id"].upper() != well_id.strip().upper():
                continue

        # Category filter
        if category and category.strip() and category.lower() != "all":
            if ev["category"].lower() != category.strip().lower():
                continue

        # Severity filter
        if severity and severity.strip() and severity.lower() != "all":
            if ev["severity"].upper() != severity.strip().upper():
                continue

        # Search filter
        if search and search.strip():
            q = search.strip().lower()
            text_corpus = f"{ev['well_id']} {ev['event_type']} {ev['message']} {ev.get('operator', '')}".lower()
            if q not in text_corpus:
                continue

        filtered.append(ev)

    return {
        "total_matches": len(filtered),
        "limit": limit,
        "events": filtered[:limit]
    }

@router.get("/trends")
def get_historical_trends(
    well_id: str = "BGW-001"
):
    """Returns chronological time-series points for historical plotting in Recharts."""
    all_events = [e for e in (AUDIT_LOGS + SEED_EVENTS) if e["well_id"] == well_id and e["category"] == "telemetry"]
    
    # Sort oldest to newest for charts
    all_events.sort(key=lambda x: x["timestamp"])

    trend_points = []
    for ev in all_events[-30:]:  # last 30 daily data points
        m = ev.get("metrics", {})
        try:
            date_str = ev["timestamp"][:10]
        except Exception:
            date_str = ev["timestamp"]

        trend_points.append({
            "date": date_str,
            "oil_bopd": m.get("oil_bopd", 40.0),
            "watercut_pct": m.get("watercut_pct", 30.0),
            "temperature_c": m.get("temperature_c", 62.0),
            "viscosity_cp": m.get("viscosity_cp", 1800.0),
            "pressure_bar": m.get("pressure_bar", 18.0),
            "rod_load_kn": m.get("rod_load_kn", 32.0),
            "spm": m.get("spm", 5.5),
            "energy_kwh": m.get("energy_kwh", 150.0)
        })

    # If no data found for this well, generate realistic baseline curve
    if not trend_points:
        base_time = datetime.now(timezone.utc) - timedelta(days=29)
        rng = random.Random(hash(well_id) % 10000)
        for d in range(30):
            day_time = base_time + timedelta(days=d)
            temp = round(61.0 + rng.uniform(-2, 3), 1)
            bopd = round(37.0 + rng.uniform(-2, 4), 1)
            trend_points.append({
                "date": day_time.strftime("%Y-%m-%d"),
                "oil_bopd": bopd,
                "watercut_pct": round(29.0 + rng.uniform(-3, 3), 1),
                "temperature_c": temp,
                "viscosity_cp": round(5800.0 * 2.718 ** (-0.0185 * temp), 1),
                "pressure_bar": round(18.0 + rng.uniform(-1, 2), 1),
                "rod_load_kn": round(32.5 + rng.uniform(-2, 2), 1),
                "spm": 5.5,
                "energy_kwh": round(145.0 + bopd * 1.5, 1)
            })

    return {
        "well_id": well_id,
        "points": trend_points
    }

@router.get("/summary")
def get_history_summary():
    """Returns fleet-wide historical KPI metrics."""
    all_events = AUDIT_LOGS + SEED_EVENTS
    total_events = len(all_events)
    telemetry_events = [e for e in all_events if e["category"] == "telemetry"]
    anomalies = [e for e in all_events if e["category"] == "anomaly"]
    audit_events = [e for e in all_events if e["category"] in ("audit", "ai")]

    avg_bopd = 40.8
    if telemetry_events:
        bopd_vals = [e.get("metrics", {}).get("oil_bopd", 0) for e in telemetry_events if e.get("metrics", {}).get("oil_bopd")]
        if bopd_vals:
            avg_bopd = round(sum(bopd_vals) / len(bopd_vals), 1)

    return {
        "total_records": total_events,
        "total_telemetry_logs": len(telemetry_events),
        "total_anomalies_recorded": len(anomalies),
        "total_audit_interventions": len(audit_events),
        "avg_historical_recovery_bopd": avg_bopd,
        "mean_sor": 3.4,
        "incident_resolution_rate_pct": 98.4,
        "fleet_operating_uptime_pct": 99.2,
        "last_synced": datetime.now(timezone.utc).isoformat()
    }

@router.post("/log")
def log_event(event: HistoryEventCreate):
    """Add a new operator, digital twin, or system event to the history audit trail."""
    new_evt = {
        "id": f"EVT-{datetime.now(timezone.utc).strftime('%m%d%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "well_id": event.well_id.upper(),
        "category": event.category.lower(),
        "event_type": event.event_type,
        "message": event.message,
        "severity": event.severity.upper(),
        "operator": event.operator,
        "metrics": event.metrics or {}
    }
    AUDIT_LOGS.insert(0, new_evt)
    return {"status": "logged", "event": new_evt}
