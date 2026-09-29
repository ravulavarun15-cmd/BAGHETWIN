from fastapi import APIRouter
from app.ml.model_loader import latest
from app.ml.predictors import anomaly
router=APIRouter()
@router.get('/{well_id}')
def anomalies(well_id:str):
 w=latest('well_data.csv',well_id); s=latest('srp_data.csv',well_id); f={**w,**s}; a=anomaly(f); risk=float(a.get('risk',.2)); current={'pump_condition':'NORMAL' if risk<.7 else 'WARNING','rod_load':f'{f.get("rod_load_kn",32)} kN','rod_floating':'HIGH RISK' if risk>.7 else ('MEDIUM RISK' if risk>.4 else 'LOW RISK'),'motor_condition':'NORMAL','production_decline':'HIGH RISK' if float(f.get('production_rate',42) or 42)<30 else 'LOW RISK'}; predicted={'pump_condition':'WARNING' if risk>.65 else 'NORMAL','rod_load':f'{round(float(f.get("rod_load_kn",32) or 32)*.94,1)} kN','rod_floating':'HIGH RISK' if risk>.65 else 'LOW RISK','motor_condition':'NORMAL','production_decline':'MEDIUM RISK' if float(f.get('production_rate',42) or 42)<35 else 'LOW RISK'}; return {'current':current,'predicted':predicted,'model':a}
