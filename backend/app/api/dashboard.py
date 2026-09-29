from fastapi import APIRouter
from app.ml.model_loader import records
router=APIRouter()
@router.get('/{well_id}')
def dash(well_id:str):
 w=records('well_data.csv',well_id); c=records('css_data.csv',well_id); s=records('srp_data.csv',well_id); p=records('production_data.csv',well_id)
 if not w:w=[{'well_id':well_id,'production_rate':42,'watercut':31,'pressure_bar':18,'temperature_c':62,'oil_viscosity_cp':1850,'reservoir_condition':'Heavy oil / low mobility','operating_stage':'Production'}]
 wl=w[-1]; pr=p[-1] if p else wl
 return {'well':{'latest':wl,'records':w},'production':{'latest':pr,'trend':p[-7:] or [{'date':f'D-{6-i}','oil_bopd':36+i,'temperature_c':68-i} for i in range(7)]},'css':{'latest':c[-1] if c else {}},'srp':{'latest':s[-1] if s else {}},'prediction':{'next_day_production':round(float(pr.get('production_rate',42))*1.05,2)},'anomaly':{'rod_floating_label':'LOW','pump_condition':'NORMAL'}}
