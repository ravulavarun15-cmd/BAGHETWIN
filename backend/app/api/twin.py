from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.twin.service import digital_twin
from app.twin.recommendations import get_srp_recommendation
from app.twin.ml_predictor import predict_from_twin
from app.twin.optimizer import optimize_srp

router = APIRouter()


class PhaseRequest(BaseModel):
    phase: str


@router.get("/state")
def get_twin_state():
    """Get the current virtual well condition."""
    return digital_twin.get_state()


@router.post("/start")
def start_twin():
    """Start the virtual well."""
    return digital_twin.start()


@router.post("/pause")
def pause_twin():
    """Pause the virtual well."""
    return digital_twin.pause()


@router.post("/reset")
def reset_twin():
    """Return the virtual well to its original condition."""
    return digital_twin.reset()


@router.post("/phase")
def change_phase(request: PhaseRequest):
    """
    Change the CSS phase:
    INJECTION, SOAK, or PRODUCTION.
    """
    try:
        return digital_twin.set_phase(request.phase.upper())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
@router.post("/apply-recommendation")
def apply_recommendation():
    """
    Applies the current safe SRP recommendation to the virtual well.
    """
    return digital_twin.apply_safe_srp_settings() 
@router.get("/optimize-srp")
def get_srp_optimization():
    """
    Tests SRP settings using the trained AI models and returns
    the best safe operating recommendation.
    """
    return optimize_srp(digital_twin.state)     
@router.get("/prediction")
def get_prediction():
    """
    Returns forecasts from the trained prototype AI models.
    """
    return predict_from_twin(digital_twin.state)          
@router.get("/recommendation")
def get_recommendation():
    """
    Returns a safe SRP recommendation for the current live Twin state.
    """
    return get_srp_recommendation(digital_twin.state)
@router.post("/disturbance/high-speed")
def high_speed_disturbance():
    """
    Creates a risky high-speed SRP operating condition.
    """
    return digital_twin.create_high_speed_disturbance()
@router.post("/advance")
def advance_twin():
    """
    Move the virtual well one step forward.
    The frontend will call this every few seconds later.
    """
    return digital_twin.advance_one_step()