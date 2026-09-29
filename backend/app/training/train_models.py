import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    mean_absolute_error,
    mean_squared_error,
)
from sklearn.model_selection import train_test_split


DATA_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "training_data.csv"
)

MODELS_FOLDER = (
    Path(__file__).resolve().parents[2]
    / "models"
)

METRICS_FILE = MODELS_FOLDER / "model_metrics.json"


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


def regression_metrics(model, x_test, y_test) -> dict:
    predictions = model.predict(x_test)

    return {
        "mae": round(float(mean_absolute_error(y_test, predictions)), 4),
        "rmse": round(
            float(mean_squared_error(y_test, predictions) ** 0.5),
            4,
        ),
    }


def train_models():
    """
    Trains ML models using the domain-informed synthetic dataset.

    These models are prototype models. They must be retrained and
    validated with actual OIL field data before real deployment.
    """
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            "training_data.csv was not found. "
            "Run generate_dataset.py first."
        )

    MODELS_FOLDER.mkdir(parents=True, exist_ok=True)

    dataset = pd.read_csv(DATA_FILE)
    x = dataset[FEATURES]

    x_train, x_test, indices_train, indices_test = train_test_split(
        x,
        dataset.index,
        test_size=0.20,
        random_state=26120,
    )

    # 1. Next-step oil-production forecast.
    production_target = dataset["next_oil_bopd"]
    production_model = RandomForestRegressor(
        n_estimators=150,
        random_state=26120,
        n_jobs=-1,
    )
    production_model.fit(x_train, production_target.loc[indices_train])

    # 2. Reservoir-temperature forecast.
    temperature_target = dataset["next_temperature_c"]
    temperature_model = RandomForestRegressor(
        n_estimators=150,
        random_state=26120,
        n_jobs=-1,
    )
    temperature_model.fit(x_train, temperature_target.loc[indices_train])

    # 3. Energy forecast.
    energy_target = dataset["next_energy_kwh"]
    energy_model = RandomForestRegressor(
        n_estimators=150,
        random_state=26120,
        n_jobs=-1,
    )
    energy_model.fit(x_train, energy_target.loc[indices_train])

    # 4. Rod-floating risk classification.
    risk_target = dataset["high_rod_floating_risk"]
    risk_model = RandomForestClassifier(
        n_estimators=150,
        random_state=26120,
        n_jobs=-1,
        class_weight="balanced",
    )
    risk_model.fit(x_train, risk_target.loc[indices_train])

    metrics = {
        "dataset_rows": int(len(dataset)),
        "features": FEATURES,
        "production_model": regression_metrics(
            production_model,
            x_test,
            production_target.loc[indices_test],
        ),
        "temperature_model": regression_metrics(
            temperature_model,
            x_test,
            temperature_target.loc[indices_test],
        ),
        "energy_model": regression_metrics(
            energy_model,
            x_test,
            energy_target.loc[indices_test],
        ),
        "rod_risk_accuracy": round(
            float(
                accuracy_score(
                    risk_target.loc[indices_test],
                    risk_model.predict(x_test),
                )
            ),
            4,
        ),
    }

    joblib.dump(production_model, MODELS_FOLDER / "production_model.pkl")
    joblib.dump(temperature_model, MODELS_FOLDER / "temperature_model.pkl")
    joblib.dump(energy_model, MODELS_FOLDER / "energy_model.pkl")
    joblib.dump(risk_model, MODELS_FOLDER / "rod_risk_model.pkl")

    with METRICS_FILE.open("w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=2)

    print("AI models trained successfully.")
    print(f"Saved models in: {MODELS_FOLDER}")
    print("Model evaluation metrics:")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    train_models()