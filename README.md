# BAGHETWIN — Industrial Digital Twin Platform (Baghewala Heavy Oil Field)

Comprehensive Industrial Digital Twin platform for heavy-oil thermal recovery, Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) optimization in the Baghewala Field, Rajasthan.

## Technology Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Three.js (WebGL) + Recharts + Lucide Icons
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy
- **Database:** PostgreSQL 16 (with resilient dataset & physics engine fallback)
- **Machine Learning:** Scikit-learn + Joblib (`production_model.pkl`, `temperature_model.pkl`, `energy_model.pkl`, `rod_risk_model.pkl`, `anomaly_model.pkl`)
- **Physics Simulator:** Dynamic thermodynamic CSS cycle simulator and API 11E kinematic solver

## Platform Capabilities
1. **Unified 35-Well Fleet Monitoring:** 
   - 35 total wells: exactly 28 operating in active production and 7 non-operating awaiting field status confirmation.
   - Dynamic summary derivation, search, status filters, and demonstration record tags.
2. **Interactive 3D Oil Rig Digital Twin:**
   - Full surface assembly (Skid base, Samson post, walking beam, horsehead, pitman arm, crank, gearbox, electric motor, VFD, wellhead, stuffing box).
   - Subsurface assembly (Casing, tubing, sucker rod string, downhole pump barrel, plunger, valves, reservoir sand, steam line).
   - Real-time kinematic linkage animation driven by live SPM.
   - Surface, Subsurface, and Operational camera presets.
3. **BAGHETWIN Copilot AI:**
   - Real-time operational intelligence assistant grounded in telemetry, 35-well fleet records, and local ML models.
   - Accessible via dedicated navigation and floating bottom-right assistant drawer.
4. **Interface Animation & Custom Cursor System:**
   - Tactile micro-interactions, responsive glassmorphism, smooth card elevations, and hardware-accelerated custom cursor.
   - Full accessibility compliance with `prefers-reduced-motion` and touch screen detection.
5. **CSS & SRP Optimization:**
   - AI scenario testing for optimal SPM and VFD frequency to eliminate hydrodynamic rod floating and reduce Steam-Oil Ratio (SOR).

## Run Locally or with Docker
### Option A: Local Development
1. **Backend:**
   ```bash
   cd backend
   .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
3. Open `http://localhost:5173`

### Option B: Docker Compose
```bash
docker compose up --build
```

### Demonstration Accounts
- **Field Supervisor:** `admin@sih26120.local` / `admin123`
- **Field Operator:** `user@sih26120.local` / `user123`
