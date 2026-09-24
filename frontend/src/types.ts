export type AgentName = "ATLAS" | "TRIAGE" | "CONVOY" | "OPTIMA" | "COMMUNICATION";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ResourceStatus = "NORMAL" | "LOW" | "WARNING" | "CRITICAL" | "DEPLETED";
export type PlanStatus = "PROPOSED" | "APPROVED" | "EXECUTING" | "MODIFIED" | "REJECTED" | "ROLLED_BACK";

export interface DisasterState {
  id: string;
  title: string;
  type: string;
  severity: PriorityLevel;
  status: "ACTIVE" | "CONTAINED" | "RECOVERING";
  affected_population: number;
  casualties: number;
  displaced_count: number;
  started_at: string;
  last_updated: string;
  description: string;
  escalation_level: number;
}

export interface ZoneData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  severity: PriorityLevel;
  population: number;
  casualties: number;
  trapped_count: number;
  flood_level_meters: number;
  priority_score: number;
  status: "NORMAL" | "MONITORING" | "CRITICAL" | "EVACUATING" | "STABILIZED";
  evacuation_percentage: number;
  accessible_routes: string[];
  blocked_routes: string[];
  assigned_resources: Record<string, number>;
  needs: string[];
}

export interface AgentInfo {
  name: AgentName;
  role: string;
  description: string;
  status: "IDLE" | "ANALYZING" | "DEBATING" | "EXECUTING" | "ALERT";
  confidence: number;
  specialties: string[];
}

export interface DebateStatement {
  agent_name: AgentName;
  round_number: number;
  statement_type: "PROPOSAL" | "CHALLENGE" | "VALIDATION" | "SYNTHESIS" | "CONSENSUS";
  content: string;
  evidence: string[];
  constraints_noted: string[];
  confidence: number;
}

export interface AgentDebate {
  id: string;
  timestamp: string;
  topic: string;
  involved_agents: AgentName[];
  resource_at_stake: string;
  competing_zones: string[];
  rounds: DebateStatement[];
  conflict_detected: string;
  resolution_summary: string;
  optima_verdict: Record<string, any>;
  final_allocation: Record<string, Record<string, number>>;
  consensus_score: number;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: "VEHICLE" | "MEDICAL" | "SUSTENANCE" | "SHELTER" | "ENERGY" | "PERSONNEL";
  unit: string;
  total: number;
  available: number;
  allocated: number;
  in_transit: number;
  used: number;
  remaining: number;
  demand: number;
  shortage: number;
  status: ResourceStatus;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  resource_name: string;
  zone_id: string;
  zone_name: string;
  quantity: number;
  agent_responsible: AgentName;
  eta_minutes: number;
  route_id?: string;
  status: "PLANNED" | "EN_ROUTE" | "DELIVERED" | "REVERTED";
}

export interface ResourceForecast {
  resource_id: string;
  resource_name: string;
  current_stock: number;
  consumption_rate_hourly: number;
  incoming_supply: number;
  estimated_demand: number;
  depletion_time_hours: number;
  risk_level: PriorityLevel;
  projected_timeline: Array<{ hour: string; stock: number; safety_threshold: number }>;
  recommendations: string[];
}

export interface PlanDecisionExplanation {
  decision_topic: string;
  explanation: string;
  key_factors: string[];
  constraint_applied: string;
  alternatives_considered: string;
  changes_from_previous?: string;
}

export interface PlanSuccessIndicator {
  overall_score: number;
  rating: "OPTIMAL" | "ACCEPTABLE" | "AT_RISK" | "CRITICAL";
  resource_coverage_score: number;
  critical_zone_coverage_score: number;
  response_eta_score: number;
  hospital_capacity_score: number;
  conflict_resolution_score: number;
  evacuation_coverage_score: number;
  resource_shortage_penalty: number;
  factor_notes: string[];
}

export interface ResponsePlan {
  version: string;
  title: string;
  created_at: string;
  status: PlanStatus;
  priority_zones: string[];
  allocations: ResourceAllocation[];
  medical_actions: string[];
  evacuation_actions: string[];
  logistics_actions: string[];
  communication_actions: string[];
  risks: string[];
  constraints: string[];
  expected_response_eta_minutes: number;
  success_indicator: PlanSuccessIndicator;
  explanations: PlanDecisionExplanation[];
  rollback_ready: boolean;
}

export interface PlanRollbackRecord {
  id: string;
  timestamp: string;
  trigger_incident: string;
  previous_plan_version: string;
  affected_resources: string[];
  new_plan_version: string;
  explanation: string;
  recovered_assets_count: number;
}

export interface IncidentEvent {
  id: string;
  title: string;
  type: string;
  zone_id: string;
  zone_name: string;
  severity: PriorityLevel;
  timestamp: string;
  description: string;
  resource_impact: string;
  affected_routes: string[];
}

export interface CitizenSOS {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  emergency_type: "Medical" | "Trapped" | "Flood" | "Fire" | "Missing Person" | "Food/Water" | "Evacuation" | "Other";
  people_count: number;
  medical_emergency: boolean;
  trapped_status: boolean;
  description: string;
  severity: PriorityLevel;
  status: "PENDING" | "TRIAGED" | "ASSIGNED" | "RESCUED";
  timestamp: string;
  language: string;
  duplicate_of?: string | null;
  voice_audio_url?: string;
}

export interface HealthcareCenter {
  id: string;
  name: string;
  type: "Hospital" | "Trauma Center" | "Emergency Clinic" | "Medical Field Camp";
  lat: number;
  lng: number;
  total_beds: number;
  available_beds: number;
  icu_beds_available: number;
  emergency_capacity_status: "NORMAL" | "NEAR_CAPACITY" | "SURGE" | "OVERFLOW";
  trauma_capacity: number;
  distance_km: number;
  eta_minutes: number;
  phone: string;
  accepting_critical: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  severity: PriorityLevel;
  zone: string;
  resource_impact: string;
  agent_response: string;
  plan_version: string;
}

export interface SituationReport {
  generated_at: string;
  disaster_type: string;
  severity: PriorityLevel;
  affected_zones: string[];
  population_exposed: number;
  casualties: number;
  available_resources_summary: Record<string, number>;
  depleted_resources: string[];
  open_conflicts: string[];
  critical_risks: string[];
  current_response_plan_version: string;
  recommended_actions: string[];
  escalation_level: number;
  medical_assessment: string;
  logistics_assessment: string;
  commander_notes: string;
}

export interface VoiceCommandResponse {
  recognized_text: string;
  intent: string;
  parameters: Record<string, any>;
  action_taken: string;
  speech_response: string;
}
