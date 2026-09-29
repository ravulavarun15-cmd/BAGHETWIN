CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS wells (
    id SERIAL PRIMARY KEY,
    well_code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120),
    field VARCHAR(120) DEFAULT 'Baghewala',
    status VARCHAR(60) DEFAULT 'Operational',
    is_demonstration BOOLEAN DEFAULT true,
    api_gravity NUMERIC(5,2),
    reservoir_temp_c NUMERIC(8,2),
    reservoir_pressure_bar NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_data (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    oil_bopd NUMERIC,
    water_cut_pct NUMERIC,
    pressure_bar NUMERIC,
    temperature_c NUMERIC,
    energy_kwh NUMERIC
);

CREATE TABLE IF NOT EXISTS css_cycles (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    cycle_no INT,
    injection_start TIMESTAMPTZ,
    steam_volume_t NUMERIC,
    injection_pressure_bar NUMERIC,
    soak_hours NUMERIC,
    production_cutoff_bopd NUMERIC,
    sor NUMERIC
);

CREATE TABLE IF NOT EXISTS srp_operations (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    stroke_m NUMERIC,
    spm NUMERIC,
    vfd_hz NUMERIC,
    rod_load_kn NUMERIC,
    pump_efficiency_pct NUMERIC,
    fluid_level_m NUMERIC,
    rod_position_m NUMERIC
);

CREATE TABLE IF NOT EXISTS anomalies (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    detected_at TIMESTAMPTZ DEFAULT now(),
    anomaly_type VARCHAR(80),
    severity VARCHAR(20),
    probability NUMERIC,
    details JSONB
);

CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    predicted_at TIMESTAMPTZ DEFAULT now(),
    model_name VARCHAR(120),
    prediction JSONB,
    confidence NUMERIC
);

CREATE TABLE IF NOT EXISTS optimization_results (
    id BIGSERIAL PRIMARY KEY,
    well_id INT REFERENCES wells(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    domain VARCHAR(20),
    inputs JSONB,
    recommendation JSONB,
    expected_impact JSONB
);
