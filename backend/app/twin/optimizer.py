from copy import deepcopy

from app.twin.ml_predictor import predict_from_twin
from app.twin.simulator import WellSimulator
from app.twin.state import WellState


def optimize_srp(state: WellState) -> dict:
    """
    Tests SRP operating settings and chooses the safest,
    best-performing option using trained AI forecasts.
    """

    candidates = [
        {"spm": 4.5, "vfd_hz": 40.0, "stroke_m": 2.6},
        {"spm": 5.0, "vfd_hz": 42.0, "stroke_m": 2.7},
        {"spm": 5.5, "vfd_hz": 45.0, "stroke_m": 2.8},
        {"spm": 6.0, "vfd_hz": 48.0, "stroke_m": 2.9},
        {"spm": 6.5, "vfd_hz": 50.0, "stroke_m": 3.0},
    ]

    evaluated_options = []

    for candidate in candidates:
        test_state = deepcopy(state)

        test_state.spm = candidate["spm"]
        test_state.vfd_hz = candidate["vfd_hz"]
        test_state.stroke_m = candidate["stroke_m"]

        # Calculate the resulting Twin condition first.
        test_simulator = WellSimulator(test_state)
        test_simulator.advance()

        # Ask trained models for production, energy, and risk forecasts.
        forecast = predict_from_twin(test_state)
        risk_probability = forecast[
            "rod_floating_high_risk_probability"
        ]

        # Unsafe options are rejected.
        is_safe = risk_probability < 0.50

        # Higher production is good; high energy and risk reduce score.
        score = (
            forecast["predicted_oil_bopd"]
            - (forecast["predicted_energy_kwh"] * 0.08)
            - (risk_probability * 30)
        )

        evaluated_options.append(
            {
                **candidate,
                "safe": is_safe,
                "score": round(score, 2),
                "predicted_oil_bopd": forecast["predicted_oil_bopd"],
                "predicted_energy_kwh": forecast[
                    "predicted_energy_kwh"
                ],
                "rod_risk_probability": risk_probability,
            }
        )

    safe_options = [
        option for option in evaluated_options if option["safe"]
    ]

    # If no setting is safe, select the lowest-risk option.
    if safe_options:
        best_option = max(safe_options, key=lambda option: option["score"])
    else:
        best_option = min(
            evaluated_options,
            key=lambda option: option["rod_risk_probability"],
        )

    return {
        "method": "trained_AI_scenario_optimizer",
        "current_settings": {
            "spm": state.spm,
            "vfd_hz": state.vfd_hz,
            "stroke_m": state.stroke_m,
        },
        "recommendation": best_option,
        "evaluated_options": evaluated_options,
        "explanation": (
            "The optimizer tested five SRP settings and selected the "
            "best safe option using predicted production, energy use, "
            "and rod-floating risk."
        ),
    }