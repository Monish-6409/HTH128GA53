import React from "react";
import { 
  History, AlertTriangle, Zap, ShieldAlert, ArrowRight, 
  Droplet, Truck, HeartPulse, Building2, Flame, RefreshCw
} from "lucide-react";
import { TimelineEvent, PriorityLevel } from "../types";

interface TimelineProps {
  timeline: TimelineEvent[];
  onInjectEvent: (eventType: string) => void;
  isInjecting: boolean;
}

export const DisasterTimelineAndEvents: React.FC<TimelineProps> = ({
  timeline,
  onInjectEvent,
  isInjecting
}) => {
  const getSeverityBadge = (severity: PriorityLevel) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-950 text-red-400 border-red-800";
      case "HIGH": return "bg-amber-950 text-amber-400 border-amber-800";
      case "MEDIUM": return "bg-blue-950 text-blue-300 border-blue-800";
      default: return "bg-slate-950 text-slate-400 border-slate-800";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
      
      {/* Event Injection Console */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wide">
              Real-Time Event Injection Engine
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Cascades through State &rarr; Council &rarr; Debate &rarr; Plan
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={() => onInjectEvent("ROAD_COLLAPSE")}
            disabled={isInjecting}
            className="flex items-center gap-1.5 p-2 rounded bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Triggers Structural Bridge Failure on Causeway Arterial 1 with Auto-Rollback"
          >
            <Truck className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="truncate">Road Collapse</span>
          </button>

          <button
            onClick={() => onInjectEvent("CASUALTY_SPIKE")}
            disabled={isInjecting}
            className="flex items-center gap-1.5 p-2 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Triggers Mass Casualty Inflow in Zone B (+35 casualties)"
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">Casualty Spike</span>
          </button>

          <button
            onClick={() => onInjectEvent("FLOOD_SURGE")}
            disabled={isInjecting}
            className="flex items-center gap-1.5 p-2 rounded bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 border border-blue-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Triggers Dam Sluice Release surging South Delta water level to 2.4m"
          >
            <Droplet className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">Flood Surge</span>
          </button>

          <button
            onClick={() => onInjectEvent("HOSPITAL_OVERLOAD")}
            disabled={isInjecting}
            className="flex items-center gap-1.5 p-2 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Triggers 100% ICU Bed Overload at Metropolitan Trauma Hospital"
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="truncate">Hospital Overload</span>
          </button>

          <button
            onClick={() => onInjectEvent("RESOURCE_SHORTAGE")}
            disabled={isInjecting}
            className="flex items-center gap-1.5 p-2 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Triggers Depletion of Rescue Boats & Emergency Trauma Kits"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span className="truncate">Resource Shortage</span>
          </button>
        </div>
      </div>

      {/* Disaster Timeline Stream */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase">
              Disaster Escalation Timeline ({timeline.length} Events Logged)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Real-Time Operational Chronicle</span>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {timeline.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 p-2.5 rounded-lg text-xs transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{item.timestamp}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300 font-semibold">{item.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    {item.plan_version}
                  </span>
                </div>
              </div>

              <p className="text-slate-200 font-medium leading-relaxed mb-1.5">
                {item.event}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-900 font-mono">
                <div className="text-amber-400/90">
                  <span className="text-slate-500 block text-[10px]">Impact:</span>
                  {item.resource_impact}
                </div>
                <div className="text-cyan-300/90">
                  <span className="text-slate-500 block text-[10px]">Agent Response:</span>
                  {item.agent_response}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
