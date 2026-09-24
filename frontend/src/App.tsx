import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, Activity, RefreshCw, Layers, CheckCircle2, 
  AlertTriangle, Radio, BarChart3, Users, FileText, Mic, 
  Map as MapIcon, HelpCircle, History, Sparkles, Droplets
} from "lucide-react";

import { 
  DisasterState, ZoneData, ResourceItem, ResourceForecast,
  HealthcareCenter, ResponsePlan, AgentDebate, TimelineEvent,
  CitizenSOS, SituationReport, AgentInfo
} from "./types";
import { api } from "./services/api";

import { Navbar } from "./components/Navbar";
import { TacticalMap } from "./components/TacticalMap";
import { AgentCouncilAndDebate } from "./components/AgentCouncilAndDebate";
import { ResponsePlanAndExplainer } from "./components/ResponsePlanAndExplainer";
import { ResourceManagementAndForecast } from "./components/ResourceManagementAndForecast";
import { DisasterTimelineAndEvents } from "./components/DisasterTimelineAndEvents";
import { CitizenSOSPortal } from "./components/CitizenSOSPortal";
import { HealthcareLocator } from "./components/HealthcareLocator";
import { VoiceCommandCenterModal } from "./components/VoiceCommandCenterModal";
import { SituationReportModal } from "./components/SituationReportModal";
import { HackathonDemoScenarioModal } from "./components/HackathonDemoScenarioModal";

export default function App() {
  // State
  const [disaster, setDisaster] = useState<DisasterState | null>(null);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [forecasts, setForecasts] = useState<ResourceForecast[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [debates, setDebates] = useState<AgentDebate[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ResponsePlan | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sosReports, setSosReports] = useState<CitizenSOS[]>([]);
  const [healthcareCenters, setHealthcareCenters] = useState<HealthcareCenter[]>([]);
  const [sitrep, setSitrep] = useState<SituationReport | null>(null);

  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [activeTab, setActiveTab] = useState<"operations" | "agents" | "resources" | "sos" | "timeline">("operations");

  // Modals & Action Loaders
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSitrepModalOpen, setIsSitrepModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const [isProcessingPlan, setIsProcessingPlan] = useState(false);
  const [isInjectingEvent, setIsInjectingEvent] = useState(false);
  const [isSyncingCouncil, setIsSyncingCouncil] = useState(false);
  const [isSubmittingSOS, setIsSubmittingSOS] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "info" | "warn" | "error" | "success" } | null>(null);

  const showToast = (text: string, type: "info" | "warn" | "error" | "success" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Master Data Refresh
  const loadAllData = useCallback(async () => {
    try {
      const [
        disasterRes, zonesRes, resourcesRes, forecastsRes,
        agentsRes, debatesRes, planRes, timelineRes,
        sosRes, healthcareRes, sitrepRes
      ] = await Promise.all([
        api.getDisaster(),
        api.getZones(),
        api.getResources(),
        api.getForecasts(),
        api.getAgents(),
        api.getDebates(),
        api.getResponsePlan(),
        api.getTimeline(),
        api.getSOSReports(),
        api.getHealthcare(),
        api.getSituationReport()
      ]);

      setDisaster(disasterRes);
      setZones(zonesRes);
      setResources(resourcesRes);
      setForecasts(forecastsRes);
      setAgents(agentsRes);
      setDebates(debatesRes);
      setCurrentPlan(planRes);
      setTimeline(timelineRes);
      setSosReports(sosRes);
      setHealthcareCenters(healthcareRes);
      setSitrep(sitrepRes);

      if (!selectedZone && zonesRes.length > 0) {
        setSelectedZone(zonesRes[0]);
      }
    } catch (err) {
      console.error("Failed to load initial disaster state:", err);
    }
  }, [selectedZone]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Actions
  const handleInjectEvent = async (eventType: string) => {
    setIsInjectingEvent(true);
    try {
      const res = await api.injectEvent(eventType);
      showToast(res.message || `Disaster event ${eventType} injected!`, "warn");
      await loadAllData();
    } catch (err) {
      showToast(`Failed to inject event: ${err}`, "error");
    } finally {
      setIsInjectingEvent(false);
    }
  };

  const handleRunCouncil = async () => {
    setIsSyncingCouncil(true);
    try {
      const res = await api.runAgents();
      showToast("Agent Council evaluated current state and refreshed directives.", "success");
      await loadAllData();
    } catch (err) {
      showToast(`Error running council: ${err}`, "error");
    } finally {
      setIsSyncingCouncil(false);
    }
  };

  const handleApprovePlan = async (notes?: string) => {
    setIsProcessingPlan(true);
    try {
      await api.approvePlan("COMMANDER", notes);
      showToast(`Response plan approved by Commander for execution.`, "success");
      await loadAllData();
    } catch (err) {
      showToast(`Failed to approve plan: ${err}`, "error");
    } finally {
      setIsProcessingPlan(false);
    }
  };

  const handleRejectPlan = async (notes?: string) => {
    setIsProcessingPlan(true);
    try {
      await api.rejectPlan("COMMANDER", notes);
      showToast(`Plan rejected by Commander. Recalibrating alternatives...`, "warn");
      await loadAllData();
    } catch (err) {
      showToast(`Failed to reject plan: ${err}`, "error");
    } finally {
      setIsProcessingPlan(false);
    }
  };

  const handleRecalculatePlan = async () => {
    setIsProcessingPlan(true);
    try {
      await api.recalculatePlan();
      showToast("Agent Council recalculated response plan.", "info");
      await loadAllData();
    } catch (err) {
      showToast(`Failed to recalculate: ${err}`, "error");
    } finally {
      setIsProcessingPlan(false);
    }
  };

  const handleRollback = async (reason: string) => {
    setIsProcessingPlan(true);
    try {
      await api.executeRollback(reason, ["Ambulances", "Boats"]);
      showToast("Rollback executed. Infeasible allocations reverted and re-planned.", "warn");
      await loadAllData();
    } catch (err) {
      showToast(`Rollback failed: ${err}`, "error");
    } finally {
      setIsProcessingPlan(false);
    }
  };

  const handleSubmitSOS = async (data: Partial<CitizenSOS>) => {
    setIsSubmittingSOS(true);
    try {
      const newSos = await api.submitSOS(data);
      if (newSos.duplicate_of) {
        showToast("SOS received: Matched existing proximity cluster and consolidated.", "info");
      } else {
        showToast("Emergency SOS beacon transmitted and queued for agent triage.", "success");
      }
      await loadAllData();
    } catch (err) {
      showToast(`Failed to submit SOS: ${err}`, "error");
    } finally {
      setIsSubmittingSOS(false);
    }
  };

  const handleVoiceReport = async (text: string, lang: string) => {
    setIsSubmittingSOS(true);
    try {
      await api.sendVoiceReport(text, lang);
      showToast("Voice emergency report parsed & dispatched to TRIAGE/CONVOY agents.", "success");
      await loadAllData();
    } catch (err) {
      showToast(`Failed to process voice report: ${err}`, "error");
    } finally {
      setIsSubmittingSOS(false);
    }
  };

  const handleVoiceCommand = async (cmd: string) => {
    try {
      const res = await api.sendVoiceCommand(cmd);
      await loadAllData();
      return res;
    } catch (err) {
      showToast(`Voice command error: ${err}`, "error");
    }
  };

  const handleReset = async () => {
    try {
      await api.resetScenario();
      showToast("Simulation reset to initial Riverine Flood Disaster scenario.", "info");
      await loadAllData();
    } catch (err) {
      showToast(`Reset failed: ${err}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className={`fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-2xl border text-xs font-mono backdrop-blur-md transition-all animate-bounce ${
          toastMessage.type === "warn"
            ? "bg-amber-950/90 text-amber-200 border-amber-600"
            : toastMessage.type === "error"
            ? "bg-red-950/90 text-red-200 border-red-600"
            : toastMessage.type === "success"
            ? "bg-emerald-950/90 text-emerald-200 border-emerald-600"
            : "bg-cyan-950/90 text-cyan-200 border-cyan-600"
        }`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Command Operations Navbar */}
      <Navbar
        disaster={disaster}
        agents={agents}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSitrepModal={() => setIsSitrepModalOpen(true)}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        onReset={handleReset}
      />

      {/* Main Operational Dashboard Content */}
      <main className="flex-1 p-3 sm:p-4 max-w-[1920px] w-full mx-auto space-y-4">
        
        {/* Top Strip: Live Disaster Overview Stats & Quick Event Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs font-mono">
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Severity Level</span>
              <span className="font-bold text-red-400 text-sm">{disaster?.severity} (Lvl {disaster?.escalation_level})</span>
            </div>
            <ShieldAlert className="w-5 h-5 text-red-500/70" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Exposed Population</span>
              <span className="font-bold text-cyan-400 text-sm">{disaster?.affected_population.toLocaleString()}</span>
            </div>
            <Users className="w-5 h-5 text-cyan-500/70" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Verified Casualties</span>
              <span className="font-bold text-amber-400 text-sm">{disaster?.casualties}</span>
            </div>
            <Activity className="w-5 h-5 text-amber-500/70" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Active Response Plan</span>
              <span className="font-bold text-purple-400 text-sm">{currentPlan?.version || "Plan v1"}</span>
            </div>
            <Layers className="w-5 h-5 text-purple-500/70" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Plan Success Rating</span>
              <span className="font-bold text-emerald-400 text-sm">{currentPlan?.success_indicator.overall_score}%</span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/70" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px] block">Pending Citizen SOS</span>
              <span className="font-bold text-rose-400 text-sm">{sosReports.length} Beacons</span>
            </div>
            <Radio className="w-5 h-5 text-rose-500/70 animate-pulse" />
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab("operations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === "operations"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Tactical Map & Operations Plan</span>
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === "agents"
                ? "bg-purple-950 text-purple-300 border border-purple-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agent Council & Debate ({debates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === "resources"
                ? "bg-amber-950 text-amber-300 border border-amber-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Resources & Depletion Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab("sos")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === "sos"
                ? "bg-red-950 text-red-300 border border-red-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Citizen SOS & Healthcare ({sosReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap ${
              activeTab === "timeline"
                ? "bg-slate-800 text-slate-200 border border-slate-700"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Escalation Timeline & Event Engine</span>
          </button>
        </div>

        {/* TAB 1: OPERATIONS (Map + Response Plan + Explainer) */}
        {activeTab === "operations" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Map Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <TacticalMap
                zones={zones}
                healthcareCenters={healthcareCenters}
                sosReports={sosReports}
                allocations={currentPlan?.allocations || []}
                selectedZone={selectedZone}
                onSelectZone={(z) => setSelectedZone(z)}
              />

              {/* Quick Incident Injection Ribbon */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Inject Disaster Incident:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleInjectEvent("ROAD_COLLAPSE")}
                    disabled={isInjectingEvent}
                    className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 text-[11px] font-mono border border-red-800 disabled:opacity-50"
                  >
                    Road Collapse (Auto-Rollback)
                  </button>
                  <button
                    onClick={() => handleInjectEvent("CASUALTY_SPIKE")}
                    disabled={isInjectingEvent}
                    className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 text-[11px] font-mono border border-amber-800 disabled:opacity-50"
                  >
                    Casualty Spike (+35)
                  </button>
                  <button
                    onClick={() => handleInjectEvent("FLOOD_SURGE")}
                    disabled={isInjectingEvent}
                    className="px-2.5 py-1 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 text-[11px] font-mono border border-blue-800 disabled:opacity-50"
                  >
                    Flood Surge (Dam Release)
                  </button>
                </div>
              </div>
            </div>

            {/* Plan & Explainer Column (5 cols) */}
            <div className="lg:col-span-5">
              <ResponsePlanAndExplainer
                plan={currentPlan}
                onApprove={handleApprovePlan}
                onReject={handleRejectPlan}
                onRecalculate={handleRecalculatePlan}
                onRollback={handleRollback}
                isProcessing={isProcessingPlan}
              />
            </div>
          </div>
        )}

        {/* TAB 2: AGENT COUNCIL & DEBATE */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <AgentCouncilAndDebate
              agents={agents}
              debates={debates}
              onTriggerCouncilSync={handleRunCouncil}
              isSyncing={isSyncingCouncil}
            />
          </div>
        )}

        {/* TAB 3: RESOURCES & FORECAST */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <ResourceManagementAndForecast
              resources={resources}
              forecasts={forecasts}
            />
          </div>
        )}

        {/* TAB 4: CITIZEN SOS & HEALTHCARE LOCATOR */}
        {activeTab === "sos" && (
          <div className="space-y-4">
            <CitizenSOSPortal
              sosReports={sosReports}
              onSubmitSOS={handleSubmitSOS}
              onVoiceReport={handleVoiceReport}
              isSubmitting={isSubmittingSOS}
            />
            <HealthcareLocator centers={healthcareCenters} />
          </div>
        )}

        {/* TAB 5: TIMELINE & EVENTS */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <DisasterTimelineAndEvents
              timeline={timeline}
              onInjectEvent={handleInjectEvent}
              isInjecting={isInjectingEvent}
            />
          </div>
        )}

      </main>

      {/* Global Modals */}
      <VoiceCommandCenterModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendCommand={handleVoiceCommand}
      />

      <SituationReportModal
        isOpen={isSitrepModalOpen}
        onClose={() => setIsSitrepModalOpen(false)}
        sitrep={sitrep}
        onRefresh={loadAllData}
        isRefreshing={false}
      />

      <HackathonDemoScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onInjectEvent={handleInjectEvent}
        onRunCouncil={handleRunCouncil}
        onRecalculatePlan={handleRecalculatePlan}
        onOpenSitrep={() => setIsSitrepModalOpen(true)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onReset={handleReset}
      />

    </div>
  );
}
