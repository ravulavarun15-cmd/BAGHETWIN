import csv
import random
from pathlib import Path

from app.twin.simulator import WellSimulator
from app.twin.state import create_initial_state


OUTPUT_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "training_data.csv"
)


def phase_number(phase: str) -> int:
    phases = {
        "INJECTION": 0,
        "SOAK": 1,
        "PRODUCTION": 2,
    }
    return phases[phase]


def build_training_dataset():
    """
    Generates synthetic, domain-informed Baghewala well data.

    This is for prototype ML training only. It does not claim to be
    actual Oil India field data.
    """
    random_generator = random.Random(26120)

    columns = [
        "scenario_id",
        "time_step",
        "phase",
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
        "next_temperature_c",
        "next_oil_bopd",
        "next_energy_kwh",
        "next_rod_floating_risk",
        "high_rod_floating_risk",
    ]

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()

        # 60 different virtual operating scenarios × 100 time steps.
        for scenario_id in range(60):
            state = create_initial_state("BGW-001")

            # Start each scenario with different but safe/unsafe conditions.
            state.temperature_c = random_generator.uniform(46.0, 55.0)
            state.pressure_bar = random_generator.uniform(14.0, 22.0)
            state.oil_bopd = random_generator.uniform(20.0, 40.0)
            state.spm = random_generator.uniform(4.5, 8.0)
            state.stroke_m = random_generator.uniform(2.4, 3.2)
            state.vfd_hz = random_generator.uniform(38.0, 60.0)
            state.pump_efficiency_pct = random_generator.uniform(60.0, 85.0)
            state.steam_volume_t = random_generator.uniform(250.0, 500.0)
            state.injection_pressure_bar = random_generator.uniform(25.0, 38.0)
            state.soak_hours = random_generator.uniform(24.0, 60.0)

            simulator = WellSimulator(state)

            for time_step in range(100):
                # One full CSS sequence in each virtual scenario.
                if time_step < 20:
                    state.current_phase = "INJECTION"
                elif time_step < 35:
                    state.current_phase = "SOAK"
                else:
                    state.current_phase = "PRODUCTION"

                current_row = {
                    "scenario_id": scenario_id,
                    "time_step": time_step,
                    "phase": state.current_phase,
                    "phase_code": phase_number(state.current_phase),
                    "steam_rate_tph": state.steam_rate_tph,
                    "steam_volume_t": state.steam_volume_t,
                    "injection_pressure_bar": state.injection_pressure_bar,
                    "soak_hours": state.soak_hours,
                    "temperature_c": state.temperature_c,
                    "pressure_bar": state.pressure_bar,
                    "oil_viscosity_cp": state.oil_viscosity_cp,
                    "water_cut_pct": state.water_cut_pct,
                    "oil_bopd": state.oil_bopd,
                    "stroke_m": state.stroke_m,
                    "spm": state.spm,
                    "vfd_hz": state.vfd_hz,
                    "pump_efficiency_pct": state.pump_efficiency_pct,
                    "rod_load_kn": state.rod_load_kn,
                    "fluid_level_m": state.fluid_level_m,
                    "energy_kwh": state.energy_kwh,
                    "sor": state.sor,
                    "rod_floating_risk": state.rod_floating_risk,
                    "pump_failure_risk": state.pump_failure_risk,
                }

                # Move to the next virtual operating moment.
                next_state = simulator.advance()

                current_row["next_temperature_c"] = next_state.temperature_c
                current_row["next_oil_bopd"] = next_state.oil_bopd
                current_row["next_energy_kwh"] = next_state.energy_kwh
                current_row["next_rod_floating_risk"] = (
                    next_state.rod_floating_risk
                )
                current_row["high_rod_floating_risk"] = int(
                    next_state.rod_floating_risk >= 0.50
                )

                writer.writerow(current_row)

    print(f"Created training dataset: {OUTPUT_FILE}")
    print("Rows created: 6000")


if __name__ == "__main__":
    build_training_dataset()