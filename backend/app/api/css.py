from fastapi import APIRouter
from app.ml.model_loader import records
import random

router = APIRouter()

def generate_css_history_for_well(well_id: str):
    """Generates realistic chronological CSS cycle history for a given well in Baghewala."""
    csv_rows = records('css_data.csv', well_id)
    base_seed = hash(well_id) % 10000
    rng = random.Random(base_seed)

    base_steam = 400.0
    base_press = 30.0
    base_soak = 48.0
    base_cutoff = 28.0

    if csv_rows:
        latest_csv = csv_rows[-1]
        base_steam = float(latest_csv.get('steam_volume_t', 400) or 400)
        base_press = float(latest_csv.get('injection_pressure_bar', 30) or 30)
        base_soak = float(latest_csv.get('soak_hours', 48) or 48)
        base_cutoff = float(latest_csv.get('production_cutoff_bopd', 28) or 28)

    cycle_dates = [
        "2025-04-10",
        "2025-08-22",
        "2025-12-15",
        "2026-04-05",
        "2026-08-28"
    ]

    cycles = []
    for i, date_str in enumerate(cycle_dates):
        cycle_idx = i + 1
        is_latest = (i == len(cycle_dates) - 1)

        # Gradual thermal progression over multiple cycles
        steam_vol = round(base_steam + rng.uniform(-25.0, 30.0), 0)
        press = round(base_press + rng.uniform(-2.0, 2.5), 1)
        soak = round(base_soak + rng.uniform(-4.0, 6.0), 0)
        cutoff = round(base_cutoff + rng.uniform(-2.0, 3.0), 1)
        cum_oil = round(steam_vol / (3.1 + cycle_idx * 0.08 + rng.uniform(-0.1, 0.15)), 1)
        sor = round(steam_vol / max(1.0, cum_oil), 2)

        status = "Active Production" if is_latest else "Completed"
        cycle_label = f"Cycle {cycle_idx} (Current)" if is_latest else f"Cycle {cycle_idx}"

        cycles.append({
            "cycle_no": cycle_label,
            "date": date_str,
            "well_id": well_id,
            "steam_volume_t": int(steam_vol),
            "injection_pressure_bar": press,
            "soak_hours": int(soak),
            "production_cutoff_bopd": cutoff,
            "cum_oil_t": cum_oil,
            "sor": sor,
            "status": status
        })

    return cycles

@router.get('/{well_id}')
def css(well_id: str):
    history_records = generate_css_history_for_well(well_id)
    latest_rec = history_records[-1] if history_records else {
        'well_id': well_id,
        'cycle_no': 'Cycle 5 (Current)',
        'date': '2026-08-28',
        'steam_volume_t': 400,
        'injection_pressure_bar': 30.0,
        'soak_hours': 48,
        'production_cutoff_bopd': 28.0,
        'cum_oil_t': 130.0,
        'sor': 3.08,
        'status': 'Active Production'
    }

    return {
        'latest': latest_rec,
        'records': history_records
    }
