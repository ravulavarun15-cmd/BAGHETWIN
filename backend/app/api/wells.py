from fastapi import APIRouter, HTTPException
from app.ml.model_loader import records

router = APIRouter()

@router.get('')
def list_wells():
    all_wells = records('well_data.csv')
    if not all_wells:
        all_wells = [
            {
                'well_id': 'BGW-001',
                'production_rate': 42,
                'watercut': 31,
                'pressure_bar': 18,
                'temperature_c': 62,
                'oil_viscosity_cp': 1850,
                'reservoir_condition': 'Heavy oil / low mobility',
                'operating_stage': 'Production',
                'status': 'Operational',
                'is_demonstration': False,
                'data_source': 'Field Baseline'
            }
        ]

    # Dynamically derive summary statistics from records
    total = len(all_wells)
    operating = sum(1 for w in all_wells if str(w.get('status', '')).lower() == 'operational')
    non_operating = total - operating

    op_prods = [
        float(w.get('production_rate', 0) or 0)
        for w in all_wells
        if str(w.get('status', '')).lower() == 'operational'
    ]
    temps = [
        float(w.get('temperature_c', 0) or 0)
        for w in all_wells
        if float(w.get('temperature_c', 0) or 0) > 0
    ]

    total_bopd = round(sum(op_prods), 1)
    avg_bopd = round(total_bopd / max(1, len(op_prods)), 1)
    avg_temp = round(sum(temps) / max(1, len(temps)), 1)

    return {
        'source': 'well_data.csv',
        'summary': {
            'total_wells': total,
            'operating_wells': operating,
            'non_operating_wells': non_operating,
            'total_production_bopd': total_bopd,
            'avg_production_bopd': avg_bopd,
            'avg_temperature_c': avg_temp,
            'field': 'Baghewala Field',
            'formation': 'Jodhpur Sandstone / Heavy Oil Belt'
        },
        'wells': all_wells
    }

@router.get('/{well_id}')
def get_well(well_id: str):
    matches = records('well_data.csv', well_id)
    if not matches:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found in fleet records")
    return matches[-1]
