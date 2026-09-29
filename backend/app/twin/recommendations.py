from app.twin.state import WellState


def get_srp_recommendation(state: WellState) -> dict:
    """
    Creates a safe SRP recommendation from the current Twin condition.
    """

    current_risk = state.rod_floating_risk

    if current_risk >= 0.5:
        recommended_spm = 5.5
        recommended_vfd_hz = 45.0
        recommended_efficiency = 78.0

        expected_risk = 0.26
        risk_level = "HIGH"
        action = "Reduce pump speed immediately"

        reason = (
            "High SPM and VFD frequency are increasing rod load and "
            "rod-floating risk. Reduce the pump speed to a safer range."
        )

    else:
        recommended_spm = state.spm
        recommended_vfd_hz = state.vfd_hz
        recommended_efficiency = state.pump_efficiency_pct

        expected_risk = current_risk
        risk_level = "NORMAL"
        action = "Maintain current SRP settings"

        reason = (
            "Current SRP settings are within the prototype's safe "
            "operating range."
        )

    return {
        "risk_level": risk_level,
        "action": action,
        "reason": reason,
        "current_spm": state.spm,
        "current_vfd_hz": state.vfd_hz,
        "current_risk": current_risk,
        "recommended_spm": recommended_spm,
        "recommended_vfd_hz": recommended_vfd_hz,
        "recommended_pump_efficiency_pct": recommended_efficiency,
        "expected_risk_after": expected_risk,
        "expected_risk_reduction_pct": round(
            max(0, current_risk - expected_risk) * 100,
            1,
        ),
    }