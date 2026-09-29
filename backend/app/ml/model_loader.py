from pathlib import Path
import joblib,pandas as pd
ROOT=Path(__file__).resolve().parents[2]; MODEL_DIR=ROOT/'models'; DATA_DIR=ROOT/'data'
def load_model(name):
 p=MODEL_DIR/name
 if not p.exists(): return None
 try:return joblib.load(p)
 except Exception:return None
def load_csv(name):
 p=DATA_DIR/name
 return pd.read_csv(p) if p.exists() else None
def records(name,well_id=None):
 df=load_csv(name)
 if df is None:return []
 if well_id:
  cols={c.lower():c for c in df.columns}; wc=next((cols[k] for k in cols if k in ('well_id','well_code','well')),None)
  if wc: df=df[df[wc].astype(str)==well_id]
 return df.fillna('').to_dict('records')
def latest(name,well_id=None):
 r=records(name,well_id); return r[-1] if r else {}
