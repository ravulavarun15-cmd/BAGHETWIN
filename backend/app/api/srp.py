from fastapi import APIRouter
from app.ml.model_loader import records
import random

router = APIRouter()

def generate_srp_history_for_well(well_id: str):
    """Generates realistic chronological SRP operational telemetry history for a given well."""
    csv_rows = records('srp_data.csv', well_id)
    base_seed = hash(well_id) % 10000
    rng = random.Random(base_seed)

    base_stroke = 2.8
    base_spm = 5.5
    base_vfd = 45.0
    base_eff = 78.0
    base_load = 32.0
    base_pos = 1.4

    if csv_rows:
        latest_csv = csv_rows[-1]
        base_stroke = float(latest_csv.get('stroke_m', 2.8) or 2.8)
        base_spm = float(latest_csv.get('spm', 5.5) or 5.5)
        base_vfd = float(latest_csv.get('vfd_hz', 45.0) or 45.0)
        base_eff = float(latest_csv.get('pump_efficiency_pct', 78.0) or 78.0)
        base_load = float(latest_csv.get('rod_load_kn', 32.0) or 32.0)
        base_pos = float(latest_csv.get('rod_position_m', 1.4) or 1.4)

    timestamps = [
        ("2026-09-29 18:00", 0.0, 0.0, 0.0, 0.0, "OPTIMAL"),
        ("2026-09-28 12:00", 0.3, 2.5, -4.0, 3.2, "ELEVATED LOAD"),
        ("2026-09-27 06:00", 0.7, 6.0, -9.0, 8.1, "ROD FLOAT WARNING"),
        ("2026-09-26 14:00", 0.1, 1.0, 1.0, -0.5, "SAFE RECOVERY"),
        ("2026-09-25 09:00", -0.3, -2.0, 3.0, -2.5, "STABLE OPERATION"),
        ("2026-09-24 16:00", 0.0, 0.0, 0.0, 0.2, "OPTIMAL"),
        ("2026-09-23 10:30", -0.1, -1.0, 1.0, -0.8, "OPTIMAL")
    ]

    records_list = []
    for ts, spm_delta, vfd_delta, eff_delta, load_delta, status in timestamps:
        stroke = round(base_stroke + rng.uniform(-0.05, 0.05), 1)
        spm = round(max(3.0, min(8.5, base_spm + spm_delta + rng.uniform(-0.1, 0.1))), 1)
        vfd = round(max(30.0, min(60.0, base_vfd + vfd_delta + rng.uniform(-0.5, 0.5))), 1)
        eff = round(max(50.0, min(92.0, base_eff + eff_delta + rng.uniform(-1.0, 1.5))), 1)
        load = round(max(20.0, min(55.0, base_load + load_delta + rng.uniform(-0.8, 1.0))), 1)
        pos = round(base_pos + rng.uniform(-0.08, 0.08), 1)
        fluid = round(618.0 + rng.uniform(-15.0, 15.0), 0)

        records_list.append({
            "timestamp": ts,
            "well_id": well_id,
            "stroke_m": stroke,
            "spm": spm,
            "vfd_hz": vfd,
            "pump_efficiency_pct": eff,
            "rod_load_kn": load,
            "rod_position_m": pos,
            "fluid_level_m": int(fluid),
            "operating_status": status
        })

    return records_list

@router.get('/{well_id}')
def srp(well_id: str):
    history_records = generate_srp_history_for_well(well_id)
    latest_rec = history_records[0] if history_records else {
        'well_id': well_id,
        'timestamp': '2026-09-29 18:00',
        'stroke_m': 2.8,
        'spm': 5.5,
        'vfd_hz': 45.0,
        'pump_efficiency_pct': 78.0,
        'rod_load_kn': 32.0,
        'rod_position_m': 1.4,
        'fluid_level_m': 620,
        'operating_status': 'OPTIMAL'
    }

    return {
        'latest': latest_rec,
        'records': history_records
    }
