from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean
from app.database.db import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(120))
    email = Column(String(180), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(30), default='user')

class Well(Base):
    __tablename__ = 'wells'
    id = Column(Integer, primary_key=True)
    well_code = Column(String(64), unique=True)
    name = Column(String(120))
    field = Column(String(120), default='Baghewala')
    status = Column(String(60), default='Operational')
    is_demonstration = Column(Boolean, default=True)
    api_gravity = Column(Float)
    reservoir_temp_c = Column(Float)
    reservoir_pressure_bar = Column(Float)

class Prediction(Base):
    __tablename__ = 'predictions'
    id = Column(Integer, primary_key=True)
    well_id = Column(Integer, ForeignKey('wells.id'))
    predicted_at = Column(DateTime)
    model_name = Column(String(120))
    prediction = Column(JSON)
    confidence = Column(Float)
