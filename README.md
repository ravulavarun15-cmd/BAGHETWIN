# BAGHETWIN — Industrial Digital Twin Platform (Baghewala Heavy Oil Field)

Smart Monitoring, Prediction and Optimization for Heavy Oil Fields

BAGHETWIN is an AI-powered Industrial Digital Twin platform designed for monitoring, predicting, and optimizing heavy-oil production operations in the Baghewala Oil Field, Rajasthan.

The platform integrates Machine Learning, real-time monitoring, physics-based simulation, and interactive 3D visualization to help field operators understand well performance, detect anomalies, and make data-driven operational decisions.

Developed as a solution for Smart India Hackathon (SIH) – Problem Statement SIH26120.

---

🚀 Key Features

1. Unified Well Monitoring

- Centralized monitoring of 35 oil wells.
- 28 active production wells and 7 non-operating wells.
- Real-time operational dashboards.
- Well status tracking, filtering, and search.
- Production performance visualization.

2. Interactive 3D Digital Twin

- Detailed 3D representation of an oil pumping rig.
- Surface and subsurface equipment visualization.
- Animated sucker rod pumping mechanism.
- Dynamic movement driven by operating parameters.
- Multiple camera perspectives for better inspection.

3. BAGHETWIN Copilot AI

- AI-powered operational assistant.
- Provides insights based on well data and operational parameters.
- Helps users understand production trends and anomalies.
- Supports decision-making through contextual recommendations.

4. Predictive Analytics

- Machine Learning-based production forecasting.
- Temperature and energy predictions.
- Rod failure risk assessment.
- Anomaly detection.
- Historical performance analysis.

5. CSS and SRP Optimization

- Cyclic Steam Stimulation (CSS) optimization.
- Sucker Rod Pump (SRP) performance analysis.
- Simulation of operating scenarios.
- Optimization of pump speed and VFD frequency.
- Support for reducing Steam-Oil Ratio (SOR) and improving operational efficiency.

6. Modern User Interface

- Responsive dashboard design.
- Interactive charts and data visualizations.
- Smooth animations and transitions.
- Custom cursor interactions.
- Animated login and dashboard components.
- Accessibility support for reduced-motion preferences.

---

🛠️ Technology Stack

Component| Technologies
Frontend| React, TypeScript, Vite
Styling| Tailwind CSS
3D Visualization| Three.js
Charts| Recharts
Backend| Python, FastAPI
Database| PostgreSQL
ORM| SQLAlchemy
Machine Learning| Scikit-learn
Model Serialization| Joblib
Data Processing| NumPy, Pandas, SciPy
Authentication| JWT
Containerization| Docker, Docker Compose

---

🏗️ Project Architecture

BAGHETWIN/
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── services/
│   │   ├── types/
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── database/
│   │   ├── ml/
│   │   ├── training/
│   │   └── twin/
│   ├── data/
│   ├── models/
│   ├── tests/
│   └── requirements.txt
│
├── database/
│   └── schema.sql
│
├── docker-compose.yml
└── README.md

---

⚙️ Installation and Setup

Prerequisites

Make sure the following tools are installed:

- Python 3.11 or higher
- Node.js 20 or higher
- npm
- PostgreSQL 16
- Git

Alternatively, Docker and Docker Compose can be used to run the application.

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

Navigate to the project directory:

cd YOUR_REPOSITORY

2. Backend Setup

Navigate to the backend directory:

cd backend

Create a virtual environment:

python -m venv .venv

Activate the environment.

Windows:

.venv\Scripts\activate

Linux/macOS:

source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Configure the environment variables using the provided ".env.example" file.

Start the backend server:

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Backend API:

http://localhost:8000

API documentation:

http://localhost:8000/docs

3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Open the application in your browser:

http://localhost:5173

4. Run Using Docker

If Docker is installed, the entire application can be started using:

docker compose up --build

To stop the containers:

docker compose down

---

🔐 Authentication

The application includes an authentication system with role-based access for field supervisors and operators.

For local demonstration, the following accounts are available:

Role| Email| Password
Field Supervisor| admin@sih26120.local| admin123
Field Operator| user@sih26120.local| user123

Note: These are demonstration credentials. Replace them with secure credentials before deploying the application publicly.

---

📊 Machine Learning Models

The platform includes trained models for different operational tasks:

- "production_model.pkl" – Production forecasting.
- "temperature_model.pkl" – Temperature prediction.
- "energy_model.pkl" – Energy consumption prediction.
- "rod_risk_model.pkl" – Rod failure risk assessment.
- "anomaly_model.pkl" – Operational anomaly detection.

These models are integrated into the backend to support predictive analysis and operational recommendations.

---

🎯 Project Objective

The primary objective of BAGHETWIN is to bridge the gap between traditional oilfield monitoring and intelligent digital operations.

By combining digital twin technology, machine learning, and physics-based simulation, the platform aims to:

- Improve visibility into oilfield operations.
- Support early identification of abnormal operating conditions.
- Enable data-driven production optimization.
- Reduce unnecessary operational inefficiencies.
- Provide an interactive environment for understanding complex oilfield systems.

---

🔮 Future Scope

- Integration with live IoT sensor data.
- Expansion of predictive maintenance capabilities.
- Improved simulation accuracy using field measurements.
- Advanced AI-based operational recommendations.
- Deployment on scalable cloud infrastructure.
- Integration with additional oilfield equipment and monitoring systems.

---

👥 Team

Project: BAGHETWIN
Competition: Smart India Hackathon
Problem Statement ID: SIH26120
Domain: Industrial Digital Twin | Artificial Intelligence | Oil & Gas

---

📄 License

This project was developed for academic and innovation purposes as part of Smart India Hackathon.

A formal open-source license can be added when the repository's distribution terms are finalized.

---

<p align="center">
  <b>BAGHETWIN – Turning Oilfield Data into Intelligent Decisions.</b>
</p>
