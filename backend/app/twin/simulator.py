import math
import random
from datetime import datetime, timezone

from app.twin.state import WellState


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


class WellSimulator:
    """
    Simplified domain-informed Baghewala heavy-oil well simulator.

    Each advance() call represents one virtual operating interval.
    """

    def __init__(self, state: WellState):
        self.state = state
        self.random = random.Random(26120)

    def advance(self) -> WellState:
        s = self.state
        noise = self.random.uniform(-0.15, 0.15)

        # CSS behaviour: steam heats the reservoir; production cools it.
        if s.current_phase == "INJECTION":
            s.steam_rate_tph = 12.0
            s.steam_volume_t += s.steam_rate_tph
            s.temperature_c += 0.35 + noise
            s.pressure_bar += 0.05 + noise * 0.1

        elif s.current_phase == "SOAK":
            s.steam_rate_tph = 0.0
            s.temperature_c += 0.04 + noise * 0.1

        else:  # PRODUCTION
            s.steam_rate_tph = 0.0
            s.temperature_c -= 0.06 + noise * 0.05
            s.pressure_bar -= 0.03 + noise * 0.02

        s.temperature_c = clamp(s.temperature_c, 46.0, 95.0)
        s.pressure_bar = clamp(s.pressure_bar, 8.0, 45.0)

        # Higher temperature reduces heavy-oil viscosity.
        s.oil_viscosity_cp = round(
            clamp(
                6000 * math.exp(-0.019 * s.temperature_c),
                300.0,
                3500.0,
            ),
            1,
        )

        # Heavy oil and high pump speed reduce pump efficiency over time.
        viscosity_penalty = (
            max(0.0, s.oil_viscosity_cp - 900.0) / 95.0
        )
        speed_penalty = max(0.0, s.spm - 5.5) * 3.0
        vfd_penalty = max(0.0, s.vfd_hz - 45.0) * 0.18

        target_efficiency = clamp(
            88.0 - viscosity_penalty - speed_penalty - vfd_penalty,
            55.0,
            85.0,
        )

        s.pump_efficiency_pct += (
            (target_efficiency - s.pump_efficiency_pct) * 0.12
            + noise * 0.25
        )
        s.pump_efficiency_pct = round(
            clamp(s.pump_efficiency_pct, 55.0, 85.0),
            2,
        )

        # Production depends on temperature, pump efficiency, and SRP lift.
        temperature_factor = 1 + ((s.temperature_c - 47.0) * 0.045)
        pump_factor = s.pump_efficiency_pct / 70.0
        speed_factor = (s.spm / 5.5) * (s.stroke_m / 2.8)

        target_oil_bopd = 28.0 * temperature_factor * pump_factor * speed_factor

        s.oil_bopd += (
            (target_oil_bopd - s.oil_bopd) * 0.20 + noise
        )
        s.oil_bopd = round(clamp(s.oil_bopd, 5.0, 120.0), 2)

        # Fluid level responds gradually to production and viscosity.
        target_fluid_level = clamp(
            940.0
            + (s.oil_viscosity_cp / 25.0)
            - (s.oil_bopd * 2.2),
            700.0,
            1200.0,
        )

        s.fluid_level_m += (
            (target_fluid_level - s.fluid_level_m) * 0.08
            + noise * 0.8
        )
        s.fluid_level_m = round(
            clamp(s.fluid_level_m, 700.0, 1200.0),
            2,
        )

        # Rod load reacts to pumping speed, efficiency, and viscous fluid.
        viscosity_load = max(
            0.0,
            (s.oil_viscosity_cp - 1800.0) / 450.0,
        )

        s.rod_load_kn = round(
            clamp(
                20.0
                + (s.spm * 2.4)
                + (s.stroke_m * 2.8)
                + ((100.0 - s.pump_efficiency_pct) * 0.18)
                + (viscosity_load * 1.5)
                + noise,
                15.0,
                65.0,
            ),
            2,
        )

        # Energy reacts to VFD, SPM, steam use, and pump efficiency.
        s.energy_kwh = round(
            clamp(
                45.0
                + (s.vfd_hz * 1.1)
                + (s.spm * 5.0)
                + (s.steam_rate_tph * 2.5)
                + ((80.0 - s.pump_efficiency_pct) * 0.7),
                40.0,
                250.0,
            ),
            2,
        )

        # Mechanical risk reacts continuously to changing live conditions.
        rod_stress = max(0.0, (s.rod_load_kn - 35.0) / 25.0)
        speed_stress = max(0.0, (s.spm - 5.5) / 2.5)
        vfd_stress = max(0.0, (s.vfd_hz - 45.0) / 15.0)

        s.rod_floating_risk = round(
            clamp(
                0.08
                + (rod_stress * 0.45)
                + (speed_stress * 0.25)
                + ((75.0 - s.pump_efficiency_pct) / 120.0),
                0.02,
                0.98,
            ),
            3,
        )

        s.pump_failure_risk = round(
            clamp(
                0.05
                + (rod_stress * 0.30)
                + (vfd_stress * 0.20)
                + ((80.0 - s.pump_efficiency_pct) / 100.0),
                0.02,
                0.98,
            ),
            3,
        )

        if s.oil_bopd > 0:
            s.sor = round(
                s.steam_volume_t / max(s.oil_bopd, 1.0),
                2,
            )

        s.last_updated = datetime.now(timezone.utc).isoformat()

        return s