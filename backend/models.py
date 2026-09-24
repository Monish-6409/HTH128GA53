from __future__ import annotations
from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# ====================================================
# AGENT MODELS
# ====================================================

AgentName = Literal["ATLAS", "TRIAGE", "CONVOY", "OPTIMA", "COMMUNICATION"]
PriorityLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
ResourceStatus = Literal["NORMAL", "LOW", "WARNING", "CRITICAL", "DEPLETED"]

class AgentInfo(BaseModel):
    name: AgentName
    role: str
    description: str
    status: Literal["IDLE", "ANALYZING", "DEBATING", "EXECUTING", "ALERT"] = "IDLE"
    confidence: float = 0.95
    specialties: List[str] = []

class AgentRecommendation(BaseModel):
    id: str
    agent_name: AgentName
    target_zone_id: str
    target_zone_name: str
    action_type: str
    priority: PriorityLevel
    resources_requested: Dict[str, int]
    constraints: List[str]
    confidence: float
    reasons: List[str]
    timestamp: str

class DebateStatement(BaseModel):
    agent_name: AgentName
    round_number: int
    statement_type: Literal["PROPOSAL", "CHALLENGE", "VALIDATION", "SYNTHESIS", "CONSENSUS"]
    content: str
    evidence: List[str]
    constraints_noted: List[str]
    confidence: float

class AgentDebate(BaseModel):
    id: str
    timestamp: str
    topic: str
    involved_agents: List[AgentName]
    resource_at_stake: str
    competing_zones: List[str]
    rounds: List[DebateStatement]
    conflict_detected: str
    resolution_summary: str
    optima_verdict: Dict[str, Any]
    final_allocation: Dict[str, Dict[str, int]]
    consensus_score: float  # e.g., 0.92

# ====================================================
# RESOURCE MODELS
# ====================================================

class ResourceItem(BaseModel):
    id: str
    name: str
    category: Literal["VEHICLE", "MEDICAL", "SUSTENANCE", "SHELTER", "ENERGY", "PERSONNEL"]
    unit: str
    total: int
    available: int
    allocated: int
    in_transit: int
    used: int
    remaining: int
    demand: int
    shortage: int
    status: ResourceStatus

class ResourceAllocation(BaseModel):
    id: str
    resource_id: str
    resource_name: str
    zone_id: str
    zone_name: str
    quantity: int
    agent_responsible: AgentName
    eta_minutes: int
    route_id: Optional[str] = None
    status: Literal["PLANNED", "EN_ROUTE", "DELIVERED", "REVERTED"] = "PLANNED"

class ResourceForecast(BaseModel):
    resource_id: str
    resource_name: str
    current_stock: int
    consumption_rate_hourly: float
    incoming_supply: int
    estimated_demand: int
    depletion_time_hours: float
    risk_level: PriorityLevel
    projected_timeline: List[Dict[str, Any]]  # [{"hour": 0, "stock": 420}, ...]
    recommendations: List[str]

# ====================================================
# DISASTER & ZONE MODELS
# ====================================================

class ZoneData(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    severity: PriorityLevel
    population: int
    casualties: int
    trapped_count: int
    flood_level_meters: float
    priority_score: float  # 0 - 100
    status: Literal["NORMAL", "MONITORING", "CRITICAL", "EVACUATING", "STABILIZED"]
    evacuation_percentage: int
    accessible_routes: List[str]
    blocked_routes: List[str]
    assigned_resources: Dict[str, int] = {}
    needs: List[str] = []

class IncidentEvent(BaseModel):
    id: str
    title: str
    type: Literal["FLOOD_SURGE", "ROAD_COLLAPSE", "CASUALTY_SPIKE", "NEW_ZONE", "HOSPITAL_OVERLOAD", "RESOURCE_SHORTAGE", "COMMUNICATION_FAILURE", "WEATHER_DETERIORATION"]
    zone_id: str
    zone_name: str
    severity: PriorityLevel
    timestamp: str
    description: str
    resource_impact: str
    affected_routes: List[str] = []

class DisasterState(BaseModel):
    id: str
    title: str
    type: str
    severity: PriorityLevel
    status: Literal["ACTIVE", "CONTAINED", "RECOVERING"]
    affected_population: int
    casualties: int
    displaced_count: int
    started_at: str
    last_updated: str
    description: str
    escalation_level: int  # 1 to 5

# ====================================================
# RESPONSE PLAN & EXPLAINER
# ====================================================

class PlanDecisionExplanation(BaseModel):
    decision_topic: str
    explanation: str
    key_factors: List[str]
    constraint_applied: str
    alternatives_considered: str
    changes_from_previous: Optional[str] = None

class PlanSuccessIndicator(BaseModel):
    overall_score: int  # e.g., 84%
    rating: Literal["OPTIMAL", "ACCEPTABLE", "AT_RISK", "CRITICAL"]
    resource_coverage_score: int
    critical_zone_coverage_score: int
    response_eta_score: int
    hospital_capacity_score: int
    conflict_resolution_score: int
    evacuation_coverage_score: int
    resource_shortage_penalty: int
    factor_notes: List[str]

class ResponsePlan(BaseModel):
    version: str  # "Plan v1", "Plan v2"
    title: str
    created_at: str
    status: Literal["PROPOSED", "APPROVED", "EXECUTING", "MODIFIED", "REJECTED", "ROLLED_BACK"]
    priority_zones: List[str]
    allocations: List[ResourceAllocation]
    medical_actions: List[str]
    evacuation_actions: List[str]
    logistics_actions: List[str]
    communication_actions: List[str]
    risks: List[str]
    constraints: List[str]
    expected_response_eta_minutes: int
    success_indicator: PlanSuccessIndicator
    explanations: List[PlanDecisionExplanation]
    rollback_ready: bool = True

class PlanRollbackRecord(BaseModel):
    id: str
    timestamp: str
    trigger_incident: str
    previous_plan_version: str
    affected_resources: List[str]
    new_plan_version: str
    explanation: str
    recovered_assets_count: int

# ====================================================
# CITIZEN SOS & HEALTHCARE
# ====================================================

class CitizenSOS(BaseModel):
    id: str
    name: str
    phone: str
    lat: float
    lng: float
    address: str
    emergency_type: Literal["Medical", "Trapped", "Flood", "Fire", "Missing Person", "Food/Water", "Evacuation", "Other"]
    people_count: int
    medical_emergency: bool
    trapped_status: bool
    description: str
    severity: PriorityLevel
    status: Literal["PENDING", "TRIAGED", "ASSIGNED", "RESCUED"]
    timestamp: str
    language: str = "English"  # "English", "Tamil", "Hindi"
    duplicate_of: Optional[str] = None
    voice_audio_url: Optional[str] = None

class HealthcareCenter(BaseModel):
    id: str
    name: str
    type: Literal["Hospital", "Trauma Center", "Emergency Clinic", "Medical Field Camp"]
    lat: float
    lng: float
    total_beds: int
    available_beds: int
    icu_beds_available: int
    emergency_capacity_status: Literal["NORMAL", "NEAR_CAPACITY", "SURGE", "OVERFLOW"]
    trauma_capacity: int
    distance_km: float
    eta_minutes: int
    phone: str
    accepting_critical: bool

# ====================================================
# TIMELINE, SITREP & VOICE
# ====================================================

class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    event: str
    severity: PriorityLevel
    zone: str
    resource_impact: str
    agent_response: str
    plan_version: str

class VoiceCommandRequest(BaseModel):
    audio_text: str
    language: str = "en"
    commander_role: Optional[str] = "COMMANDER"

class VoiceCommandResponse(BaseModel):
    recognized_text: str
    intent: str
    parameters: Dict[str, Any]
    action_taken: str
    speech_response: str

class VoiceEmergencyReportRequest(BaseModel):
    voice_text: str
    language: str = "en"  # "en", "ta", "hi"

class SituationReport(BaseModel):
    generated_at: str
    disaster_type: str
    severity: PriorityLevel
    affected_zones: List[str]
    population_exposed: int
    casualties: int
    available_resources_summary: Dict[str, int]
    depleted_resources: List[str]
    open_conflicts: List[str]
    critical_risks: List[str]
    current_response_plan_version: str
    recommended_actions: List[str]
    escalation_level: int
    medical_assessment: str
    logistics_assessment: str
    commander_notes: str
