import {
  DisasterState, ZoneData, ResourceItem, ResourceForecast,
  HealthcareCenter, ResponsePlan, AgentDebate, TimelineEvent,
  CitizenSOS, SituationReport, AgentInfo, VoiceCommandResponse
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
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
    if (fallbackData !== undefined) {
      console.warn(`[API Fallback] Falling back for ${url}:`, err);
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  getDisaster: () => fetchWithFallback<DisasterState>("/disaster"),
  getZones: () => fetchWithFallback<ZoneData[]>("/zones"),
  getResources: () => fetchWithFallback<ResourceItem[]>("/resources"),
  getForecasts: () => fetchWithFallback<ResourceForecast[]>("/resources/forecast"),
  getAgents: () => fetchWithFallback<AgentInfo[]>("/agents"),
  getDebates: () => fetchWithFallback<AgentDebate[]>("/debates"),
  getResponsePlan: () => fetchWithFallback<ResponsePlan>("/response-plan"),
  getTimeline: () => fetchWithFallback<TimelineEvent[]>("/timeline"),
  getSOSReports: () => fetchWithFallback<CitizenSOS[]>("/sos"),
  getHealthcare: () => fetchWithFallback<HealthcareCenter[]>("/healthcare"),
  getSituationReport: () => fetchWithFallback<SituationReport>("/situation-report"),

  // Actions
  injectEvent: (eventType: string) =>
    fetchWithFallback<any>("/events", {
      method: "POST",
      body: JSON.stringify({ event_type: eventType })
    }),

  runAgents: () =>
    fetchWithFallback<any>("/agents/run", {
      method: "POST"
    }),

  recalculatePlan: () =>
    fetchWithFallback<ResponsePlan>("/response-plan/recalculate", {
      method: "POST"
    }),

  approvePlan: (commander: string, notes?: string) =>
    fetchWithFallback<any>("/response-plan/approve", {
      method: "POST",
      body: JSON.stringify({ commander_name: commander, notes })
    }),

  rejectPlan: (commander: string, notes?: string) =>
    fetchWithFallback<any>("/response-plan/reject", {
      method: "POST",
      body: JSON.stringify({ commander_name: commander, notes })
    }),

  executeRollback: (triggerReason: string, affectedResources: string[]) =>
    fetchWithFallback<any>("/plan/rollback", {
      method: "POST",
      body: JSON.stringify({ trigger_reason: triggerReason, affected_resources: affectedResources })
    }),

  submitSOS: (data: Partial<CitizenSOS>) =>
    fetchWithFallback<CitizenSOS>("/sos", {
      method: "POST",
      body: JSON.stringify(data)
    }),

  sendVoiceCommand: (text: string) =>
    fetchWithFallback<VoiceCommandResponse>("/voice/command", {
      method: "POST",
      body: JSON.stringify({ audio_text: text })
    }),

  sendVoiceReport: (text: string, language: string = "en") =>
    fetchWithFallback<CitizenSOS>("/voice/report", {
      method: "POST",
      body: JSON.stringify({ voice_text: text, language })
    }),

  resetScenario: () =>
    fetchWithFallback<any>("/reset", {
      method: "POST"
    })
};
