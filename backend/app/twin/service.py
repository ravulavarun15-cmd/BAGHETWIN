import threading
import time

from app.twin.simulator import WellSimulator
from app.twin.state import WellState, create_initial_state


class DigitalTwinService:
    """
    Controls one virtual Baghewala well.
    When started, it updates the well every 2 seconds.
    """

    def __init__(self):
        self.state: WellState = create_initial_state()
        self.simulator = WellSimulator(self.state)

        self.lock = threading.RLock()
        self.worker: threading.Thread | None = None

    def get_state(self) -> dict:
        with self.lock:
            return self.state.to_dict()

    def start(self) -> dict:
        with self.lock:
            self.state.simulation_status = "RUNNING"

            if self.worker is None or not self.worker.is_alive():
                self.worker = threading.Thread(
                    target=self._run_simulation,
                    daemon=True,
                )
                self.worker.start()

            return self.get_state()

    def _run_simulation(self):
        """Updates the virtual well every 2 seconds while it is running."""
        while True:
            time.sleep(2)

            with self.lock:
                if self.state.simulation_status != "RUNNING":
                    break

                self.simulator.advance()

    def pause(self) -> dict:
        with self.lock:
            self.state.simulation_status = "PAUSED"
            return self.get_state()

    def reset(self) -> dict:
        with self.lock:
            self.state = create_initial_state(self.state.well_id)
            self.simulator = WellSimulator(self.state)
            return self.get_state()

    def set_phase(self, phase: str) -> dict:
        allowed_phases = ["INJECTION", "SOAK", "PRODUCTION"]

        if phase not in allowed_phases:
            raise ValueError(
                "Phase must be INJECTION, SOAK, or PRODUCTION."
            )

        with self.lock:
            self.state.current_phase = phase
            return self.get_state()

    def create_high_speed_disturbance(self) -> dict:
        """
        Simulates unsafe high-speed SRP operation.
        """
        with self.lock:
            self.state.spm = 8.0
            self.state.vfd_hz = 60.0
            self.state.pump_efficiency_pct = 65.0

            return self.get_state()

    def apply_safe_srp_settings(self) -> dict:
        """
        Applies the recommendation: safe pump speed and VFD frequency.
        """
        with self.lock:
            self.state.spm = 5.5
            self.state.vfd_hz = 45.0
            self.state.pump_efficiency_pct = 78.0

            # Immediately recalculate rod load and risk.
            self.simulator.advance()

            return self.get_state()

    def advance_one_step(self) -> dict:
        """Moves the virtual well forward once for manual testing."""
        with self.lock:
            if self.state.simulation_status == "RUNNING":
                self.simulator.advance()

            return self.get_state()


digital_twin = DigitalTwinService()