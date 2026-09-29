from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

from app.twin.state import WellState


MODELS_FOLDER = Path(__file__).resolve().parents[2] / "models"


FEATURES = [
    "phase_code",
    "steam_rate_tph",
    "steam_volume_t",
    "injection_pressure_bar",
    "soak_hours",
    "temperature_c",
    "pressure_bar",
    "oil_viscosity_cp",
    "water_cut_pct",
    "oil_bopd",
    "stroke_m",
    "spm",
    "vfd_hz",
    "pump_efficiency_pct",
    "rod_load_kn",
    "fluid_level_m",
    "energy_kwh",
    "sor",
    "rod_floating_risk",
    "pump_failure_risk",
]


def phase_number(phase: str) -> int:
    return {
        "INJECTION": 0,
        "SOAK": 1,
        "PRODUCTION": 2,
    }.get(phase, 2)


@lru_cache(maxsize=1)
def load_ai_models():
    """
    Loads models once when the backend starts using them.
    Later forecasts reuse the same models for speed.
    """
    return (
        joblib.load(MODELS_FOLDER / "production_model.pkl"),
        joblib.load(MODELS_FOLDER / "temperature_model.pkl"),
        joblib.load(MODELS_FOLDER / "energy_model.pkl"),
        joblib.load(MODELS_FOLDER / "rod_risk_model.pkl"),
    )


def create_feature_row(state: WellState) -> pd.DataFrame:
    data = state.to_dict()
    data["phase_code"] = phase_number(state.current_phase)

    row = {
        feature: float(data.get(feature, 0) or 0)
        for feature in FEATURES
    }

    return pd.DataFrame([row], columns=FEATURES)


def predict_from_twin(state: WellState) -> dict:
    """
    Uses trained models to forecast the next operating interval.
    """
    (
        production_model,
        temperature_model,
        energy_model,
        risk_model,
    ) = load_ai_models()

    features = create_feature_row(state)

    predicted_production = float(production_model.predict(features)[0])
    predicted_temperature = float(temperature_model.predict(features)[0])
    predicted_energy = float(energy_model.predict(features)[0])

    risk_probability = float(
        risk_model.predict_proba(features)[0][1]
    )

    return {
        "model_status": "TRAINED_SYNTHETIC_PROTOTYPE",
        "forecast_horizon": "next virtual operating interval",
        "predicted_oil_bopd": round(predicted_production, 2),
        "predicted_temperature_c": round(predicted_temperature, 2),
        "predicted_energy_kwh": round(predicted_energy, 2),
        "rod_floating_high_risk_probability": round(
            risk_probability,
            3,
        ),
        "risk_level": (
            "HIGH" if risk_probability >= 0.50 else "NORMAL"
        ),
    }