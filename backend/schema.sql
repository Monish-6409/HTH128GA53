-- ====================================================
-- ResQAI — Supabase / PostgreSQL Database Schema
-- Multi-Agent Disaster Response Command Center
-- ====================================================

-- 1. DISASTERS TABLE
CREATE TABLE IF NOT EXISTS disasters (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'CONTAINED', 'RECOVERING')),
    affected_population INT NOT NULL DEFAULT 0,
    casualties INT NOT NULL DEFAULT 0,
    displaced_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT,
    escalation_level INT NOT NULL DEFAULT 1 CHECK (escalation_level BETWEEN 1 AND 5)
);

-- 2. ZONES TABLE
CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(64) PRIMARY KEY,
    disaster_id VARCHAR(64) REFERENCES disasters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    population INT NOT NULL DEFAULT 0,
    casualties INT NOT NULL DEFAULT 0,
    trapped_count INT NOT NULL DEFAULT 0,
    flood_level_meters NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    priority_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL CHECK (status IN ('NORMAL', 'MONITORING', 'CRITICAL', 'EVACUATING', 'STABILIZED')),
    evacuation_percentage INT NOT NULL DEFAULT 0,
    accessible_routes JSONB DEFAULT '[]'::jsonb,
    blocked_routes JSONB DEFAULT '[]'::jsonb,
    assigned_resources JSONB DEFAULT '{}'::jsonb,
    needs JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
    name VARCHAR(50) PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL CHECK (status IN ('IDLE', 'ANALYZING', 'DEBATING', 'EXECUTING', 'ALERT')),
    confidence NUMERIC(4, 2) NOT NULL DEFAULT 0.95,
    specialties JSONB DEFAULT '[]'::jsonb,
    last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENT RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(64) PRIMARY KEY,
    agent_name VARCHAR(50) REFERENCES agents(name),
    target_zone_id VARCHAR(64) REFERENCES zones(id),
    action_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    resources_requested JSONB NOT NULL DEFAULT '{}'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    confidence NUMERIC(4, 2) NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. AGENT DEBATES TABLE
CREATE TABLE IF NOT EXISTS debates (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    topic VARCHAR(255) NOT NULL,
    involved_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
    resource_at_stake VARCHAR(100) NOT NULL,
    competing_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    rounds JSONB NOT NULL DEFAULT '[]'::jsonb,
    conflict_detected TEXT NOT NULL,
    resolution_summary TEXT NOT NULL,
    optima_verdict JSONB NOT NULL DEFAULT '{}'::jsonb,
    final_allocation JSONB NOT NULL DEFAULT '{}'::jsonb,
    consensus_score NUMERIC(4, 2) NOT NULL
);

-- 6. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    total INT NOT NULL,
    available INT NOT NULL,
    allocated INT NOT NULL DEFAULT 0,
    in_transit INT NOT NULL DEFAULT 0,
    used INT NOT NULL DEFAULT 0,
    remaining INT NOT NULL,
    demand INT NOT NULL DEFAULT 0,
    shortage INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('NORMAL', 'LOW', 'WARNING', 'CRITICAL', 'DEPLETED')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RESOURCE ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS allocations (
    id VARCHAR(64) PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id),
    zone_id VARCHAR(64) REFERENCES zones(id),
    quantity INT NOT NULL,
    agent_responsible VARCHAR(50) REFERENCES agents(name),
    eta_minutes INT NOT NULL,
    route_id VARCHAR(100),
    status VARCHAR(30) NOT NULL CHECK (status IN ('PLANNED', 'EN_ROUTE', 'DELIVERED', 'REVERTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RESOURCE FORECASTS TABLE
CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR(64) REFERENCES resources(id),
    current_stock INT NOT NULL,
    consumption_rate_hourly NUMERIC(6, 2) NOT NULL,
    incoming_supply INT NOT NULL DEFAULT 0,
    estimated_demand INT NOT NULL,
    depletion_time_hours NUMERIC(6, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    projected_timeline JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    zone_id VARCHAR(64) REFERENCES zones(id),
    severity VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT,
    resource_impact TEXT,
    affected_routes JSONB DEFAULT '[]'::jsonb
);

-- 10. CITIZEN SOS REPORTS TABLE
CREATE TABLE IF NOT EXISTS sos_reports (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(30),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    people_count INT NOT NULL DEFAULT 1,
    medical_emergency BOOLEAN NOT NULL DEFAULT FALSE,
    trapped_status BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'TRIAGED', 'ASSIGNED', 'RESCUED')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    language VARCHAR(30) DEFAULT 'English',
    duplicate_of VARCHAR(64) REFERENCES sos_reports(id),
    voice_audio_url TEXT
);

-- 11. HEALTHCARE CENTERS TABLE
CREATE TABLE IF NOT EXISTS healthcare_centers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    total_beds INT NOT NULL,
    available_beds INT NOT NULL,
    icu_beds_available INT NOT NULL,
    emergency_capacity_status VARCHAR(30) NOT NULL,
    trauma_capacity INT NOT NULL,
    distance_km NUMERIC(5, 2) NOT NULL,
    eta_minutes INT NOT NULL,
    phone VARCHAR(30),
    accepting_critical BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. RESPONSE PLANS TABLE
CREATE TABLE IF NOT EXISTS response_plans (
    version VARCHAR(30) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL CHECK (status IN ('PROPOSED', 'APPROVED', 'EXECUTING', 'MODIFIED', 'REJECTED', 'ROLLED_BACK')),
    priority_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    allocations JSONB NOT NULL DEFAULT '[]'::jsonb,
    medical_actions JSONB DEFAULT '[]'::jsonb,
    evacuation_actions JSONB DEFAULT '[]'::jsonb,
    logistics_actions JSONB DEFAULT '[]'::jsonb,
    communication_actions JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    constraints JSONB DEFAULT '[]'::jsonb,
    expected_response_eta_minutes INT NOT NULL,
    success_indicator JSONB NOT NULL DEFAULT '{}'::jsonb,
    explanations JSONB DEFAULT '[]'::jsonb,
    rollback_ready BOOLEAN NOT NULL DEFAULT TRUE
);

-- 13. PLAN ROLLBACKS TABLE
CREATE TABLE IF NOT EXISTS rollbacks (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trigger_incident TEXT NOT NULL,
    previous_plan_version VARCHAR(30) REFERENCES response_plans(version),
    affected_resources JSONB DEFAULT '[]'::jsonb,
    new_plan_version VARCHAR(30) REFERENCES response_plans(version),
    explanation TEXT NOT NULL,
    recovered_assets_count INT NOT NULL DEFAULT 0
);

-- 14. TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    zone VARCHAR(100),
    resource_impact TEXT,
    agent_response TEXT,
    plan_version VARCHAR(30)
);

-- 15. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    level VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE
);

-- 16. VOICE REPORTS TABLE
CREATE TABLE IF NOT EXISTS voice_reports (
    id VARCHAR(64) PRIMARY KEY,
    transcript TEXT NOT NULL,
    extracted_location VARCHAR(255),
    extracted_severity VARCHAR(20),
    extracted_type VARCHAR(50),
    language VARCHAR(30) DEFAULT 'en',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) DEFAULT 'PROCESSED'
);

-- 17. SITUATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS situation_reports (
    id SERIAL PRIMARY KEY,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disaster_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    affected_zones JSONB NOT NULL,
    population_exposed INT NOT NULL,
    casualties INT NOT NULL,
    available_resources_summary JSONB NOT NULL,
    depleted_resources JSONB NOT NULL,
    open_conflicts JSONB NOT NULL,
    critical_risks JSONB NOT NULL,
    current_response_plan_version VARCHAR(30),
    recommended_actions JSONB NOT NULL,
    escalation_level INT NOT NULL,
    medical_assessment TEXT,
    logistics_assessment TEXT,
    commander_notes TEXT
);

-- 18. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_zones_severity ON zones(severity);
CREATE INDEX IF NOT EXISTS idx_sos_severity ON sos_reports(severity);
CREATE INDEX IF NOT EXISTS idx_sos_coords ON sos_reports(lat, lng);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
