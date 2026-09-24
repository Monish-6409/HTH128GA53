import {
  DisasterState, ZoneData, ResourceItem, ResourceForecast,
  HealthcareCenter, ResponsePlan, AgentDebate, TimelineEvent,
  CitizenSOS, SituationReport, AgentInfo, VoiceCommandResponse
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Embedded In-Memory Simulation State (Guarantees zero-failure operation even if backend is offline)
let mockPlanCounter = 1;

let mockDisaster: DisasterState = {
  id: "DISASTER-2026-FLOOD-01",
  title: "Riverine Flash Flood Emergency — Metro Basin",
  type: "Riverine Flash Flood & Dam Spillover",
  severity: "CRITICAL",
  status: "ACTIVE",
  affected_population: 48500,
  casualties: 42,
  displaced_count: 3200,
  started_at: "2026-09-24 15:00:00",
  last_updated: "2026-09-24 17:15:00",
  description: "Rapid overflow of Northern Reservoir following 180mm extreme rainfall. Flood crest moving south along Valley River corridor.",
  escalation_level: 4
};

let mockZones: ZoneData[] = [
  {
    id: "ZONE-A",
    name: "Zone A — Downtown Marina Corridor",
    lat: 13.0835,
    lng: 80.2785,
    severity: "CRITICAL",
    population: 14200,
    casualties: 24,
    trapped_count: 85,
    flood_level_meters: 2.8,
    priority_score: 94.5,
    status: "CRITICAL",
    evacuation_percentage: 35,
    accessible_routes: ["Causeway Arterial 1", "North Flyover B"],
    blocked_routes: ["River Road Pier"],
    assigned_resources: { "Ambulances": 4, "Rescue Boats": 5, "Medical Kits": 120 },
    needs: ["Rescue Boats", "Advanced Trauma Kits", "Emergency Shelter"]
  },
  {
    id: "ZONE-B",
    name: "Zone B — Riverside West Residential",
    lat: 13.0720,
    lng: 80.2550,
    severity: "HIGH",
    population: 18500,
    casualties: 11,
    trapped_count: 60,
    flood_level_meters: 1.9,
    priority_score: 81.0,
    status: "EVACUATING",
    evacuation_percentage: 55,
    accessible_routes: ["West Expressway", "Metro Ring Line"],
    blocked_routes: ["Lower Embankment Lane"],
    assigned_resources: { "Ambulances": 3, "Rescue Boats": 3, "Food Kits": 450 },
    needs: ["Food/Water", "Rescue Boats", "Power Generators"]
  },
  {
    id: "ZONE-C",
    name: "Zone C — South Delta Lowlands",
    lat: 13.0480,
    lng: 80.2620,
    severity: "HIGH",
    population: 9200,
    casualties: 5,
    trapped_count: 30,
    flood_level_meters: 1.5,
    priority_score: 72.0,
    status: "MONITORING",
    evacuation_percentage: 48,
    accessible_routes: ["South Highway 45", "Delta Tollway"],
    blocked_routes: [],
    assigned_resources: { "Rescue Vehicles": 5, "Water Kits": 600 },
    needs: ["Evacuation Shuttles", "Clean Water", "Sandbags"]
  },
  {
    id: "ZONE-D",
    name: "Zone D — Highland Staging Sector",
    lat: 13.0980,
    lng: 80.2350,
    severity: "LOW",
    population: 6600,
    casualties: 2,
    trapped_count: 0,
    flood_level_meters: 0.2,
    priority_score: 38.0,
    status: "STABILIZED",
    evacuation_percentage: 90,
    accessible_routes: ["Grand Trunk North", "Highland Bypass"],
    blocked_routes: [],
    assigned_resources: { "Rescue Vehicles": 2, "Shelter Spaces": 600 },
    needs: ["Medical Resupply", "Coordination Tent"]
  }
];

let mockResources: ResourceItem[] = [
  { id: "res_amb", name: "Ambulances", category: "VEHICLE", unit: "units", total: 20, available: 8, allocated: 7, in_transit: 4, used: 1, remaining: 8, demand: 15, shortage: 0, status: "WARNING" },
  { id: "res_boat", name: "Rescue Boats", category: "VEHICLE", unit: "vessels", total: 12, available: 2, allocated: 8, in_transit: 2, used: 0, remaining: 2, demand: 14, shortage: 2, status: "CRITICAL" },
  { id: "res_veh", name: "Rescue Trucks (4x4)", category: "VEHICLE", unit: "vehicles", total: 25, available: 12, allocated: 9, in_transit: 3, used: 1, remaining: 12, demand: 16, shortage: 0, status: "NORMAL" },
  { id: "res_med", name: "Medical Trauma Kits", category: "MEDICAL", unit: "kits", total: 450, available: 180, allocated: 200, in_transit: 50, used: 20, remaining: 180, demand: 320, shortage: 0, status: "WARNING" },
  { id: "res_food", name: "Ration Food Packets", category: "SUSTENANCE", unit: "packs", total: 2500, available: 1100, allocated: 1050, in_transit: 250, used: 100, remaining: 1100, demand: 1600, shortage: 0, status: "NORMAL" },
  { id: "res_water", name: "Potable Water Jugs (20L)", category: "SUSTENANCE", unit: "jugs", total: 3000, available: 1200, allocated: 1350, in_transit: 300, used: 150, remaining: 1200, demand: 2200, shortage: 0, status: "NORMAL" },
  { id: "res_shelter", name: "Shelter Spaces", category: "SHELTER", unit: "cots", total: 1400, available: 420, allocated: 850, in_transit: 0, used: 130, remaining: 420, demand: 950, shortage: 0, status: "WARNING" },
  { id: "res_personnel", name: "Rescue Personnel", category: "PERSONNEL", unit: "responders", total: 160, available: 45, allocated: 95, in_transit: 15, used: 5, remaining: 45, demand: 120, shortage: 0, status: "NORMAL" },
  { id: "res_fuel", name: "Generator Fuel", category: "ENERGY", unit: "liters", total: 5000, available: 1850, allocated: 2400, in_transit: 500, used: 250, remaining: 1850, demand: 3200, shortage: 0, status: "NORMAL" },
  { id: "res_comm", name: "Satellite Comm Sets", category: "ENERGY", unit: "sets", total: 30, available: 12, allocated: 15, in_transit: 2, used: 1, remaining: 12, demand: 18, shortage: 0, status: "NORMAL" }
];

let mockAgents: AgentInfo[] = [
  { name: "ATLAS", role: "Strategic Orchestrator", description: "Coordinates agent recommendations, detects conflicts, enforces constraints, and produces cohesive command directives.", status: "ANALYZING", confidence: 0.96, specialties: ["Multi-Agent Orchestration", "Risk Optimization", "Constraint Enforcement", "Plan Formulation"] },
  { name: "TRIAGE", role: "Medical & Casualty Agent", description: "Evaluates casualty severity, monitors hospital bed availability, and prioritizes urgent ambulance and medical kit routing.", status: "DEBATING", confidence: 0.93, specialties: ["Casualty Assessment", "Hospital Capacity Check", "Trauma Resource Allocation"] },
  { name: "CONVOY", role: "Logistics & Mobility Agent", description: "Manages rescue boat corridors, 4x4 heavy transport, flood-safe routing, and relief convoy scheduling.", status: "DEBATING", confidence: 0.91, specialties: ["Route Optimization", "Boat Fleet Dispatch", "Bridge/Road Feasibility"] },
  { name: "OPTIMA", role: "Resource Optimization Agent", description: "Runs linear resource balancing, forecasts depletion horizons, detects overallocation, and synthesizes debate compromises.", status: "ANALYZING", confidence: 0.98, specialties: ["Constraint Solving", "Depletion Forecasting", "Mathematical Optimization", "Conflict Arbitration"] },
  { name: "COMMUNICATION", role: "Public & Field Warning Agent", description: "Dispatches multilingual emergency alerts (English, Tamil, Hindi) to affected citizens and coordinates field teams.", status: "EXECUTING", confidence: 0.95, specialties: ["Multilingual Alerts", "Evacuation Broadcasts", "Field Team Sync"] }
];

let mockDebates: AgentDebate[] = [
  {
    id: "DEBATE-01",
    timestamp: "16:45:00",
    topic: "Fleet Allocation Conflict: Rescue Boats for Zone A vs Zone B",
    involved_agents: ["TRIAGE", "CONVOY", "OPTIMA", "ATLAS"],
    resource_at_stake: "Rescue Boats (10 active / 14 requested)",
    competing_zones: ["ZONE-A", "ZONE-B"],
    rounds: [
      {
        agent_name: "TRIAGE",
        round_number: 1,
        statement_type: "PROPOSAL",
        content: "Urgent request: Allocate 7 Rescue Boats and 5 Ambulances exclusively to Zone A (Downtown Marina). 24 casualties trapped in multi-story floodwaters require rapid extraction before nightfall.",
        evidence: ["24 verified casualties", "85 citizens isolated above 2.8m floodwaters", "Hypothermia window closing within 90 minutes"],
        constraints_noted: ["Requires water-safe extraction", "Marina pier is submerged"],
        confidence: 0.94
      },
      {
        agent_name: "CONVOY",
        round_number: 1,
        statement_type: "CHALLENGE",
        content: "Counter-request: Zone B (Riverside West) has 60 trapped citizens and 18,500 exposed population. Diverting 70% of boats to Zone A leaves West residential perimeter unevacuated before the downstream surge.",
        evidence: ["60 trapped in single-story structures", "18,500 total exposed population in Zone B", "Causeway route 1 has high traffic congestion"],
        constraints_noted: ["Only 10 active rescue boats deployable in fleet", "Traffic choking Causeway 1"],
        confidence: 0.89
      },
      {
        agent_name: "TRIAGE",
        round_number: 2,
        statement_type: "VALIDATION",
        content: "Conceding fleet strain, but mortality risk in Zone A is 3.4x higher than Zone B due to swift water currents. A compromise: 5 boats to Zone A, 3 boats to Zone B, 2 in reserve.",
        evidence: ["Water flow velocity 4.2 knots in Zone A vs 1.8 knots in Zone B", "Immediate medical triage needed"],
        constraints_noted: ["Cannot afford zero boat reserve for sudden breaches"],
        confidence: 0.92
      },
      {
        agent_name: "OPTIMA",
        round_number: 2,
        statement_type: "SYNTHESIS",
        content: "Algorithmic resolution: Allocate 5 Rescue Boats to Zone A (High Velocity Triage) and 3 Rescue Boats to Zone B (Bulk Evacuation). Pair Zone B with 4x4 high-clearance trucks along West Expressway to compensate. Retain 2 boats in strategic reserve.",
        evidence: ["Maximizes survival utility score from 71.4 to 88.2", "Prevents stock depletion below safety threshold", "Zero fleet over-allocation"],
        constraints_noted: ["Available boats = 10", "4x4 trucks = 12 available"],
        confidence: 0.97
      },
      {
        agent_name: "ATLAS",
        round_number: 3,
        statement_type: "CONSENSUS",
        content: "Orchestration directive ratified: 5 boats assigned to Zone A, 3 to Zone B, 2 held at Highland Staging. Convoy routes verified. Both agents aligned on shared operational picture.",
        evidence: ["Zero constraint violations", "Both agents confirmed feasible deployment"],
        constraints_noted: ["Approved by Human Commander review pipeline"],
        confidence: 0.96
      }
    ],
    conflict_detected: "Simultaneous request for 7 boats by TRIAGE (Zone A) and 6 boats by CONVOY (Zone B) exceeded deployable total of 10 boats.",
    resolution_summary: "OPTIMA synthesized 5-3-2 split with 4x4 vehicle augmentation in Zone B. Both agents accepted consensus.",
    optima_verdict: { zone_a_allocation: 5, zone_b_allocation: 3, reserve_retention: 2, objective_score: 88.2, shortage_prevented: true },
    final_allocation: {
      "ZONE-A": { "Rescue Boats": 5, "Ambulances": 4 },
      "ZONE-B": { "Rescue Boats": 3, "Rescue Trucks (4x4)": 6 }
    },
    consensus_score: 0.94
  }
];

let mockPlan: ResponsePlan = {
  version: "Plan v1",
  title: "Rapid Evacuation & Triage Protocol — Riverine Inundation Phase 1",
  created_at: "2026-09-24 16:50:00",
  status: "APPROVED",
  priority_zones: ["ZONE-A", "ZONE-B", "ZONE-C"],
  allocations: [
    { id: "ALLOC-01", resource_id: "res_boat", resource_name: "Rescue Boats", zone_id: "ZONE-A", zone_name: "Zone A — Downtown Marina", quantity: 5, agent_responsible: "CONVOY", eta_minutes: 15, route_id: "Causeway Arterial 1", status: "EN_ROUTE" },
    { id: "ALLOC-02", resource_id: "res_amb", resource_name: "Ambulances", zone_id: "ZONE-A", zone_name: "Zone A — Downtown Marina", quantity: 4, agent_responsible: "TRIAGE", eta_minutes: 12, route_id: "Causeway Arterial 1", status: "EN_ROUTE" },
    { id: "ALLOC-03", resource_id: "res_boat", resource_name: "Rescue Boats", zone_id: "ZONE-B", zone_name: "Zone B — Riverside West", quantity: 3, agent_responsible: "CONVOY", eta_minutes: 20, route_id: "West Expressway", status: "EN_ROUTE" },
    { id: "ALLOC-04", resource_id: "res_veh", resource_name: "Rescue Trucks (4x4)", zone_id: "ZONE-B", zone_name: "Zone B — Riverside West", quantity: 6, agent_responsible: "CONVOY", eta_minutes: 18, route_id: "West Expressway", status: "DELIVERED" },
    { id: "ALLOC-05", resource_id: "res_med", resource_name: "Medical Trauma Kits", zone_id: "ZONE-A", zone_name: "Zone A — Downtown Marina", quantity: 120, agent_responsible: "TRIAGE", eta_minutes: 15, route_id: "North Flyover B", status: "EN_ROUTE" },
    { id: "ALLOC-06", resource_id: "res_food", resource_name: "Ration Food Packets", zone_id: "ZONE-B", zone_name: "Zone B — Riverside West", quantity: 450, agent_responsible: "CONVOY", eta_minutes: 25, route_id: "West Expressway", status: "PLANNED" }
  ],
  medical_actions: [
    "Establish Forward Triage Post at North Flyover B Ramp",
    "Deploy 4 Advanced Trauma Ambulances with portable defibrillators to Marina perimeter",
    "Pre-alert Metropolitan Trauma Hospital triage team for incoming hypothermia cases"
  ],
  evacuation_actions: [
    "Establish waterborne boat corridor along Causeway Arterial 1 for Zone A residents",
    "Operate continuous 4x4 shuttle loops from Riverside West to Highland Staging Sector",
    "Guide walking evacuees in Zone C towards South Highway 45 dry shoulders"
  ],
  logistics_actions: [
    "Stage 2 standby rescue boats at Highland Staging Depot",
    "Mobilize 1,100 food packets and 1,200 water jugs to Zone B community centers",
    "Refuel generator reserves at Metropolitan Trauma Center"
  ],
  communication_actions: [
    "Broadcast automated multilingual sirens and SMS alerts (English, Tamil, Hindi) regarding Causeway access",
    "Instruct Zone A residents to remain on 2nd floor or roof; avoid submerged basements",
    "Direct non-critical patients to Highland Rapid Medical Camp"
  ],
  risks: [
    "Potential Causeway Arterial 1 bridge pier scouring if flow exceeds 40,000 cusecs",
    "Metropolitan Trauma Hospital ICU beds reach saturation if casualties exceed 30",
    "Battery depletion on citizen cellular handsets within 4-6 hours"
  ],
  constraints: [
    "Do not exceed 10 active boat deployments (2 required in reserve)",
    "Respect 8-hour maximum shift duration for rescue dive personnel",
    "Do not route standard ambulances through waters deeper than 0.35m"
  ],
  expected_response_eta_minutes: 15,
  success_indicator: {
    overall_score: 84,
    rating: "OPTIMAL",
    resource_coverage_score: 88,
    critical_zone_coverage_score: 92,
    response_eta_score: 85,
    hospital_capacity_score: 80,
    conflict_resolution_score: 95,
    evacuation_coverage_score: 78,
    resource_shortage_penalty: 6,
    factor_notes: [
      "High Critical Zone coverage (92%) due to concentrated Marina deployment.",
      "Resource shortages kept under control via 4x4 truck substitution.",
      "Hospital surge capacity in Metropolitan Trauma requires close tracking.",
      "Consensus achieved across all 4 operational agents with zero hard constraint violations."
    ]
  },
  explanations: [
    {
      decision_topic: "Prioritization of Zone A (Downtown Marina) for First Rescue Boats",
      explanation: "Zone A displays a critical flood elevation of 2.8m with 24 verified casualties and 85 residents stranded on upper levels with water surging. Mortality hazard is estimated at 3.4x higher than surrounding sectors.",
      key_factors: ["2.8m flood depth", "24 severe trauma/hypothermia patients", "Current speed 4.2 knots"],
      constraint_applied: "Only 10 deployable rescue boats available in total municipal fleet",
      alternatives_considered: "Even 5-5 split rejected by OPTIMA as it would starve Zone A of rapid medical evacuation speed."
    },
    {
      decision_topic: "Allocation of Ambulances to Metropolitan Trauma Hospital",
      explanation: "Metropolitan Trauma Hospital is within 2.4km (12 min ETA) and has active trauma surgeons on duty, despite 89% ICU bed occupancy. Critical casualties from Zone A are routed here first.",
      key_factors: ["12 min travel ETA via North Flyover", "Level-1 trauma designation"],
      constraint_applied: "St. Jude General is 4.8km away (18 min ETA), reserved as overflow secondary target.",
      alternatives_considered: "Directing ambulances to Westside Clinic rejected due to lack of ICU surgical capacity."
    },
    {
      decision_topic: "Deployment of 4x4 Heavy Trucks to Zone B in place of Boats",
      explanation: "Because rescue boats are constrained, CONVOY and OPTIMA routed 6 high-clearance 4x4 trucks along West Expressway, which remains traversable at 0.6m water depth, freeing water vessels for deep Marina channels.",
      key_factors: ["West Expressway passable for 4x4 axles", "Preserves precious boat hours"],
      constraint_applied: "Boat fleet cap of 12 vessels",
      alternatives_considered: "Leaving Zone B waiting for 2nd wave boats would have delayed 60 trapped citizens by 90 minutes."
    }
  ],
  rollback_ready: true
};

let mockTimeline: TimelineEvent[] = [
  { id: "TL-01", timestamp: "15:00", event: "Extreme flood crest warning triggered at Northern Dam", severity: "CRITICAL", zone: "Zone A & B", resource_impact: "Reservoir discharge reached 35,000 cusecs", agent_response: "ATLAS activated Stage 4 Emergency Protocol", plan_version: "Plan v1" },
  { id: "TL-02", timestamp: "15:30", event: "Zone A Downtown Marina water height crossed 2.5m threshold", severity: "CRITICAL", zone: "Zone A", resource_impact: "River Road Pier submerged and impassable", agent_response: "CONVOY redirected heavy 4x4 trucks to Causeway Arterial 1", plan_version: "Plan v1" },
  { id: "TL-03", timestamp: "16:10", event: "Casualty spike detected at Marina residential cluster", severity: "HIGH", zone: "Zone A", resource_impact: "24 patients reported with trauma and hypothermia", agent_response: "TRIAGE requested 6 additional ambulances and 100 trauma kits", plan_version: "Plan v1" },
  { id: "TL-04", timestamp: "16:45", event: "Resource contention: Rescue boats demanded concurrently by Zone A and Zone B", severity: "HIGH", zone: "Zone A & Zone B", resource_impact: "Demand (14 boats) exceeded total available (10 boats)", agent_response: "OPTIMA initiated Agent Debate to resolve allocation without stock breach", plan_version: "Plan v1" }
];

let mockSOS: CitizenSOS[] = [
  { id: "SOS-101", name: "Dr. Priya Raman", phone: "+91-98401-22910", lat: 13.0842, lng: 80.2790, address: "Flat 4B, Riverview Apartments, Marina Road", emergency_type: "Trapped", people_count: 6, medical_emergency: true, trapped_status: true, description: "Water reached 2nd floor balcony. Elderly diabetic patient has acute shortness of breath. No power.", severity: "CRITICAL", status: "TRIAGED", timestamp: "16:50:00", language: "English" },
  { id: "SOS-102", name: "Sundaram K.", phone: "+91-94440-11234", lat: 13.0735, lng: 80.2562, address: "Bazaar Street, Riverside West", emergency_type: "Food/Water", people_count: 18, medical_emergency: false, trapped_status: true, description: "Community hall roof shelter. Drinking water depleted. 4 children need baby food.", severity: "HIGH", status: "ASSIGNED", timestamp: "16:35:00", language: "Tamil" },
  { id: "SOS-103", name: "Rajesh Sharma", phone: "+91-98840-77651", lat: 13.0495, lng: 80.2635, address: "South Delta Colony, Block C", emergency_type: "Flood", people_count: 4, medical_emergency: false, trapped_status: false, description: "Ground floor submerged. Seeking evacuation vehicle to Highland relief camp.", severity: "MEDIUM", status: "PENDING", timestamp: "17:02:00", language: "Hindi" },
  { id: "SOS-104", name: "Anand V.", phone: "+91-98401-99881", lat: 13.0840, lng: 80.2788, address: "Riverview Apartments, Block B", emergency_type: "Trapped", people_count: 5, medical_emergency: true, trapped_status: true, description: "Duplicate report: Water rising near Riverview complex, medical support needed.", severity: "CRITICAL", status: "TRIAGED", timestamp: "16:53:00", language: "English", duplicate_of: "SOS-101" }
];

let mockHealthcare: HealthcareCenter[] = [
  { id: "HOSP-01", name: "Metropolitan Trauma Hospital", type: "Trauma Center", lat: 13.0850, lng: 80.2600, total_beds: 400, available_beds: 42, icu_beds_available: 6, emergency_capacity_status: "SURGE", trauma_capacity: 15, distance_km: 2.4, eta_minutes: 12, phone: "+91-44-2530-1100", accepting_critical: true },
  { id: "HOSP-02", name: "St. Jude General Hospital", type: "Hospital", lat: 13.0650, lng: 80.2450, total_beds: 250, available_beds: 58, icu_beds_available: 12, emergency_capacity_status: "NORMAL", trauma_capacity: 22, distance_km: 4.8, eta_minutes: 18, phone: "+91-44-2530-2200", accepting_critical: true },
  { id: "HOSP-03", name: "Westside Emergency Clinic", type: "Emergency Clinic", lat: 13.0780, lng: 80.2400, total_beds: 80, available_beds: 18, icu_beds_available: 2, emergency_capacity_status: "NEAR_CAPACITY", trauma_capacity: 5, distance_km: 3.1, eta_minutes: 14, phone: "+91-44-2530-3300", accepting_critical: false },
  { id: "HOSP-04", name: "Highland Rapid Medical Camp", type: "Medical Field Camp", lat: 13.1020, lng: 80.2300, total_beds: 120, available_beds: 75, icu_beds_available: 4, emergency_capacity_status: "NORMAL", trauma_capacity: 10, distance_km: 5.6, eta_minutes: 20, phone: "+91-44-2530-4400", accepting_critical: true }
];

function generateMockForecasts(): ResourceForecast[] {
  const params: Record<string, { rate: number; incoming: number; demand: number }> = {
    "res_amb": { rate: 1.2, incoming: 4, demand: 15 },
    "res_boat": { rate: 0.8, incoming: 2, demand: 14 },
    "res_veh": { rate: 1.5, incoming: 5, demand: 16 },
    "res_med": { rate: 85.0, incoming: 150, demand: 320 },
    "res_food": { rate: 220.0, incoming: 600, demand: 1600 },
    "res_water": { rate: 280.0, incoming: 800, demand: 2200 },
    "res_shelter": { rate: 35.0, incoming: 200, demand: 950 },
    "res_personnel": { rate: 4.0, incoming: 30, demand: 120 },
    "res_fuel": { rate: 380.0, incoming: 1000, demand: 3200 },
    "res_comm": { rate: 1.0, incoming: 5, demand: 18 }
  };

  return mockResources.map(res => {
    const p = params[res.id] || { rate: 5.0, incoming: 10, demand: 50 };
    const stock = res.remaining;
    const hours = p.rate > 0 ? Number((stock / p.rate).toFixed(1)) : 99.0;
    const risk: any = (hours < 3.0 || res.shortage > 0) ? "CRITICAL" : (hours < 6.0 ? "HIGH" : (hours < 12.0 ? "MEDIUM" : "LOW"));
    
    const recs = [];
    if (risk === "CRITICAL" || risk === "HIGH") {
      recs.push(`Issue emergency resupply requisition for ${res.name} to state disaster pool.`);
      recs.push(`Ration non-emergency distribution of ${res.name} by 25%.`);
      if (res.id === "res_med" || res.id === "res_boat") {
        recs.push("Request immediate inter-agency mutual aid from adjacent Highland District.");
      }
    } else {
      recs.push("Stock level sufficient for projected operational cycle.");
    }

    const proj = [];
    for (let h = 0; h <= 12; h += 2) {
      const stockVal = Math.max(0, Math.floor(stock - (p.rate * h) + (h >= 6 ? p.incoming : 0)));
      proj.push({ hour: `+${h}h`, stock: stockVal, safety_threshold: Math.floor(res.total * 0.25) });
    }

    return {
      resource_id: res.id,
      resource_name: res.name,
      current_stock: stock,
      consumption_rate_hourly: p.rate,
      incoming_supply: p.incoming,
      estimated_demand: p.demand,
      depletion_time_hours: hours,
      risk_level: risk,
      projected_timeline: proj,
      recommendations: recs
    };
  });
}

function generateMockSitrep(): SituationReport {
  return {
    generated_at: new Date().toLocaleTimeString(),
    disaster_type: mockDisaster.type,
    severity: mockDisaster.severity,
    affected_zones: mockZones.map(z => z.name),
    population_exposed: mockDisaster.affected_population,
    casualties: mockDisaster.casualties,
    available_resources_summary: Object.fromEntries(mockResources.map(r => [r.name, r.available])),
    depleted_resources: mockResources.filter(r => r.status === "CRITICAL" || r.status === "DEPLETED").map(r => r.name),
    open_conflicts: mockDebates.map(d => d.topic),
    critical_risks: mockPlan.risks,
    current_response_plan_version: mockPlan.version,
    recommended_actions: [...mockPlan.evacuation_actions, ...mockPlan.medical_actions.slice(0, 2)],
    escalation_level: mockDisaster.escalation_level,
    medical_assessment: "TRIAGE indicates casualty spike contained if Metropolitan Trauma Hospital overflow is successfully diverted to St. Jude.",
    logistics_assessment: "CONVOY confirms North Flyover B detour provides stable link into Downtown Marina. Boat reserves adequate for 3.5 hours.",
    commander_notes: "All automated AI agents functioning in collaborative consensus mode. Human commander validation pipeline active."
  };
}

// Master Fetch with Auto Simulation Fallback
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackSupplier?: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (fallbackSupplier) {
      return fallbackSupplier();
    }
    throw err;
  }
}

export const api = {
  getDisaster: () => fetchWithFallback<DisasterState>("/disaster", undefined, () => mockDisaster),
  getZones: () => fetchWithFallback<ZoneData[]>("/zones", undefined, () => mockZones),
  getResources: () => fetchWithFallback<ResourceItem[]>("/resources", undefined, () => mockResources),
  getForecasts: () => fetchWithFallback<ResourceForecast[]>("/resources/forecast", undefined, () => generateMockForecasts()),
  getAgents: () => fetchWithFallback<AgentInfo[]>("/agents", undefined, () => mockAgents),
  getDebates: () => fetchWithFallback<AgentDebate[]>("/debates", undefined, () => mockDebates),
  getResponsePlan: () => fetchWithFallback<ResponsePlan>("/response-plan", undefined, () => mockPlan),
  getTimeline: () => fetchWithFallback<TimelineEvent[]>("/timeline", undefined, () => mockTimeline),
  getSOSReports: () => fetchWithFallback<CitizenSOS[]>("/sos", undefined, () => mockSOS),
  getHealthcare: () => fetchWithFallback<HealthcareCenter[]>("/healthcare", undefined, () => mockHealthcare),
  getSituationReport: () => fetchWithFallback<SituationReport>("/situation-report", undefined, () => generateMockSitrep()),

  injectEvent: (eventType: string) =>
    fetchWithFallback<any>("/events", {
      method: "POST",
      body: JSON.stringify({ event_type: eventType })
    }, () => {
      // Local fallback execution
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (eventType === "ROAD_COLLAPSE") {
        mockPlanCounter += 1;
        const newVer = `Plan v${mockPlanCounter}`;
        mockZones[0].accessible_routes = ["North Flyover B"];
        mockZones[0].blocked_routes.push("Causeway Arterial 1");
        mockPlan = {
          ...mockPlan,
          version: newVer,
          title: "Adaptive Contingency Plan — Detour & Water-Slipway Inflow",
          expected_response_eta_minutes: 22,
          allocations: [
            { id: "ALLOC-REROUTE-01", resource_id: "res_boat", resource_name: "Rescue Boats", zone_id: "ZONE-A", zone_name: "Zone A — Downtown Marina", quantity: 5, agent_responsible: "CONVOY", eta_minutes: 24, route_id: "North Flyover B -> Slipway", status: "EN_ROUTE" },
            { id: "ALLOC-REROUTE-02", resource_id: "res_amb", resource_name: "Ambulances", zone_id: "ZONE-A", zone_name: "Zone A — Downtown Marina", quantity: 4, agent_responsible: "TRIAGE", eta_minutes: 22, route_id: "North Flyover B Ramp", status: "EN_ROUTE" },
            ...mockPlan.allocations.filter(a => a.route_id !== "Causeway Arterial 1")
          ],
          explanations: [
            {
              decision_topic: "Why did the system execute an Automatic Plan Rollback?",
              explanation: "Causeway Arterial 1 collapse rendered Plan v1 physically infeasible. Vehicles in transit on that route faced structural failure hazard. The system immediately invalidated the compromised allocations, restored resources to safe standing, and initiated Agent Council re-planning.",
              key_factors: ["Route severance", "Asset safety preservation", "Real-time constraint invalidation"],
              constraint_applied: "Roadway capacity on collapsed span dropped to 0",
              alternatives_considered: "Attempting passage on Causeway was rejected by safety constraint engine."
            },
            ...mockPlan.explanations
          ],
          success_indicator: {
            ...mockPlan.success_indicator,
            overall_score: 81,
            response_eta_score: 76
          }
        };
        mockTimeline.unshift({
          id: `TL-${Date.now()}`,
          timestamp: nowStr,
          event: "CRITICAL ALERT: Causeway Arterial 1 collapsed! Primary route to Zone A severed.",
          severity: "CRITICAL",
          zone: "Zone A",
          resource_impact: "4 Ambulances rerouted; transit invalidated",
          agent_response: "ATLAS executed instant rollback to Feasible State and initiated Agent Council Re-plan v2",
          plan_version: newVer
        });
        return {
          message: "Causeway collapsed! Infeasible allocations rolled back. Plan v2 generated with North Flyover detour & boat water-launch."
        };
      } else if (eventType === "CASUALTY_SPIKE") {
        mockZones[1].casualties += 35;
        mockZones[1].severity = "CRITICAL";
        mockDisaster.casualties += 35;
        mockTimeline.unshift({
          id: `TL-${Date.now()}`,
          timestamp: nowStr,
          event: "Mass Casualty Spike (+35) in Zone B after retaining wall breach",
          severity: "CRITICAL",
          zone: "Zone B",
          resource_impact: "Medical trauma kits and ambulances critically overloaded",
          agent_response: "TRIAGE and OPTIMA reallocated 3 ambulances from Highland to Zone B",
          plan_version: mockPlan.version
        });
        return { message: "Casualty spike recorded! TRIAGE priority shifted to Zone B." };
      } else if (eventType === "FLOOD_SURGE") {
        mockZones[2].flood_level_meters = 2.4;
        mockZones[2].severity = "CRITICAL";
        mockTimeline.unshift({
          id: `TL-${Date.now()}`,
          timestamp: nowStr,
          event: "Secondary Flood Surge (+0.9m) impacting South Delta Lowlands",
          severity: "HIGH",
          zone: "Zone C",
          resource_impact: "Delta Tollway water-logged; urgent evacuation initiated",
          agent_response: "COMMUNICATION broadcasted multilingual evacuation alerts for Zone C",
          plan_version: mockPlan.version
        });
        return { message: "Flood surge registered! Zone C escalated to EVACUATION." };
      } else if (eventType === "HOSPITAL_OVERLOAD") {
        mockHealthcare[0].available_beds = 0;
        mockHealthcare[0].emergency_capacity_status = "OVERFLOW";
        mockHealthcare[0].accepting_critical = false;
        mockTimeline.unshift({
          id: `TL-${Date.now()}`,
          timestamp: nowStr,
          event: "Metropolitan Trauma Hospital saturated (100% ICU)",
          severity: "HIGH",
          zone: "Metro Basin",
          resource_impact: "Ambulance patient drop-offs diverted to St. Jude Hospital",
          agent_response: "TRIAGE modified ambulance routing matrix to St. Jude & Highland",
          plan_version: mockPlan.version
        });
        return { message: "Hospital overload handled! Ambulances automatically rerouted to St. Jude." };
      } else {
        mockResources[1].available = 1;
        mockResources[1].shortage = 4;
        mockResources[1].status = "CRITICAL";
        mockTimeline.unshift({
          id: `TL-${Date.now()}`,
          timestamp: nowStr,
          event: "Critical resource depletion: Available boats dropped to 1",
          severity: "CRITICAL",
          zone: "Central Depot",
          resource_impact: "Severe shortage warning triggered by OPTIMA",
          agent_response: "OPTIMA requested regional inter-agency mutual aid resupply",
          plan_version: mockPlan.version
        });
        return { message: "Depletion flagged! Mutual aid resupply and rationing recommendations activated." };
      }
    }),

  runAgents: () =>
    fetchWithFallback<any>("/agents/run", { method: "POST" }, () => ({
      status: "SUCCESS",
      message: "Agent Council evaluated current state and refreshed tactical directives."
    })),

  recalculatePlan: () =>
    fetchWithFallback<ResponsePlan>("/response-plan/recalculate", { method: "POST" }, () => {
      mockPlanCounter += 1;
      mockPlan = {
        ...mockPlan,
        version: `Plan v${mockPlanCounter}`,
        title: `Adaptive Operations Plan — Recalibrated Directive`,
        created_at: new Date().toLocaleTimeString()
      };
      return mockPlan;
    }),

  approvePlan: (commander: string, notes?: string) =>
    fetchWithFallback<any>("/response-plan/approve", {
      method: "POST",
      body: JSON.stringify({ commander_name: commander, notes })
    }, () => {
      mockPlan.status = "APPROVED";
      return { status: "APPROVED", plan_version: mockPlan.version, commander, notes };
    }),

  rejectPlan: (commander: string, notes?: string) =>
    fetchWithFallback<any>("/response-plan/reject", {
      method: "POST",
      body: JSON.stringify({ commander_name: commander, notes })
    }, () => {
      mockPlanCounter += 1;
      mockPlan = {
        ...mockPlan,
        version: `Plan v${mockPlanCounter}`,
        status: "APPROVED"
      };
      return { status: "REJECTED_AND_RECALIBRATED", new_plan_version: mockPlan.version };
    }),

  executeRollback: (triggerReason: string, affectedResources: string[]) =>
    fetchWithFallback<any>("/plan/rollback", {
      method: "POST",
      body: JSON.stringify({ trigger_reason: triggerReason, affected_resources: affectedResources })
    }, () => {
      mockPlanCounter += 1;
      mockPlan = {
        ...mockPlan,
        version: `Plan v${mockPlanCounter}`,
        title: `Adaptive Rollback Plan — ${triggerReason.slice(0, 30)}`
      };
      return { status: "ROLLED_BACK", active_plan: mockPlan };
    }),

  submitSOS: (data: Partial<CitizenSOS>) =>
    fetchWithFallback<CitizenSOS>("/sos", {
      method: "POST",
      body: JSON.stringify(data)
    }, () => {
      const isDup = mockSOS.some(s => s.emergency_type === data.emergency_type && Math.abs(s.lat - (data.lat || 13.08)) < 0.005);
      const newSos: CitizenSOS = {
        id: `SOS-${Date.now().toString().slice(-4)}`,
        name: data.name || "Anonymous Citizen",
        phone: data.phone || "+91-90000-00000",
        lat: data.lat || 13.0835,
        lng: data.lng || 80.2785,
        address: data.address || "Marina Corridor",
        emergency_type: data.emergency_type || "Trapped",
        people_count: data.people_count || 1,
        medical_emergency: Boolean(data.medical_emergency),
        trapped_status: Boolean(data.trapped_status),
        description: data.description || "Urgent emergency assistance needed",
        severity: data.medical_emergency ? "CRITICAL" : "HIGH",
        status: data.medical_emergency ? "TRIAGED" : "PENDING",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        language: data.language || "English",
        duplicate_of: isDup ? "SOS-101" : undefined
      };
      mockSOS.unshift(newSos);
      return newSos;
    }),

  sendVoiceCommand: (text: string) =>
    fetchWithFallback<VoiceCommandResponse>("/voice/command", {
      method: "POST",
      body: JSON.stringify({ audio_text: text })
    }, () => {
      const t = text.toLowerCase();
      let intent = "UNKNOWN";
      let action = "NOOP";
      let speech = "Directive received. Analyzing operational constraints.";

      if (t.includes("critical zone") || t.includes("show zone")) {
        intent = "SHOW_CRITICAL_ZONES";
        action = "FILTER_ZONES_CRITICAL";
        speech = "Displaying critical disaster zones. Zone A Downtown Marina is currently highest priority with 2.8m water depth.";
      } else if (t.includes("rescue boat") || t.includes("boat")) {
        intent = "SHOW_RESCUE_BOATS";
        action = "HIGHLIGHT_BOATS";
        speech = `There are currently 2 rescue boats available in reserve, with 8 vessels deployed in active water rescue.`;
      } else if (t.includes("situation report") || t.includes("sitrep")) {
        intent = "GENERATE_SITREP";
        action = "OPEN_SITREP";
        speech = `Situation report compiled. 42 casualties verified, operations proceeding under ${mockPlan.version}.`;
      } else if (t.includes("recalculate") || t.includes("re-plan")) {
        intent = "RECALCULATE_PLAN";
        action = "RECALCULATE_PLAN";
        mockPlanCounter += 1;
        mockPlan.version = `Plan v${mockPlanCounter}`;
        speech = `Response plan recalibrated by Agent Council. Now operating under ${mockPlan.version}.`;
      } else if (t.includes("hospital")) {
        intent = "SHOW_HOSPITALS";
        action = "HIGHLIGHT_HEALTHCARE";
        speech = "Displaying healthcare centers. Metropolitan Trauma Hospital is at surge capacity; St. Jude General Hospital has 58 available beds.";
      } else {
        intent = "ACTIVATE_EVACUATION";
        action = "EVACUATION_ALERT";
        speech = "Evacuation plan reinforced. Multilingual emergency broadcasts dispatched in English, Tamil, and Hindi.";
      }

      return {
        recognized_text: text,
        intent,
        parameters: {},
        action_taken: action,
        speech_response: speech
      };
    }),

  sendVoiceReport: (text: string, language: string = "en") =>
    fetchWithFallback<CitizenSOS>("/voice/report", {
      method: "POST",
      body: JSON.stringify({ voice_text: text, language })
    }, () => {
      const isMed = text.toLowerCase().includes("medical") || text.toLowerCase().includes("injured") || text.toLowerCase().includes("pain");
      const newSos: CitizenSOS = {
        id: `SOS-V-${Date.now().toString().slice(-4)}`,
        name: "Voice Caller (Field Dispatch)",
        phone: "+91-91234-56789",
        lat: 13.0838,
        lng: 80.2780,
        address: "Zone A — Marina Sector (Transcribed via Voice)",
        emergency_type: isMed ? "Medical" : "Trapped",
        people_count: text.includes("five") ? 5 : (text.includes("four") ? 4 : 2),
        medical_emergency: isMed,
        trapped_status: true,
        description: `[Voice Report]: ${text}`,
        severity: isMed ? "CRITICAL" : "HIGH",
        status: "TRIAGED",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        language: language === "ta" ? "Tamil" : (language === "hi" ? "Hindi" : "English")
      };
      mockSOS.unshift(newSos);
      return newSos;
    }),

  resetScenario: () =>
    fetchWithFallback<any>("/reset", { method: "POST" }, () => {
      mockPlanCounter = 1;
      return { status: "SUCCESS", message: "Simulation reset to default Riverine Flood scenario." };
    })
};
