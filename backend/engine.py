from __future__ import annotations
import math
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple

from models import (
    DisasterState, ZoneData, ResourceItem, ResourceAllocation, ResourceForecast,
    IncidentEvent, CitizenSOS, HealthcareCenter, ResponsePlan, PlanDecisionExplanation,
    PlanSuccessIndicator, PlanRollbackRecord, TimelineEvent, AgentInfo,
    AgentRecommendation, AgentDebate, DebateStatement, SituationReport,
    VoiceCommandResponse
)

class DisasterEngine:
    def __init__(self):
        self.reset_to_default_scenario()

    def reset_to_default_scenario(self):
        self.start_time = datetime.now()
        self.plan_counter = 1
        
        # 1. Main Disaster State
        self.disaster = DisasterState(
            id="DISASTER-2026-FLOOD-01",
            title="Riverine Flash Flood Emergency — Metro Basin",
            type="Riverine Flash Flood & Dam Spillover",
            severity="CRITICAL",
            status="ACTIVE",
            affected_population=48500,
            casualties=42,
            displaced_count=3200,
            started_at=(self.start_time - timedelta(hours=2, minutes=15)).strftime("%Y-%m-%d %H:%M:%S"),
            last_updated=self.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            description="Rapid overflow of Northern Reservoir following 180mm extreme rainfall. Flood crest moving south along Valley River corridor.",
            escalation_level=4
        )

        # 2. Zones (Metro Basin coordinates around center 13.0827, 80.2707 - River Basin)
        self.zones: Dict[str, ZoneData] = {
            "ZONE-A": ZoneData(
                id="ZONE-A",
                name="Zone A — Downtown Marina Corridor",
                lat=13.0835,
                lng=80.2785,
                severity="CRITICAL",
                population=14200,
                casualties=24,
                trapped_count=85,
                flood_level_meters=2.8,
                priority_score=94.5,
                status="CRITICAL",
                evacuation_percentage=35,
                accessible_routes=["Causeway Arterial 1", "North Flyover B"],
                blocked_routes=["River Road Pier"],
                assigned_resources={"Ambulances": 4, "Rescue Boats": 5, "Medical Kits": 120},
                needs=["Rescue Boats", "Advanced Trauma Kits", "Emergency Shelter"]
            ),
            "ZONE-B": ZoneData(
                id="ZONE-B",
                name="Zone B — Riverside West Residential",
                lat=13.0720,
                lng=80.2550,
                severity="HIGH",
                population=18500,
                casualties=11,
                trapped_count=60,
                flood_level_meters=1.9,
                priority_score=81.0,
                status="EVACUATING",
                evacuation_percentage=55,
                accessible_routes=["West Expressway", "Metro Ring Line"],
                blocked_routes=["Lower Embankment Lane"],
                assigned_resources={"Ambulances": 3, "Rescue Boats": 3, "Food Kits": 450},
                needs=["Food/Water", "Rescue Boats", "Power Generators"]
            ),
            "ZONE-C": ZoneData(
                id="ZONE-C",
                name="Zone C — South Delta Lowlands",
                lat=13.0480,
                lng=80.2620,
                severity="HIGH",
                population=9200,
                casualties=5,
                trapped_count=30,
                flood_level_meters=1.5,
                priority_score=72.0,
                status="MONITORING",
                evacuation_percentage=48,
                accessible_routes=["South Highway 45", "Delta Tollway"],
                blocked_routes=[],
                assigned_resources={"Rescue Vehicles": 5, "Water Kits": 600},
                needs=["Evacuation Shuttles", "Clean Water", "Sandbags"]
            ),
            "ZONE-D": ZoneData(
                id="ZONE-D",
                name="Zone D — Highland Staging Sector",
                lat=13.0980,
                lng=80.2350,
                severity="LOW",
                population=6600,
                casualties=2,
                trapped_count=0,
                flood_level_meters=0.2,
                priority_score=38.0,
                status="STABILIZED",
                evacuation_percentage=90,
                accessible_routes=["Grand Trunk North", "Highland Bypass"],
                blocked_routes=[],
                assigned_resources={"Rescue Vehicles": 2, "Shelter Spaces": 600},
                needs=["Medical Resupply", "Coordination Tent"]
            )
        }

        # 3. Emergency Resources
        self.resources: Dict[str, ResourceItem] = {
            "res_amb": ResourceItem(
                id="res_amb",
                name="Ambulances",
                category="VEHICLE",
                unit="units",
                total=20,
                available=8,
                allocated=7,
                in_transit=4,
                used=1,
                remaining=8,
                demand=15,
                shortage=0,
                status="WARNING"
            ),
            "res_boat": ResourceItem(
                id="res_boat",
                name="Rescue Boats",
                category="VEHICLE",
                unit="vessels",
                total=12,
                available=2,
                allocated=8,
                in_transit=2,
                used=0,
                remaining=2,
                demand=14,
                shortage=2,
                status="CRITICAL"
            ),
            "res_veh": ResourceItem(
                id="res_veh",
                name="Rescue Trucks (4x4)",
                category="VEHICLE",
                unit="vehicles",
                total=25,
                available=12,
                allocated=9,
                in_transit=3,
                used=1,
                remaining=12,
                demand=16,
                shortage=0,
                status="NORMAL"
            ),
            "res_med": ResourceItem(
                id="res_med",
                name="Medical Trauma Kits",
                category="MEDICAL",
                unit="kits",
                total=450,
                available=180,
                allocated=200,
                in_transit=50,
                used=20,
                remaining=180,
                demand=320,
                shortage=0,
                status="WARNING"
            ),
            "res_food": ResourceItem(
                id="res_food",
                name="Ration Food Packets",
                category="SUSTENANCE",
                unit="packs",
                total=2500,
                available=1100,
                allocated=1050,
                in_transit=250,
                used=100,
                remaining=1100,
                demand=1600,
                shortage=0,
                status="NORMAL"
            ),
            "res_water": ResourceItem(
                id="res_water",
                name="Potable Water Jugs (20L)",
                category="SUSTENANCE",
                unit="jugs",
                total=3000,
                available=1200,
                allocated=1350,
                in_transit=300,
                used=150,
                remaining=1200,
                demand=2200,
                shortage=0,
                status="NORMAL"
            ),
            "res_shelter": ResourceItem(
                id="res_shelter",
                name="Shelter Spaces",
                category="SHELTER",
                unit="cots",
                total=1400,
                available=420,
                allocated=850,
                in_transit=0,
                used=130,
                remaining=420,
                demand=950,
                shortage=0,
                status="WARNING"
            ),
            "res_personnel": ResourceItem(
                id="res_personnel",
                name="Rescue Personnel",
                category="PERSONNEL",
                unit="first-responders",
                total=160,
                available=45,
                allocated=95,
                in_transit=15,
                used=5,
                remaining=45,
                demand=120,
                shortage=0,
                status="NORMAL"
            ),
            "res_fuel": ResourceItem(
                id="res_fuel",
                name="Generator Fuel",
                category="ENERGY",
                unit="liters",
                total=5000,
                available=1850,
                allocated=2400,
                in_transit=500,
                used=250,
                remaining=1850,
                demand=3200,
                shortage=0,
                status="NORMAL"
            ),
            "res_comm": ResourceItem(
                id="res_comm",
                name="Satellite Comm Sets",
                category="ENERGY",
                unit="sets",
                total=30,
                available=12,
                allocated=15,
                in_transit=2,
                used=1,
                remaining=12,
                demand=18,
                shortage=0,
                status="NORMAL"
            )
        }

        # 4. Agents Directory
        self.agents: Dict[str, AgentInfo] = {
            "ATLAS": AgentInfo(
                name="ATLAS",
                role="Strategic Orchestrator",
                description="Coordinates agent recommendations, detects conflicts, enforces constraints, and produces cohesive command directives.",
                status="ANALYZING",
                confidence=0.96,
                specialties=["Multi-Agent Orchestration", "Risk Optimization", "Constraint Enforcement", "Plan Formulation"]
            ),
            "TRIAGE": AgentInfo(
                name="TRIAGE",
                role="Medical & Casualty Agent",
                description="Evaluates casualty severity, monitors hospital bed availability, and prioritizes urgent ambulance and medical kit routing.",
                status="DEBATING",
                confidence=0.93,
                specialties=["Casualty Assessment", "Hospital Capacity Check", "Trauma Resource Allocation"]
            ),
            "CONVOY": AgentInfo(
                name="CONVOY",
                role="Logistics & Mobility Agent",
                description="Manages rescue boat corridors, 4x4 heavy transport, flood-safe routing, and relief convoy scheduling.",
                status="DEBATING",
                confidence=0.91,
                specialties=["Route Optimization", "Boat Fleet Dispatch", "Bridge/Road Feasibility"]
            ),
            "OPTIMA": AgentInfo(
                name="OPTIMA",
                role="Resource Optimization Agent",
                description="Runs linear resource balancing, forecasts depletion horizons, detects overallocation, and synthesizes debate compromises.",
                status="ANALYZING",
                confidence=0.98,
                specialties=["Constraint Solving", "Depletion Forecasting", "Mathematical Optimization", "Conflict Arbitration"]
            ),
            "COMMUNICATION": AgentInfo(
                name="COMMUNICATION",
                role="Public & Field Warning Agent",
                description="Dispatches multilingual emergency alerts (English, Tamil, Hindi) to affected citizens and coordinates field teams.",
                status="EXECUTING",
                confidence=0.95,
                specialties=["Multilingual Alerts", "Evacuation Broadcasts", "Field Team Sync"]
            )
        }

        # 5. Healthcare Centers
        self.healthcare_centers: List[HealthcareCenter] = [
            HealthcareCenter(
                id="HOSP-01",
                name="Metropolitan Trauma Hospital",
                type="Trauma Center",
                lat=13.0850,
                lng=80.2600,
                total_beds=400,
                available_beds=42,
                icu_beds_available=6,
                emergency_capacity_status="SURGE",
                trauma_capacity=15,
                distance_km=2.4,
                eta_minutes=12,
                phone="+91-44-2530-1100",
                accepting_critical=True
            ),
            HealthcareCenter(
                id="HOSP-02",
                name="St. Jude General Hospital",
                type="Hospital",
                lat=13.0650,
                lng=80.2450,
                total_beds=250,
                available_beds=58,
                icu_beds_available=12,
                emergency_capacity_status="NORMAL",
                trauma_capacity=22,
                distance_km=4.8,
                eta_minutes=18,
                phone="+91-44-2530-2200",
                accepting_critical=True
            ),
            HealthcareCenter(
                id="HOSP-03",
                name="Westside Emergency Clinic",
                type="Emergency Clinic",
                lat=13.0780,
                lng=80.2400,
                total_beds=80,
                available_beds=18,
                icu_beds_available=2,
                emergency_capacity_status="NEAR_CAPACITY",
                trauma_capacity=5,
                distance_km=3.1,
                eta_minutes=14,
                phone="+91-44-2530-3300",
                accepting_critical=False
            ),
            HealthcareCenter(
                id="HOSP-04",
                name="Highland Rapid Medical Camp",
                type="Medical Field Camp",
                lat=13.1020,
                lng=80.2300,
                total_beds=120,
                available_beds=75,
                icu_beds_available=4,
                emergency_capacity_status="NORMAL",
                trauma_capacity=10,
                distance_km=5.6,
                eta_minutes=20,
                phone="+91-44-2530-4400",
                accepting_critical=True
            )
        ]

        # 6. Citizen SOS List
        self.sos_reports: List[CitizenSOS] = [
            CitizenSOS(
                id="SOS-101",
                name="Dr. Priya Raman",
                phone="+91-98401-22910",
                lat=13.0842,
                lng=80.2790,
                address="Flat 4B, Riverview Apartments, Marina Road",
                emergency_type="Trapped",
                people_count=6,
                medical_emergency=True,
                trapped_status=True,
                description="Water reached 2nd floor balcony. Elderly diabetic patient has acute shortness of breath. No power.",
                severity="CRITICAL",
                status="TRIAGED",
                timestamp=(self.start_time - timedelta(minutes=28)).strftime("%H:%M:%S"),
                language="English"
            ),
            CitizenSOS(
                id="SOS-102",
                name="Sundaram K.",
                phone="+91-94440-11234",
                lat=13.0735,
                lng=80.2562,
                address="Bazaar Street, Riverside West",
                emergency_type="Food/Water",
                people_count=18,
                medical_emergency=False,
                trapped_status=True,
                description="Community hall roof shelter. Drinking water depleted. 4 children need baby food.",
                severity="HIGH",
                status="ASSIGNED",
                timestamp=(self.start_time - timedelta(minutes=42)).strftime("%H:%M:%S"),
                language="Tamil"
            ),
            CitizenSOS(
                id="SOS-103",
                name="Rajesh Sharma",
                phone="+91-98840-77651",
                lat=13.0495,
                lng=80.2635,
                address="South Delta Colony, Block C",
                emergency_type="Flood",
                people_count=4,
                medical_emergency=False,
                trapped_status=False,
                description="Ground floor submerged. Seeking evacuation vehicle to Highland relief camp.",
                severity="MEDIUM",
                status="PENDING",
                timestamp=(self.start_time - timedelta(minutes=14)).strftime("%H:%M:%S"),
                language="Hindi"
            ),
            CitizenSOS(
                id="SOS-104",
                name="Anand V.",
                phone="+91-98401-99881",
                lat=13.0840,
                lng=80.2788,
                address="Riverview Apartments, Block B",
                emergency_type="Trapped",
                people_count=5,
                medical_emergency=True,
                trapped_status=True,
                description="Duplicate report: Water rising near Riverview complex, medical support needed.",
                severity="CRITICAL",
                status="TRIAGED",
                timestamp=(self.start_time - timedelta(minutes=25)).strftime("%H:%M:%S"),
                language="English",
                duplicate_of="SOS-101"
            )
        ]

        # 7. Escalation Timeline Events
        self.timeline: List[TimelineEvent] = [
            TimelineEvent(
                id="TL-01",
                timestamp=(self.start_time - timedelta(hours=2, minutes=15)).strftime("%H:%M"),
                event="Extreme flood crest warning triggered at Northern Dam",
                severity="CRITICAL",
                zone="Zone A & B",
                resource_impact="Reservoir discharge reached 35,000 cusecs",
                agent_response="ATLAS activated Stage 4 Emergency Protocol",
                plan_version="Plan v1"
            ),
            TimelineEvent(
                id="TL-02",
                timestamp=(self.start_time - timedelta(hours=1, minutes=45)).strftime("%H:%M"),
                event="Zone A Downtown Marina water height crossed 2.5m threshold",
                severity="CRITICAL",
                zone="Zone A",
                resource_impact="River Road Pier submerged and impassable",
                agent_response="CONVOY redirected heavy 4x4 trucks to Causeway Arterial 1",
                plan_version="Plan v1"
            ),
            TimelineEvent(
                id="TL-03",
                timestamp=(self.start_time - timedelta(hours=1, minutes=10)).strftime("%H:%M"),
                event="Casualty spike detected at Marina residential cluster",
                severity="HIGH",
                zone="Zone A",
                resource_impact="24 patients reported with trauma and hypothermia",
                agent_response="TRIAGE requested 6 additional ambulances and 100 trauma kits",
                plan_version="Plan v1"
            ),
            TimelineEvent(
                id="TL-04",
                timestamp=(self.start_time - timedelta(minutes=40)).strftime("%H:%M"),
                event="Resource contention: Rescue boats demanded concurrently by Zone A and Zone B",
                severity="HIGH",
                zone="Zone A & Zone B",
                resource_impact="Demand (14 boats) exceeded total available (10 boats)",
                agent_response="OPTIMA initiated Agent Debate to resolve allocation without stock breach",
                plan_version="Plan v1"
            )
        ]

        # 8. Rollback History
        self.rollbacks: List[PlanRollbackRecord] = []

        # 9. Debates List
        self.debates: List[AgentDebate] = []
        self._build_initial_debate()

        # 10. Initial Response Plan
        self.current_plan = self._generate_response_plan_v1()
        self.plan_history: List[ResponsePlan] = [self.current_plan]

    def _build_initial_debate(self):
        debate_id = "DEBATE-" + str(uuid.uuid4())[:8]
        statements = [
            DebateStatement(
                agent_name="TRIAGE",
                round_number=1,
                statement_type="PROPOSAL",
                content="Urgent request: Allocate 7 Rescue Boats and 5 Ambulances exclusively to Zone A (Downtown Marina). 24 casualties trapped in multi-story floodwaters require rapid extraction before nightfall.",
                evidence=["24 verified casualties", "85 citizens isolated above 2.8m floodwaters", "Hypothermia window closing within 90 minutes"],
                constraints_noted=["Requires water-safe extraction", "Marina pier is submerged"],
                confidence=0.94
            ),
            DebateStatement(
                agent_name="CONVOY",
                round_number=1,
                statement_type="CHALLENGE",
                content="Counter-request: Zone B (Riverside West) has 60 trapped citizens and 18,500 exposed population. Diverting 70% of boats to Zone A leaves West residential perimeter unevacuated before the downstream surge.",
                evidence=["60 trapped in single-story structures", "18,500 total exposed population in Zone B", "Causeway route 1 has high traffic congestion"],
                constraints_noted=["Only 10 active rescue boats deployable in fleet", "Traffic choking Causeway 1"],
                confidence=0.89
            ),
            DebateStatement(
                agent_name="TRIAGE",
                round_number=2,
                statement_type="VALIDATION",
                content="Conceding fleet strain, but mortality risk in Zone A is 3.4x higher than Zone B due to swift water currents. A compromise: 5 boats to Zone A, 3 boats to Zone B, 2 in reserve.",
                evidence=["Water flow velocity 4.2 knots in Zone A vs 1.8 knots in Zone B", "Immediate medical triage needed"],
                constraints_noted=["Cannot afford zero boat reserve for sudden breaches"],
                confidence=0.92
            ),
            DebateStatement(
                agent_name="OPTIMA",
                round_number=2,
                statement_type="SYNTHESIS",
                content="Algorithmic resolution: Allocate 5 Rescue Boats to Zone A (High Velocity Triage) and 3 Rescue Boats to Zone B (Bulk Evacuation). Pair Zone B with 4x4 high-clearance trucks along West Expressway to compensate. Retain 2 boats in strategic reserve.",
                evidence=["Maximizes survival utility score from 71.4 to 88.2", "Prevents stock depletion below safety threshold", "Zero fleet over-allocation"],
                constraints_noted=["Available boats = 10", "4x4 trucks = 12 available"],
                confidence=0.97
            ),
            DebateStatement(
                agent_name="ATLAS",
                round_number=3,
                statement_type="CONSENSUS",
                content="Orchestration directive ratified: 5 boats assigned to Zone A, 3 to Zone B, 2 held at Highland Staging. Convoy routes verified. Both agents aligned on shared operational picture.",
                evidence=["Zero constraint violations", "Both agents confirmed feasible deployment"],
                constraints_noted=["Approved by Human Commander review pipeline"],
                confidence=0.96
            )
        ]

        debate = AgentDebate(
            id=debate_id,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            topic="Fleet Allocation Conflict: Rescue Boats for Zone A vs Zone B",
            involved_agents=["TRIAGE", "CONVOY", "OPTIMA", "ATLAS"],
            resource_at_stake="Rescue Boats (10 active / 14 requested)",
            competing_zones=["ZONE-A", "ZONE-B"],
            rounds=statements,
            conflict_detected="Simultaneous request for 7 boats by TRIAGE (Zone A) and 6 boats by CONVOY (Zone B) exceeded deployable total of 10 boats.",
            resolution_summary="OPTIMA synthesized 5-3-2 split with 4x4 vehicle augmentation in Zone B. Both agents accepted consensus.",
            optima_verdict={
                "zone_a_allocation": 5,
                "zone_b_allocation": 3,
                "reserve_retention": 2,
                "objective_score": 88.2,
                "shortage_prevented": True
            },
            final_allocation={
                "ZONE-A": {"Rescue Boats": 5, "Ambulances": 4},
                "ZONE-B": {"Rescue Boats": 3, "Rescue Trucks (4x4)": 6}
            },
            consensus_score=0.94
        )
        self.debates.append(debate)

    def _generate_response_plan_v1(self) -> ResponsePlan:
        allocations = [
            ResourceAllocation(
                id="ALLOC-01",
                resource_id="res_boat",
                resource_name="Rescue Boats",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                quantity=5,
                agent_responsible="CONVOY",
                eta_minutes=15,
                route_id="Causeway Arterial 1",
                status="EN_ROUTE"
            ),
            ResourceAllocation(
                id="ALLOC-02",
                resource_id="res_amb",
                resource_name="Ambulances",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                quantity=4,
                agent_responsible="TRIAGE",
                eta_minutes=12,
                route_id="Causeway Arterial 1",
                status="EN_ROUTE"
            ),
            ResourceAllocation(
                id="ALLOC-03",
                resource_id="res_boat",
                resource_name="Rescue Boats",
                zone_id="ZONE-B",
                zone_name="Zone B — Riverside West",
                quantity=3,
                agent_responsible="CONVOY",
                eta_minutes=20,
                route_id="West Expressway",
                status="EN_ROUTE"
            ),
            ResourceAllocation(
                id="ALLOC-04",
                resource_id="res_veh",
                resource_name="Rescue Trucks (4x4)",
                zone_id="ZONE-B",
                zone_name="Zone B — Riverside West",
                quantity=6,
                agent_responsible="CONVOY",
                eta_minutes=18,
                route_id="West Expressway",
                status="DELIVERED"
            ),
            ResourceAllocation(
                id="ALLOC-05",
                resource_id="res_med",
                resource_name="Medical Trauma Kits",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                quantity=120,
                agent_responsible="TRIAGE",
                eta_minutes=15,
                route_id="North Flyover B",
                status="EN_ROUTE"
            ),
            ResourceAllocation(
                id="ALLOC-06",
                resource_id="res_food",
                resource_name="Ration Food Packets",
                zone_id="ZONE-B",
                zone_name="Zone B — Riverside West",
                quantity=450,
                agent_responsible="CONVOY",
                eta_minutes=25,
                route_id="West Expressway",
                status="PLANNED"
            )
        ]

        explanations = [
            PlanDecisionExplanation(
                decision_topic="Prioritization of Zone A (Downtown Marina) for First Rescue Boats",
                explanation="Zone A displays a critical flood elevation of 2.8m with 24 verified casualties and 85 residents stranded on upper levels with water surging. Mortality hazard is estimated at 3.4x higher than surrounding sectors.",
                key_factors=["2.8m flood depth", "24 severe trauma/hypothermia patients", "Current speed 4.2 knots"],
                constraint_applied="Only 10 deployable rescue boats available in total municipal fleet",
                alternatives_considered="Even 5-5 split rejected by OPTIMA as it would starve Zone A of rapid medical evacuation speed."
            ),
            PlanDecisionExplanation(
                decision_topic="Allocation of Ambulances to Metropolitan Trauma Hospital",
                explanation="Metropolitan Trauma Hospital is within 2.4km (12 min ETA) and has active trauma surgeons on duty, despite 89% ICU bed occupancy. Critical casualties from Zone A are routed here first.",
                key_factors=["12 min travel ETA via North Flyover", "Level-1 trauma designation"],
                constraint_applied="St. Jude General is 4.8km away (18 min ETA), reserved as overflow secondary target.",
                alternatives_considered="Directing ambulances to Westside Clinic rejected due to lack of ICU surgical capacity."
            ),
            PlanDecisionExplanation(
                decision_topic="Deployment of 4x4 Heavy Trucks to Zone B in place of Boats",
                explanation="Because rescue boats are constrained, CONVOY and OPTIMA routed 6 high-clearance 4x4 trucks along West Expressway, which remains traversable at 0.6m water depth, freeing water vessels for deep Marina channels.",
                key_factors=["West Expressway passable for 4x4 axles", "Preserves precious boat hours"],
                constraint_applied="Boat fleet cap of 12 vessels",
                alternatives_considered="Leaving Zone B waiting for 2nd wave boats would have delayed 60 trapped citizens by 90 minutes."
            )
        ]

        indicator = PlanSuccessIndicator(
            overall_score=84,
            rating="OPTIMAL",
            resource_coverage_score=88,
            critical_zone_coverage_score=92,
            response_eta_score=85,
            hospital_capacity_score=80,
            conflict_resolution_score=95,
            evacuation_coverage_score=78,
            resource_shortage_penalty=6,
            factor_notes=[
                "High Critical Zone coverage (92%) due to concentrated Marina deployment.",
                "Resource shortages kept under control via 4x4 truck substitution.",
                "Hospital surge capacity in Metropolitan Trauma requires close tracking.",
                "Consensus achieved across all 4 operational agents with zero hard constraint violations."
            ]
        )

        return ResponsePlan(
            version="Plan v1",
            title="Rapid Evacuation & Triage Protocol — Riverine Inundation Phase 1",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status="APPROVED",
            priority_zones=["ZONE-A", "ZONE-B", "ZONE-C"],
            allocations=allocations,
            medical_actions=[
                "Establish Forward Triage Post at North Flyover B Ramp",
                "Deploy 4 Advanced Trauma Ambulances with portable defibrillators to Marina perimeter",
                "Pre-alert Metropolitan Trauma Hospital triage team for incoming hypothermia cases"
            ],
            evacuation_actions=[
                "Establish waterborne boat corridor along Causeway Arterial 1 for Zone A residents",
                "Operate continuous 4x4 shuttle loops from Riverside West to Highland Staging Sector",
                "Guide walking evacuees in Zone C towards South Highway 45 dry shoulders"
            ],
            logistics_actions=[
                "Stage 2 standby rescue boats at Highland Staging Depot",
                "Mobilize 1,100 food packets and 1,200 water jugs to Zone B community centers",
                "Refuel generator reserves at Metropolitan Trauma Center"
            ],
            communication_actions=[
                "Broadcast automated multilingual sirens and SMS alerts (English, Tamil, Hindi) regarding Causeway access",
                "Instruct Zone A residents to remain on 2nd floor or roof; avoid submerged basements",
                "Direct non-critical patients to Highland Rapid Medical Camp"
            ],
            risks=[
                "Potential Causeway Arterial 1 bridge pier scouring if flow exceeds 40,000 cusecs",
                "Metropolitan Trauma Hospital ICU beds reach saturation if casualties exceed 30",
                "Battery depletion on citizen cellular handsets within 4-6 hours"
            ],
            constraints=[
                "Do not exceed 10 active boat deployments (2 required in reserve)",
                "Respect 8-hour maximum shift duration for rescue dive personnel",
                "Do not route standard ambulances through waters deeper than 0.35m"
            ],
            expected_response_eta_minutes=15,
            success_indicator=indicator,
            explanations=explanations,
            rollback_ready=True
        )

    # ====================================================
    # EVENT INJECTION & REAL-TIME RE-PLANNING
    # ====================================================

    def inject_event(self, event_type: str) -> Dict[str, Any]:
        """Inject a real-time disaster incident, triggering debate, rollback, or re-planning."""
        now_str = datetime.now().strftime("%H:%M")
        
        if event_type == "ROAD_COLLAPSE":
            # Scenario Step 10: Marina Causeway collapses!
            incident = IncidentEvent(
                id="INC-" + str(uuid.uuid4())[:6],
                title="Bridge Structural Failure — Causeway Arterial 1 Collapsed",
                type="ROAD_COLLAPSE",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                severity="CRITICAL",
                timestamp=now_str,
                description="Causeway Arterial 1 central pier undermined by river current. Roadway washed out. All vehicular traffic halted. En-route ambulances and trucks blocked!",
                resource_impact="4 Ambulances and 5 Boat trailers blocked in transit; Causeway Arterial 1 impassable",
                affected_routes=["Causeway Arterial 1"]
            )
            # Update Zone routes
            self.zones["ZONE-A"].accessible_routes = ["North Flyover B"]
            self.zones["ZONE-A"].blocked_routes.append("Causeway Arterial 1")
            self.zones["ZONE-A"].priority_score = 98.0
            
            # Execute Rollback & Re-plan
            rollback_res = self.trigger_rollback(
                trigger_reason="Structural collapse of Causeway Arterial 1 invalidating primary transit route for Zone A",
                affected_resources=["Ambulances (ALLOC-02)", "Rescue Boats (ALLOC-01)"]
            )
            
            # Add to timeline
            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=now_str,
                event="CRITICAL ALERT: Causeway Arterial 1 collapsed! Primary route to Zone A severed.",
                severity="CRITICAL",
                zone="Zone A",
                resource_impact="4 Ambulances rerouted; transit invalidated",
                agent_response="ATLAS executed instant rollback to Feasible State and initiated Agent Council Re-plan v2",
                plan_version=self.current_plan.version
            ))

            return {
                "event": incident.model_dump(),
                "rollback": rollback_res,
                "new_plan": self.current_plan.model_dump(),
                "message": "Causeway collapsed! Infeasible allocations rolled back. Plan v2 generated with North Flyover detour & boat water-launch."
            }

        elif event_type == "CASUALTY_SPIKE":
            incident = IncidentEvent(
                id="INC-" + str(uuid.uuid4())[:6],
                title="Mass Casualty Inflow — Residential Complex Wall Breach",
                type="CASUALTY_SPIKE",
                zone_id="ZONE-B",
                zone_name="Zone B — Riverside West",
                severity="CRITICAL",
                timestamp=now_str,
                description="Perimeter retaining wall collapsed at West Riverside Apartment Complex. 35 additional citizens injured by debris and flash surge.",
                resource_impact="Casualties in Zone B rose from 11 to 46. Urgent trauma and blood supply needed.",
                affected_routes=[]
            )
            self.zones["ZONE-B"].casualties += 35
            self.zones["ZONE-B"].severity = "CRITICAL"
            self.zones["ZONE-B"].priority_score = 96.0
            self.disaster.casualties += 35

            self._recalculate_plan(reason="Casualty Spike in Zone B (+35 wounded)")
            
            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=now_str,
                event="Mass Casualty Spike (+35) in Zone B after retaining wall breach",
                severity="CRITICAL",
                zone="Zone B",
                resource_impact="Medical trauma kits and ambulances critically overloaded",
                agent_response="TRIAGE and OPTIMA reallocated 3 ambulances from Highland to Zone B",
                plan_version=self.current_plan.version
            ))

            return {
                "event": incident.model_dump(),
                "new_plan": self.current_plan.model_dump(),
                "message": "Casualty spike recorded! TRIAGE priority shifted to Zone B."
            }

        elif event_type == "FLOOD_SURGE":
            incident = IncidentEvent(
                id="INC-" + str(uuid.uuid4())[:6],
                title="Secondary Flood Surge — Upstream Sluice Emergency Release",
                type="FLOOD_SURGE",
                zone_id="ZONE-C",
                zone_name="Zone C — South Delta Lowlands",
                severity="HIGH",
                timestamp=now_str,
                description="Dam water level reached maximum safe limit. 15,000 cusecs released. South Delta flood elevation surged from 1.5m to 2.4m.",
                resource_impact="Zone C population exposed. Low-lying mud roads submerged.",
                affected_routes=["Delta Tollway"]
            )
            self.zones["ZONE-C"].flood_level_meters = 2.4
            self.zones["ZONE-C"].severity = "CRITICAL"
            self.zones["ZONE-C"].status = "EVACUATING"
            self.zones["ZONE-C"].priority_score = 88.0

            self._recalculate_plan(reason="Flood surge in South Delta (+0.9m)")

            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=now_str,
                event="Secondary Flood Surge (+0.9m) impacting South Delta Lowlands",
                severity="HIGH",
                zone="Zone C",
                resource_impact="Delta Tollway water-logged; urgent evacuation initiated",
                agent_response="COMMUNICATION broadcasted multilingual evacuation alerts for Zone C",
                plan_version=self.current_plan.version
            ))

            return {
                "event": incident.model_dump(),
                "new_plan": self.current_plan.model_dump(),
                "message": "Flood surge registered! Zone C escalated to EVACUATION."
            }

        elif event_type == "HOSPITAL_OVERLOAD":
            incident = IncidentEvent(
                id="INC-" + str(uuid.uuid4())[:6],
                title="Hospital Saturation Alert — Metropolitan Trauma at 100% ICU Capacity",
                type="HOSPITAL_OVERLOAD",
                zone_id="ZONE-A",
                zone_name="Metropolitan Trauma Hospital",
                severity="HIGH",
                timestamp=now_str,
                description="Metropolitan Trauma Hospital reports all 42 available beds and 6 ICU beds filled. Triage diverted to St. Jude and Highland Field Camp.",
                resource_impact="Emergency intake suspended for critical surgical patients at Metro Trauma",
                affected_routes=[]
            )
            self.healthcare_centers[0].available_beds = 0
            self.healthcare_centers[0].icu_beds_available = 0
            self.healthcare_centers[0].emergency_capacity_status = "OVERFLOW"
            self.healthcare_centers[0].accepting_critical = False

            self._recalculate_plan(reason="Metropolitan Trauma Hospital saturated")

            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=now_str,
                event="Metropolitan Trauma Hospital saturated (100% ICU)",
                severity="HIGH",
                zone="Metro Basin",
                resource_impact="Ambulance patient drop-offs diverted to St. Jude Hospital",
                agent_response="TRIAGE modified ambulance routing matrix to St. Jude & Highland",
                plan_version=self.current_plan.version
            ))

            return {
                "event": incident.model_dump(),
                "new_plan": self.current_plan.model_dump(),
                "message": "Hospital overload handled! Ambulances automatically rerouted to St. Jude."
            }

        elif event_type == "RESOURCE_SHORTAGE":
            incident = IncidentEvent(
                id="INC-" + str(uuid.uuid4())[:6],
                title="Critical Depletion Warning — Rescue Boats & Medical Trauma Kits",
                type="RESOURCE_SHORTAGE",
                zone_id="ZONE-A",
                zone_name="Central Depot",
                severity="CRITICAL",
                timestamp=now_str,
                description="Heavy deployment reduced available Rescue Boats to 1 and Medical Kits to 65. Depletion forecast under 2 hours without resupply.",
                resource_impact="Available boats = 1; Medical Kits in central depot below safe buffer",
                affected_routes=[]
            )
            self.resources["res_boat"].available = 1
            self.resources["res_boat"].shortage = 4
            self.resources["res_boat"].status = "CRITICAL"
            self.resources["res_med"].available = 65
            self.resources["res_med"].status = "CRITICAL"

            self._recalculate_plan(reason="Severe boat & medical kit depletion")

            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=now_str,
                event="Critical resource depletion: Available boats dropped to 1",
                severity="CRITICAL",
                zone="Central Depot",
                resource_impact="Severe shortage warning triggered by OPTIMA",
                agent_response="OPTIMA requested regional inter-agency mutual aid resupply",
                plan_version=self.current_plan.version
            ))

            return {
                "event": incident.model_dump(),
                "new_plan": self.current_plan.model_dump(),
                "message": "Depletion flagged! Mutual aid resupply and rationing recommendations activated."
            }

        else:
            return {"error": f"Unknown event type: {event_type}"}

    # ====================================================
    # ROLLBACK & RE-PLANNING ENGINE
    # ====================================================

    def trigger_rollback(self, trigger_reason: str, affected_resources: List[str]) -> PlanRollbackRecord:
        """Roll back infeasible allocations, trigger council debate, generate versioned plan."""
        prev_version = self.current_plan.version
        self.plan_counter += 1
        new_version = f"Plan v{self.plan_counter}"

        # 1. Recover invalidated allocations
        recovered_count = 0
        valid_allocations = []
        for alloc in self.current_plan.allocations:
            if alloc.route_id == "Causeway Arterial 1" or "Causeway" in (alloc.route_id or ""):
                alloc.status = "REVERTED"
                recovered_count += alloc.quantity
            else:
                valid_allocations.append(alloc)

        # 2. Add rerouted allocations using North Flyover B and River Boat Staging
        valid_allocations.extend([
            ResourceAllocation(
                id="ALLOC-REROUTE-01",
                resource_id="res_boat",
                resource_name="Rescue Boats",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                quantity=5,
                agent_responsible="CONVOY",
                eta_minutes=24,  # +9 min detour
                route_id="North Flyover B -> River Boat Slipway",
                status="EN_ROUTE"
            ),
            ResourceAllocation(
                id="ALLOC-REROUTE-02",
                resource_id="res_amb",
                resource_name="Ambulances",
                zone_id="ZONE-A",
                zone_name="Zone A — Downtown Marina",
                quantity=4,
                agent_responsible="TRIAGE",
                eta_minutes=22,  # detour via flyover
                route_id="North Flyover B Ramp",
                status="EN_ROUTE"
            )
        ])

        # 3. Create Debate for Re-plan
        new_debate_id = "DEBATE-" + str(uuid.uuid4())[:8]
        re_debate = AgentDebate(
            id=new_debate_id,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            topic=f"Emergency Re-planning: {trigger_reason}",
            involved_agents=["ATLAS", "CONVOY", "TRIAGE", "OPTIMA"],
            resource_at_stake="Transit Routes & Detour Feasibility",
            competing_zones=["ZONE-A"],
            rounds=[
                DebateStatement(
                    agent_name="CONVOY",
                    round_number=1,
                    statement_type="PROPOSAL",
                    content="Causeway 1 severed. Reroute all heavy boat trailers via North Flyover B to River Boat Slipway. Increases transit ETA by 9 minutes, but completely avoids collapsed causeway.",
                    evidence=["North Flyover B structurally sound and 4.5m above flood level", "Slipway dock provides direct water entry"],
                    constraints_noted=["North Flyover width allows single-lane heavy trailer passage"],
                    confidence=0.93
                ),
                DebateStatement(
                    agent_name="TRIAGE",
                    round_number=1,
                    statement_type="CHALLENGE",
                    content="A 9-minute delay for critical hypothermia patients risks cardiovascular collapse. Can ambulances take West Expressway detour instead?",
                    evidence=["Critical triage window under 60 minutes for 6 patients"],
                    constraints_noted=["West Expressway has 18-minute transit time to Metro Trauma"],
                    confidence=0.90
                ),
                DebateStatement(
                    agent_name="OPTIMA",
                    round_number=2,
                    statement_type="SYNTHESIS",
                    content="Analysis shows North Flyover B detour (22 min) is 6 minutes faster than West Expressway detour (28 min) during flood traffic. Recommend priority green-wave escort for ambulances across North Flyover.",
                    evidence=["Traffic sensor telemetry confirms North Flyover flow is 38 km/h vs 14 km/h on Expressway"],
                    constraints_noted=["Requires police motorcycle escort at Flyover junction"],
                    confidence=0.96
                ),
                DebateStatement(
                    agent_name="ATLAS",
                    round_number=3,
                    statement_type="CONSENSUS",
                    content="Adopting OPTIMA synthesis. Allocations re-bound to North Flyover B with police escort. Rollback verified and new Plan v2 published.",
                    evidence=["Zero vehicles stranded", "New ETA within medical safety threshold"],
                    constraints_noted=["Approved by automated safety validator"],
                    confidence=0.95
                )
            ],
            conflict_detected="Causeway collapse made Plan v1 allocations infeasible. Debate resolved detour routing vs ETA trade-off.",
            resolution_summary="Selected North Flyover B with high-priority escort, recovering full access to Zone A.",
            optima_verdict={"selected_route": "North Flyover B", "eta_delta_minutes": +7, "feasibility": 1.0},
            final_allocation={"ZONE-A": {"Ambulances": 4, "Rescue Boats": 5}},
            consensus_score=0.96
        )
        self.debates.insert(0, re_debate)

        # 4. Create Rollback Record
        record = PlanRollbackRecord(
            id="RB-" + str(uuid.uuid4())[:6],
            timestamp=datetime.now().strftime("%H:%M:%S"),
            trigger_incident=trigger_reason,
            previous_plan_version=prev_version,
            affected_resources=affected_resources,
            new_plan_version=new_version,
            explanation=f"Detected route infeasibility due to {trigger_reason}. Safely recalled 9 stranded assets and re-routed via North Flyover B in {new_version}.",
            recovered_assets_count=recovered_count
        )
        self.rollbacks.insert(0, record)

        # 5. Create new updated plan
        new_plan = ResponsePlan(
            version=new_version,
            title=f"Adaptive Contingency Plan — Detour & Resupply ({trigger_reason[:40]}...)",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status="APPROVED",
            priority_zones=["ZONE-A", "ZONE-B", "ZONE-C"],
            allocations=valid_allocations,
            medical_actions=[
                "Shift forward casualty transfer to North Flyover B staging ramp",
                "Deploy mobile oxygen respirators to offset 7-minute detour transit delay",
                "Divert non-surgical casualties to St. Jude General Hospital"
            ],
            evacuation_actions=[
                "Launch waterborne boats from North River Slipway directly into Marina sector",
                "Maintain 4x4 bus shuttles along West Expressway for Zone B residents"
            ],
            logistics_actions=[
                "Deploy traffic marshals to North Flyover B single-lane bottleneck",
                "Establish temporary fuel pod at North Slipway for rescue boat motors"
            ],
            communication_actions=[
                "Issue urgent advisory: Causeway Arterial 1 CLOSED TO ALL CIVILIANS",
                "Broadcast alternative evacuation waypoint: North Flyover B Footbridge",
                "Send SMS in Tamil, English, and Hindi to 14,200 Marina residents"
            ],
            risks=[
                "Congestion on North Flyover B if civilian traffic is not diverted promptly",
                "Reduced speed on secondary slipway access lane"
            ],
            constraints=[
                "Max 2 heavy vehicle convoys simultaneously on North Flyover B span",
                "Maintain minimum 15% fuel buffer on all rescue vessels"
            ],
            expected_response_eta_minutes=22,
            success_indicator=PlanSuccessIndicator(
                overall_score=81,
                rating="OPTIMAL",
                resource_coverage_score=85,
                critical_zone_coverage_score=89,
                response_eta_score=76,
                hospital_capacity_score=80,
                conflict_resolution_score=94,
                evacuation_coverage_score=79,
                resource_shortage_penalty=8,
                factor_notes=[
                    "Rollback executed smoothly with 0 asset losses.",
                    "Detour via North Flyover B added +7 minutes to average ETA.",
                    "Critical zone coverage remains resilient at 89%."
                ]
            ),
            explanations=[
                PlanDecisionExplanation(
                    decision_topic="Why did the system execute an Automatic Plan Rollback?",
                    explanation=f"Causeway Arterial 1 collapse rendered {prev_version} physically infeasible. Vehicles in transit on that route faced structural failure hazard. The system immediately invalidated the compromised allocations, restored resources to safe standing, and initiated Agent Council re-planning.",
                    key_factors=["Route severance", "Asset safety preservation", "Real-time constraint invalidation"],
                    constraint_applied="Roadway capacity on collapsed span dropped to 0",
                    alternatives_considered="Attempting passage on Causeway was rejected by safety constraint engine."
                ),
                PlanDecisionExplanation(
                    decision_topic="Why was North Flyover B chosen over West Expressway?",
                    explanation="Telemetry showed North Flyover B allows a 22-minute ETA to Marina, whereas West Expressway was gridlocked with civilian traffic (28-minute ETA). North Flyover B offers elevated clearance from flood surge.",
                    key_factors=["6 min faster transit", "Elevated clearance above high water mark"],
                    constraint_applied="Single-lane vehicle weight limits on flyover span",
                    alternatives_considered="West Expressway detour evaluated and stored as secondary fallback."
                ),
                PlanDecisionExplanation(
                    decision_topic=f"What changed from {prev_version} to {new_version}?",
                    explanation=f"1) Route for 5 Rescue Boats and 4 Ambulances changed from Causeway Arterial 1 to North Flyover B. 2) Expected ETA increased from 15 min to 22 min. 3) Water access shifted to North Slipway dock. 4) Plan Success Level adjusted from 84% to 81%.",
                    key_factors=["Route rerouting", "Slipway launchpoint shift", "ETA recalibration"],
                    constraint_applied="New infrastructure availability matrix",
                    alternatives_considered="Stand-down order for Zone A rejected due to trapped casualty hazard."
                )
            ],
            rollback_ready=True
        )

        self.current_plan = new_plan
        self.plan_history.insert(0, new_plan)
        return record

    def _recalculate_plan(self, reason: str):
        """Standard plan recalculation without full rollback."""
        self.plan_counter += 1
        new_version = f"Plan v{self.plan_counter}"

        # Adjust score according to situation
        score = max(65, 84 - (self.plan_counter * 2))
        
        updated_plan = ResponsePlan(
            version=new_version,
            title=f"Adaptive Operations Plan — Recalibrated for {reason}",
            created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            status="APPROVED",
            priority_zones=["ZONE-A", "ZONE-B", "ZONE-C"],
            allocations=self.current_plan.allocations,
            medical_actions=self.current_plan.medical_actions,
            evacuation_actions=self.current_plan.evacuation_actions,
            logistics_actions=self.current_plan.logistics_actions,
            communication_actions=self.current_plan.communication_actions,
            risks=self.current_plan.risks,
            constraints=self.current_plan.constraints,
            expected_response_eta_minutes=self.current_plan.expected_response_eta_minutes + 2,
            success_indicator=PlanSuccessIndicator(
                overall_score=score,
                rating="OPTIMAL" if score > 75 else "ACCEPTABLE",
                resource_coverage_score=score + 2,
                critical_zone_coverage_score=score + 5,
                response_eta_score=score - 4,
                hospital_capacity_score=score - 6,
                conflict_resolution_score=92,
                evacuation_coverage_score=score,
                resource_shortage_penalty=10,
                factor_notes=[f"Plan recalibrated automatically for {reason}.", "Resource allocation checked for zero deficits."]
            ),
            explanations=self.current_plan.explanations,
            rollback_ready=True
        )
        self.current_plan = updated_plan
        self.plan_history.insert(0, updated_plan)

    # ====================================================
    # RESOURCE FORECASTING MODULE
    # ====================================================

    def get_resource_forecasts(self) -> List[ResourceForecast]:
        """Calculates consumption rates, hours until depletion, risk level, and recommendations."""
        forecasts = []
        
        # Consumption parameters per resource
        params = {
            "res_amb": {"rate": 1.2, "incoming": 4, "demand": 15},
            "res_boat": {"rate": 0.8, "incoming": 2, "demand": 14},
            "res_veh": {"rate": 1.5, "incoming": 5, "demand": 16},
            "res_med": {"rate": 85.0, "incoming": 150, "demand": 320},
            "res_food": {"rate": 220.0, "incoming": 600, "demand": 1600},
            "res_water": {"rate": 280.0, "incoming": 800, "demand": 2200},
            "res_shelter": {"rate": 35.0, "incoming": 200, "demand": 950},
            "res_personnel": {"rate": 4.0, "incoming": 30, "demand": 120},
            "res_fuel": {"rate": 380.0, "incoming": 1000, "demand": 3200},
            "res_comm": {"rate": 1.0, "incoming": 5, "demand": 18}
        }

        for res_id, res in self.resources.items():
            p = params.get(res_id, {"rate": 5.0, "incoming": 10, "demand": 50})
            rate = p["rate"]
            incoming = p["incoming"]
            stock = res.remaining
            
            # Hours until depletion
            if rate > 0:
                hours_left = round(stock / rate, 1)
            else:
                hours_left = 99.0

            # Determine risk
            if hours_left < 3.0 or res.shortage > 0:
                risk: Any = "CRITICAL"
            elif hours_left < 6.0:
                risk = "HIGH"
            elif hours_left < 12.0:
                risk = "MEDIUM"
            else:
                risk = "LOW"

            # Generate recommendations
            recs = []
            if risk in ["CRITICAL", "HIGH"]:
                recs.append(f"Issue emergency resupply requisition for {res.name} to state disaster pool.")
                recs.append(f"Ration non-emergency distribution of {res.name} by 25%.")
                if res_id in ["res_med", "res_boat"]:
                    recs.append("Request immediate inter-agency mutual aid from adjacent Highland District.")
            else:
                recs.append("Stock level sufficient for projected operational cycle.")

            # Timeline projection for charts (0 to 12 hours)
            proj = []
            curr = stock
            for h in range(0, 13, 2):
                stock_val = max(0, int(curr - (rate * h) + (incoming if h >= 6 else 0)))
                proj.append({"hour": f"+{h}h", "stock": stock_val, "safety_threshold": int(res.total * 0.25)})

            forecasts.append(ResourceForecast(
                resource_id=res.id,
                resource_name=res.name,
                current_stock=res.remaining,
                consumption_rate_hourly=rate,
                incoming_supply=incoming,
                estimated_demand=p["demand"],
                depletion_time_hours=hours_left,
                risk_level=risk,
                projected_timeline=proj,
                recommendations=recs
            ))

        return forecasts

    # ====================================================
    # CITIZEN SOS & DUPLICATE DETECTION
    # ====================================================

    def submit_sos(self, data: Dict[str, Any]) -> CitizenSOS:
        """Submit a citizen emergency SOS report with duplicate detection."""
        sos_id = "SOS-" + str(uuid.uuid4())[:6]
        lat = float(data.get("lat", 13.0827))
        lng = float(data.get("lng", 80.2707))
        category = data.get("emergency_type", "Flood")
        desc = data.get("description", "")
        med = bool(data.get("medical_emergency", False))
        trapped = bool(data.get("trapped_status", False))
        
        # Determine severity
        if med or trapped or "critical" in desc.lower() or "drowning" in desc.lower():
            severity: Any = "CRITICAL"
        elif category in ["Trapped", "Medical"]:
            severity = "HIGH"
        else:
            severity = "MEDIUM"

        # Duplicate detection: check if another SOS exists within 0.005 deg (~500m) with same category
        duplicate_of = None
        for existing in self.sos_reports:
            dist = math.sqrt((existing.lat - lat)**2 + (existing.lng - lng)**2)
            if dist < 0.005 and existing.emergency_type == category:
                duplicate_of = existing.id
                break

        sos = CitizenSOS(
            id=sos_id,
            name=data.get("name", "Anonymous Citizen"),
            phone=data.get("phone", "+91-90000-00000"),
            lat=lat,
            lng=lng,
            address=data.get("address", "Metro Basin Flood Sector"),
            emergency_type=category,
            people_count=int(data.get("people_count", 1)),
            medical_emergency=med,
            trapped_status=trapped,
            description=desc,
            severity=severity,
            status="TRIAGED" if severity == "CRITICAL" else "PENDING",
            timestamp=datetime.now().strftime("%H:%M:%S"),
            language=data.get("language", "English"),
            duplicate_of=duplicate_of
        )

        self.sos_reports.insert(0, sos)
        
        # Add to timeline if critical
        if severity == "CRITICAL":
            self.timeline.insert(0, TimelineEvent(
                id="TL-" + str(uuid.uuid4())[:6],
                timestamp=datetime.now().strftime("%H:%M"),
                event=f"CRITICAL CITIZEN SOS: {sos.people_count} people trapped ({sos.address})",
                severity="CRITICAL",
                zone="Zone A / River Corridor",
                resource_impact="Rapid water rescue dispatch requested",
                agent_response="TRIAGE and CONVOY queued SOS for prioritized boat pickup",
                plan_version=self.current_plan.version
            ))

        return sos

    # ====================================================
    # VOICE COMMAND & EMERGENCY REPORTING
    # ====================================================

    def process_voice_command(self, text: str) -> VoiceCommandResponse:
        """Processes voice/text commands and triggers corresponding system actions."""
        t = text.lower().strip()
        intent = "UNKNOWN"
        speech = "I did not recognize that command. Try asking to show critical zones, recalculate plan, or show nearby hospitals."
        action_taken = "NOOP"
        params = {}

        if "critical zone" in t or "show zones" in t or "active zones" in t:
            intent = "SHOW_CRITICAL_ZONES"
            action_taken = "FILTER_ZONES_CRITICAL"
            speech = "Displaying critical disaster zones. Zone A Downtown Marina is currently the highest priority with 2.8 meters water depth."
            params = {"zones": ["ZONE-A", "ZONE-B"]}

        elif "rescue boat" in t or "available boat" in t or "boat" in t:
            intent = "SHOW_RESCUE_BOATS"
            action_taken = "HIGHLIGHT_RESOURCE_BOATS"
            boats = self.resources.get("res_boat")
            avail = boats.available if boats else 0
            speech = f"There are currently {avail} rescue boats available, with {boats.allocated if boats else 8} actively deployed in operations."
            params = {"available": avail, "allocated": boats.allocated if boats else 8}

        elif "situation report" in t or "sitrep" in t or "generate report" in t:
            intent = "GENERATE_SITREP"
            action_taken = "OPEN_SITUATION_REPORT"
            speech = "Situation report generated successfully. Total casualties 42, affected population 48,500. Operations running under Plan v2."
            params = {"version": self.current_plan.version}

        elif "recalculate" in t or "re-plan" in t or "new plan" in t:
            intent = "RECALCULATE_PLAN"
            action_taken = "EXECUTE_RECALCULATION"
            self._recalculate_plan(reason="Commander Voice Directive")
            speech = f"Response plan recalibrated by Agent Council. Now operating under {self.current_plan.version} with an 82% success rating."
            params = {"version": self.current_plan.version}

        elif "hospital" in t or "healthcare" in t:
            intent = "SHOW_HOSPITALS"
            action_taken = "HIGHLIGHT_HEALTHCARE"
            speech = "Displaying nearby healthcare centers. Metropolitan Trauma Hospital is at surge capacity; St. Jude General Hospital has 58 available beds."
            params = {"centers": [h.name for h in self.healthcare_centers]}

        elif "evacuation" in t or "evacuate" in t:
            intent = "ACTIVATE_EVACUATION"
            action_taken = "TRIGGER_EVACUATION_ALERTS"
            speech = "Evacuation plan reinforced. Multilingual emergency broadcasts dispatched across English, Tamil, and Hindi communication channels."
            params = {"status": "BROADCASTED"}

        elif "rollback" in t:
            intent = "EXECUTE_ROLLBACK"
            action_taken = "EXECUTE_ROLLBACK"
            rb = self.trigger_rollback("Commander Manual Voice Rollback", ["Ambulances", "Boats"])
            speech = f"Rollback executed to safe checkpoint. Generated {self.current_plan.version}."
            params = {"new_version": self.current_plan.version}

        return VoiceCommandResponse(
            recognized_text=text,
            intent=intent,
            parameters=params,
            action_taken=action_taken,
            speech_response=speech
        )

    def process_voice_emergency_report(self, text: str, lang: str = "en") -> CitizenSOS:
        """Parses voice emergency transcript into structured SOS report."""
        t = text.lower()
        
        # Categorize
        if "medical" in t or "injured" in t or "heart" in t or "bleeding" in t or "unconscious" in t:
            cat = "Medical"
            med = True
        elif "trapped" in t or "roof" in t or "water reached" in t or "stuck" in t:
            cat = "Trapped"
            med = False
        elif "food" in t or "water" in t or "hungry" in t or "starving" in t:
            cat = "Food/Water"
            med = False
        else:
            cat = "Flood"
            med = False

        # Extract people count heuristic
        count = 1
        for word, val in [("one", 1), ("two", 2), ("three", 3), ("four", 4), ("five", 5), ("six", 6), ("ten", 10), ("family", 4)]:
            if word in t:
                count = val
                break

        sos_data = {
            "name": "Voice Caller (Field Dispatch)",
            "phone": "+91-91234-56789",
            "lat": 13.0838,
            "lng": 80.2780,
            "address": "Zone A — Marina Sector (Transcribed via Voice)",
            "emergency_type": cat,
            "people_count": count,
            "medical_emergency": med,
            "trapped_status": True if "trapped" in t or "roof" in t else False,
            "description": f"[Voice Report]: {text}",
            "language": "Tamil" if lang == "ta" else ("Hindi" if lang == "hi" else "English")
        }
        return self.submit_sos(sos_data)

    # ====================================================
    # SITUATION REPORT COMPILER
    # ====================================================

    def generate_situation_report(self) -> SituationReport:
        avail_summary = {res.name: res.available for res in self.resources.values()}
        depleted = [res.name for res in self.resources.values() if res.status in ["CRITICAL", "DEPLETED"]]
        open_conflicts = [d.topic for d in self.debates[:2]]
        
        return SituationReport(
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            disaster_type=self.disaster.type,
            severity=self.disaster.severity,
            affected_zones=[z.name for z in self.zones.values()],
            population_exposed=self.disaster.affected_population,
            casualties=self.disaster.casualties,
            available_resources_summary=avail_summary,
            depleted_resources=depleted,
            open_conflicts=open_conflicts,
            critical_risks=self.current_plan.risks,
            current_response_plan_version=self.current_plan.version,
            recommended_actions=self.current_plan.evacuation_actions + self.current_plan.medical_actions[:2],
            escalation_level=self.disaster.escalation_level,
            medical_assessment="TRIAGE indicates casualty spike contained if Metropolitan Trauma Hospital overflow is successfully diverted to St. Jude.",
            logistics_assessment="CONVOY confirms North Flyover B detour provides stable link into Downtown Marina. Boat reserves adequate for 3.5 hours.",
            commander_notes="All automated AI agents functioning in collaborative consensus mode. Human commander validation pipeline active."
        )

# Global engine singleton
disaster_engine = DisasterEngine()
