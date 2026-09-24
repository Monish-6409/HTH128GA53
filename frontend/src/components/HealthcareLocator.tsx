import React from "react";
import { 
  Building2, HeartPulse, Bed, Navigation, Phone, 
  CheckCircle2, AlertTriangle, ShieldAlert 
} from "lucide-react";
import { HealthcareCenter } from "../types";

interface HealthcareProps {
  centers: HealthcareCenter[];
}

export const HealthcareLocator: React.FC<HealthcareProps> = ({ centers }) => {
  const getCapacityBadge = (status: HealthcareCenter["emergency_capacity_status"]) => {
    switch (status) {
      case "OVERFLOW": return "bg-red-950 text-red-400 border-red-800 animate-pulse";
      case "SURGE": return "bg-amber-950 text-amber-400 border-amber-800";
      case "NEAR_CAPACITY": return "bg-yellow-950 text-yellow-300 border-yellow-700";
      default: return "bg-emerald-950 text-emerald-400 border-emerald-800";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-950/80 border border-blue-500/40 text-blue-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-100 uppercase tracking-wide">
              Healthcare Locator & Triage Capacity Feed
            </h3>
            <p className="text-[11px] text-slate-400">
              Live bed matrix integrated into TRIAGE agent's real-time patient routing algorithms.
            </p>
          </div>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {centers.map((hosp) => (
          <div 
            key={hosp.id}
            className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 transition-colors text-xs font-mono"
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <span className="font-bold text-slate-200 line-clamp-1">{hosp.name}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${getCapacityBadge(hosp.emergency_capacity_status)}`}>
                {hosp.emergency_capacity_status}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 mb-2 font-sans">
              {hosp.type} &bull; <strong className="text-cyan-400 font-mono">{hosp.distance_km}km</strong> ({hosp.eta_minutes}m ETA)
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-2 rounded border border-slate-800/80 text-[11px] mb-2">
              <div>
                <span className="text-slate-500 text-[10px] block">Avail Beds:</span>
                <span className={`font-bold ${hosp.available_beds < 10 ? "text-red-400" : "text-emerald-400"}`}>
                  {hosp.available_beds} / {hosp.total_beds}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">ICU Beds:</span>
                <span className={`font-bold ${hosp.icu_beds_available < 3 ? "text-red-400" : "text-cyan-400"}`}>
                  {hosp.icu_beds_available} Avail
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                {hosp.phone}
              </span>
              <span className={hosp.accepting_critical ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {hosp.accepting_critical ? "ACCEPTING" : "DIVERTED"}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
