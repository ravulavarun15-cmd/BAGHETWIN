from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone


@dataclass
class WellState:
    # Identity and simulator status
    well_id: str = "BGW-001"
    simulation_status: str = "STOPPED"
    current_phase: str = "PRODUCTION"

    # CSS: Cyclic Steam Stimulation values
    steam_rate_tph: float = 0.0
    steam_volume_t: float = 400.0
    injection_pressure_bar: float = 30.0
    soak_hours: float = 48.0

    # Reservoir and production values
    temperature_c: float = 47.0
    pressure_bar: float = 18.0
    oil_viscosity_cp: float = 2450.0
    water_cut_pct: float = 31.0
    oil_bopd: float = 28.0

    # SRP: Sucker Rod Pump values
    stroke_m: float = 2.8
    spm: float = 5.5
    vfd_hz: float = 45.0
    pump_efficiency_pct: float = 78.0
    rod_load_kn: float = 32.0
    fluid_level_m: float = 900.0

    # Calculated operating values
    energy_kwh: float = 120.0
    sor: float = 4.0
    rod_floating_risk: float = 0.12
    pump_failure_risk: float = 0.08

    # Time of the most recent virtual sensor update
    last_updated: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict:
        return asdict(self)


def create_initial_state(well_id: str = "BGW-001") -> WellState:
    """
    Creates the first virtual state of one Baghewala prototype well.
    Later, the simulator will continuously update this state.
    """
    return WellState(well_id=well_id)