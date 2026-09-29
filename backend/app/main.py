from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.db import init_db
from app.api import auth, wells, dashboard, css, srp, predictions, anomalies, optimization, twin, copilot, history

app = FastAPI(title='BAGHETWIN Industrial Digital Twin API', version='2.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(',')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.on_event('startup')
def startup():
    init_db()

@app.get('/api/health')
def health():
    return {'status': 'ok', 'project': 'BAGHETWIN', 'field': 'Baghewala'}

app.include_router(auth.router, prefix='/api/auth', tags=['auth'])
app.include_router(wells.router, prefix='/api/wells', tags=['wells'])
app.include_router(dashboard.router, prefix='/api/dashboard', tags=['dashboard'])
app.include_router(css.router, prefix='/api/css', tags=['css'])
app.include_router(srp.router, prefix='/api/srp', tags=['srp'])
app.include_router(predictions.router, prefix='/api/predictions', tags=['predictions'])
app.include_router(anomalies.router, prefix='/api/anomalies', tags=['anomalies'])
app.include_router(optimization.router, prefix='/api/optimization', tags=['optimization'])
app.include_router(twin.router, prefix='/api/twin', tags=['digital-twin'])
app.include_router(copilot.router, prefix='/api/copilot', tags=['copilot'])
app.include_router(history.router, prefix='/api/history', tags=['history'])