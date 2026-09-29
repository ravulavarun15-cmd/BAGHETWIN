import numpy as np
from .model_loader import load_model,latest

def production(features):
 model=load_model('production_model.pkl')
 if model is not None:
  names=getattr(model,'feature_names_in_',list(features.keys())); x=[[float(features.get(str(n),0) or 0) for n in names]]
  try:
   v=float(np.asarray(model.predict(x)).reshape(-1)[0]); return {'available':True,'next_day_production':v,'next_7_day_avg':v*0.99,'confidence':0.86,'model':'production_model.pkl'}
  except Exception: pass
 oil=float(features.get('production_rate',features.get('oil_bopd',42)) or 42); temp=float(features.get('temperature_c',62) or 62); risk=float(features.get('rod_floating_risk',.25) or .25)
 v=max(0,oil*(1+0.035*(temp-60)/10-0.08*risk)); return {'available':False,'next_day_production':round(v,2),'next_7_day_avg':round(v*.99,2),'confidence':.62,'model':'fallback ML-compatible estimator'}
def anomaly(features):
 model=load_model('anomaly_model.pkl')
 if model is not None:
  names=getattr(model,'feature_names_in_',list(features.keys())); x=[[float(features.get(str(n),0) or 0) for n in names]]
  try:
   pred=int(np.asarray(model.predict(x)).reshape(-1)[0]); score=float(np.asarray(model.decision_function(x)).reshape(-1)[0]) if hasattr(model,'decision_function') else 0; return {'available':True,'anomaly':pred,'score':score}
  except Exception:pass
 load=float(features.get('rod_load_kn',features.get('rod_load',32)) or 32); prod=float(features.get('production_rate',features.get('oil_bopd',42)) or 42); spm=float(features.get('spm',5.2) or 5.2)
 risk=min(0.98,max(.05,.25+(load>40)*.3+(spm>6)*.18+(prod<30)*.2)); return {'available':False,'anomaly':int(risk>.65),'score':round(1-risk,3),'risk':risk}
