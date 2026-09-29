from fastapi import APIRouter
from app.ml.model_loader import latest
from app.ml.optimizers import css_optimize,srp_optimize
router=APIRouter()
@router.post('/css/{well_id}')
def css(well_id:str): return css_optimize(latest('css_data.csv',well_id) or {})
@router.post('/srp/{well_id}')
def srp(well_id:str): return srp_optimize(latest('srp_data.csv',well_id) or {})
