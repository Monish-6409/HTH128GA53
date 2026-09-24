import React, { useState } from "react";
import { 
  FileText, Download, Printer, RefreshCw, X, ShieldAlert, 
  CheckCircle2, AlertTriangle, Users, HeartPulse
} from "lucide-react";
import { SituationReport } from "../types";

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  sitrep: SituationReport | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const SituationReportModal: React.FC<SitrepModalProps> = ({
  isOpen,
  onClose,
  sitrep,
  onRefresh,
  isRefreshing
}) => {
  if (!isOpen || !sitrep) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const md = `# EMERGENCY SITUATION REPORT (SITREP)
**Generated:** ${sitrep.generated_at}
**Disaster Classification:** ${sitrep.disaster_type} (Severity: ${sitrep.severity})
**Escalation Level:** Level ${sitrep.escalation_level} / 5
**Active Operational Plan:** ${sitrep.current_response_plan_version}

---

## 1. CASUALTY & HUMANITARIAN IMPACT
- Total Population Exposed: ${sitrep.population_exposed.toLocaleString()}
- Verified Casualties: ${sitrep.casualties}
- Impacted Sectors: ${sitrep.affected_zones.join(", ")}

## 2. MEDICAL & LOGISTICAL ASSESSMENT
- **Medical:** ${sitrep.medical_assessment}
- **Logistics:** ${sitrep.logistics_assessment}

## 3. RESOURCE INVENTORY SNAPSHOT
${Object.entries(sitrep.available_resources_summary).map(([k, v]) => `- ${k}: ${v} units available`).join("\n")}

**Depleted / Critical Resources:**
${sitrep.depleted_resources.length > 0 ? sitrep.depleted_resources.map(r => `- [CRITICAL SHORTAGE] ${r}`).join("\n") : "- None flagged."}

## 4. AGENT ARBITRATED CONFLICTS
${sitrep.open_conflicts.map(c => `- ${c}`).join("\n")}

## 5. STRATEGIC RISKS & CONSTRAINTS
${sitrep.critical_risks.map(r => `- ${r}`).join("\n")}

## 6. RECOMMENDED COMMAND DIRECTIVES
${sitrep.recommended_actions.map(a => `- [ACT] ${a}`).join("\n")}

---
*Commander Directives: ${sitrep.commander_notes}*
`;

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SITREP_${sitrep.current_response_plan_version.replace(" ", "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-5 shadow-2xl max-h-[90vh] flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                Emergency Situation Report (SITREP)
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  {sitrep.current_response_plan_version}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Official Incident Assessment &bull; Generated: {sitrep.generated_at}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
              title="Refresh SitRep"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export MD</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable SitRep Body */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-mono">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">Disaster Type</span>
              <span className="text-slate-200 font-bold text-[11px] truncate block">{sitrep.disaster_type}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Severity / Level</span>
              <span className="text-red-400 font-bold text-[11px]">{sitrep.severity} (Lvl {sitrep.escalation_level})</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Exposed Citizens</span>
              <span className="text-cyan-400 font-bold text-[11px]">{sitrep.population_exposed.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Casualties</span>
              <span className="text-amber-400 font-bold text-[11px]">{sitrep.casualties}</span>
            </div>
          </div>

          {/* Assessments */}
          <div className="space-y-2">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-red-400 block mb-1 text-[11px]">&bull; Medical Assessment</span>
              <p className="font-sans text-slate-300 leading-relaxed">{sitrep.medical_assessment}</p>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1 text-[11px]">&bull; Logistics Assessment</span>
              <p className="font-sans text-slate-300 leading-relaxed">{sitrep.logistics_assessment}</p>
            </div>
          </div>

          {/* Resources Summary */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-300 block mb-2 text-[11px]">&bull; Available Strategic Resources</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(sitrep.available_resources_summary).map(([name, count]) => (
                <div key={name} className="bg-slate-900/90 p-1.5 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-400 truncate mr-1">{name}:</span>
                  <strong className="text-cyan-400">{count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Risks & Directives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1 text-[11px]">&bull; Priority Directives</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 font-sans">
                {sitrep.recommended_actions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-rose-400 block mb-1 text-[11px]">&bull; Critical Risks</span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 font-sans">
                {sitrep.critical_risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
