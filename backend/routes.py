from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from engine import disaster_engine
from models import (
    DisasterState, ZoneData, ResourceItem, ResourceForecast,
    IncidentEvent, CitizenSOS, HealthcareCenter, ResponsePlan,
    AgentDebate, TimelineEvent, SituationReport, VoiceCommandRequest,
    VoiceCommandResponse, VoiceEmergencyReportRequest, AgentInfo
)

router = APIRouter(prefix="/api")

class EventInjectionRequest(BaseModel):
    event_type: str  # "ROAD_COLLAPSE", "CASUALTY_SPIKE", "FLOOD_SURGE", "HOSPITAL_OVERLOAD", "RESOURCE_SHORTAGE"

class PlanDecisionAction(BaseModel):
    commander_name: Optional[str] = "COMMANDER-IN-CHIEF"
    notes: Optional[str] = None
    modifications: Optional[Dict[str, Any]] = None

class RollbackRequest(BaseModel):
    trigger_reason: str
    affected_resources: List[str] = ["Ambulances", "Boats"]

@router.get("/disaster")
def get_disaster() -> DisasterState:
    return disaster_engine.disaster

@router.get("/zones")
def get_zones() -> List[ZoneData]:
    return list(disaster_engine.zones.values())

@router.get("/resources")
def get_resources() -> List[ResourceItem]:
    return list(disaster_engine.resources.values())

@router.get("/resources/forecast")
def get_resource_forecast() -> List[ResourceForecast]:
    return disaster_engine.get_resource_forecasts()

@router.get("/agents")
def get_agents() -> List[AgentInfo]:
    return list(disaster_engine.agents.values())

@router.post("/agents/run")
def run_agents() -> Dict[str, Any]:
    """Trigger agent council analysis and recommendation sync."""
    disaster_engine._recalculate_plan(reason="Commander Manual Agent Run Trigger")
    return {
        "status": "SUCCESS",
        "message": "Agent Council evaluated current state and refreshed tactical directives.",
        "plan_version": disaster_engine.current_plan.version
    }

@router.get("/debates")
def get_debates() -> List[AgentDebate]:
    return disaster_engine.debates

@router.get("/response-plan")
def get_response_plan() -> ResponsePlan:
    return disaster_engine.current_plan

@router.get("/response-plan/history")
def get_plan_history() -> List[ResponsePlan]:
    return disaster_engine.plan_history

@router.post("/response-plan/recalculate")
def recalculate_response_plan() -> ResponsePlan:
    disaster_engine._recalculate_plan(reason="Human Commander Recalculate Directive")
    return disaster_engine.current_plan

@router.post("/response-plan/approve")
def approve_response_plan(action: PlanDecisionAction) -> Dict[str, Any]:
    disaster_engine.current_plan.status = "APPROVED"
    return {
        "status": "APPROVED",
        "plan_version": disaster_engine.current_plan.version,
        "commander": action.commander_name,
        "notes": action.notes or "Response plan approved for live simulation execution."
    }

@router.post("/response-plan/reject")
def reject_response_plan(action: PlanDecisionAction) -> Dict[str, Any]:
    disaster_engine.current_plan.status = "REJECTED"
    # Auto re-calculate under revised constraints
    disaster_engine._recalculate_plan(reason=f"Rejected by Commander: {action.notes or 'Strategic Re-evaluation'}")
    return {
        "status": "REJECTED_AND_RECALIBRATED",
        "previous_plan_status": "REJECTED",
        "new_plan_version": disaster_engine.current_plan.version,
        "reason": action.notes
    }

@router.post("/plan/rollback")
def execute_rollback(req: RollbackRequest) -> Dict[str, Any]:
    record = disaster_engine.trigger_rollback(req.trigger_reason, req.affected_resources)
    return {
        "status": "ROLLED_BACK",
        "record": record.model_dump(),
        "active_plan": disaster_engine.current_plan.model_dump()
    }

@router.post("/events")
def inject_event(req: EventInjectionRequest) -> Dict[str, Any]:
    result = disaster_engine.inject_event(req.event_type)
    return result

@router.get("/timeline")
def get_timeline() -> List[TimelineEvent]:
    return disaster_engine.timeline

@router.get("/sos")
def get_sos() -> List[CitizenSOS]:
    return disaster_engine.sos_reports

@router.post("/sos")
def submit_sos(req: Dict[str, Any]) -> CitizenSOS:
    return disaster_engine.submit_sos(req)

@router.get("/healthcare")
def get_healthcare() -> List[HealthcareCenter]:
    return disaster_engine.healthcare_centers

@router.post("/voice/command")
def process_voice_command(req: VoiceCommandRequest) -> VoiceCommandResponse:
    return disaster_engine.process_voice_command(req.audio_text)

@router.post("/voice/report")
def process_voice_report(req: VoiceEmergencyReportRequest) -> CitizenSOS:
    return disaster_engine.process_voice_emergency_report(req.voice_text, req.language)

@router.get("/situation-report")
def get_situation_report() -> SituationReport:
    return disaster_engine.generate_situation_report()

@router.post("/reset")
def reset_simulation() -> Dict[str, str]:
    disaster_engine.reset_to_default_scenario()
    return {"status": "SUCCESS", "message": "Simulation reset to default Riverine Flood Disaster scenario."}
