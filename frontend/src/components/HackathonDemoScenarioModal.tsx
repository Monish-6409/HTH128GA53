import React, { useState } from "react";
import { 
  Sparkles, Play, SkipForward, RotateCcw, X, CheckCircle2, 
  ArrowRight, ShieldAlert, Cpu, AlertTriangle, Truck, FileText
} from "lucide-react";

interface DemoScenarioProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectEvent: (eventType: string) => void;
  onRunCouncil: () => void;
  onRecalculatePlan: () => void;
  onOpenSitrep: () => void;
  onOpenVoice: () => void;
  onReset: () => void;
}

export const HackathonDemoScenarioModal: React.FC<DemoScenarioProps> = ({
  isOpen,
  onClose,
  onInjectEvent,
  onRunCouncil,
  onRecalculatePlan,
  onOpenSitrep,
  onOpenVoice,
  onReset
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const scenarioSteps = [
    {
      step: 1,
      title: "Initialize Riverine Flood Disaster Environment",
      desc: "Extreme 180mm rainfall triggered overflow at Northern Reservoir with 35,000 cusecs surging into Metro Basin. Multiple zones impacted (Zone A Marina, Zone B Riverside, Zone C South Delta).",
      actionLabel: "Verify Scenario State",
      action: () => {}
    },
    {
      step: 2,
      title: "Agent Council Multi-Agent Assessment",
      desc: "TRIAGE analyzes 24 casualties in Zone A. CONVOY checks causeways. OPTIMA calculates resource constraints. COMMUNICATION prepares multilingual citizen advisories.",
      actionLabel: "Run Agent Council",
      action: onRunCouncil
    },
    {
      step: 3,
      title: "Contention & Resource Conflict Triggered",
      desc: "Both TRIAGE (Zone A) and CONVOY (Zone B) request the entire rescue boat fleet (14 vessels requested vs 10 deployable). Over-allocation constraint violated.",
      actionLabel: "Inspect Conflict",
      action: () => {}
    },
    {
      step: 4,
      title: "Autonomous Agent Debate Activation",
      desc: "Council opens formal debate. TRIAGE highlights hypothermia mortality risk. CONVOY defends Zone B's 18,500 exposed citizens. OPTIMA challenges fleet limits.",
      actionLabel: "View Debate Rounds",
      action: () => {}
    },
    {
      step: 5,
      title: "OPTIMA Algorithmic Resolution & Consensus",
      desc: "OPTIMA synthesizes 5-3-2 boat split: 5 boats to Marina, 3 to Westside, 2 in reserve, augmented by 6 high-clearance 4x4 trucks. 94% agent consensus reached.",
      actionLabel: "Verify Resolution",
      action: () => {}
    },
    {
      step: 6,
      title: "ATLAS Generates Initial Response Plan (Plan v1)",
      desc: "ATLAS compiles coordinated Plan v1 with priority zones, medical triage staging at North Flyover, and boat routes along Causeway Arterial 1.",
      actionLabel: "Review Plan v1",
      action: () => {}
    },
    {
      step: 7,
      title: "Plan Success Indicator: 84% Optimal Rating",
      desc: "Decision support engine scores Plan v1 across Resource Coverage (88%), Critical Zone Coverage (92%), ETA, and Hospital surge buffer.",
      actionLabel: "Inspect Success Score",
      action: () => {}
    },
    {
      step: 8,
      title: "Situation Report (SITREP) Generation",
      desc: "Comprehensive operational SitRep generated with exposed population, casualty tracking, and recommended inter-agency directives.",
      actionLabel: "Open Situation Report",
      action: onOpenSitrep
    },
    {
      step: 9,
      title: "Disaster Escalation: Inject Causeway Road Collapse",
      desc: "High water velocity washes out central pier of Causeway Arterial 1. Roadway severed! 4 Ambulances and 5 Boat trailers blocked in transit.",
      actionLabel: "Trigger Road Collapse",
      action: () => onInjectEvent("ROAD_COLLAPSE")
    },
    {
      step: 10,
      title: "Infeasibility Detected & Automatic Plan Rollback",
      desc: "Engine detects physical route severance. Allocations on Causeway are immediately invalidated. Safe rollback state restored with 0 asset losses.",
      actionLabel: "Review Rollback",
      action: () => {}
    },
    {
      step: 11,
      title: "Agent Council Re-planning & Plan v2 Published",
      desc: "CONVOY routes vehicles via elevated North Flyover B to River Boat Slipway (+7m ETA). New Plan v2 published with 81% success score.",
      actionLabel: "Inspect Plan v2",
      action: () => {}
    },
    {
      step: 12,
      title: "'Explain My Plan' Transparent Decision Factors",
      desc: "Plan Explainer clarifies: 'Why did the system rollback? Why was North Flyover B chosen over West Expressway? What changed from Plan v1?'",
      actionLabel: "View Explanations",
      action: () => {}
    },
    {
      step: 13,
      title: "Resource Depletion Forecast Recalculated",
      desc: "Burn rate on rescue boats and trauma kits shows critical depletion horizon under 2.5 hours. OPTIMA issues mutual aid resupply alert.",
      actionLabel: "Review Depletion Forecast",
      action: () => {}
    },
    {
      step: 14,
      title: "Multilingual Citizen SOS Stream Ingestion",
      desc: "Stranded residents submit voice and text beacons in English, Tamil, and Hindi. Duplicate clustering automatically merges proximity reports.",
      actionLabel: "Examine SOS Portal",
      action: () => {}
    },
    {
      step: 15,
      title: "Healthcare Locator & Hospital Surge Diversion",
      desc: "Metropolitan Trauma Hospital hits 100% ICU capacity. TRIAGE automatically routes subsequent trauma casualties to St. Jude General Hospital.",
      actionLabel: "Verify Bed Matrix",
      action: () => {}
    },
    {
      step: 16,
      title: "Voice Command Center Operations",
      desc: "Commander issues voice directives: 'Show critical zones', 'Show available rescue boats', 'Recalculate plan' with real-time synthetic feedback.",
      actionLabel: "Try Voice Assistant",
      action: onOpenVoice
    },
    {
      step: 17,
      title: "Timeline Chronology Verification",
      desc: "Complete operational chronicle verifies every event, agent debate, rollback, and plan transition in chronological order.",
      actionLabel: "Review Timeline",
      action: () => {}
    },
    {
      step: 18,
      title: "Human Commander Final Approval & Execution",
      desc: "Human Commander in control approves adaptive Plan v2 for simulated execution. Full end-to-end multi-agent orchestration validated!",
      actionLabel: "Complete Demo",
      action: onClose
    }
  ];

  const active = scenarioSteps[currentStep - 1];

  const handleNext = () => {
    active.action();
    if (currentStep < scenarioSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                Riverine Flood Disaster — Guided Demo Walkthrough
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Step {currentStep} of {scenarioSteps.length} &bull; End-to-End Hackathon Sequence
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full transition-all duration-300"
            style={{ width: `${(currentStep / scenarioSteps.length) * 100}%` }}
          />
        </div>

        {/* Step Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wide">
              Step {active.step}: {active.title}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {active.desc}
          </p>
        </div>

        {/* Navigation & Trigger Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-40"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReset();
                setCurrentStep(1);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md transition-all glow-amber"
            >
              <span>{active.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
