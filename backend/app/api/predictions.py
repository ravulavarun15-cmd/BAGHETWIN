from fastapi import APIRouter
from app.ml.model_loader import latest
from app.ml.predictors import production
from app.ml.optimizers import srp_optimize,css_optimize
router=APIRouter()
@router.get('/{well_id}')
def pred(well_id:str):
 w=latest('well_data.csv',well_id); c=latest('css_data.csv',well_id); s=latest('srp_data.csv',well_id); f={**w,**c,**s}; p=production(f); so=srp_optimize(f); co=css_optimize(f)
 return {'production':p,'srp':{'recommended_spm':so['spm'],'recommended_vfd_hz':so['vfd_hz'],'rod_floating_risk_after':so['rod_floating_risk_after']},'css':co}
