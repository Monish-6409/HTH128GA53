import React, { useState } from "react";
import { 
  CheckCircle2, XCircle, RotateCcw, HelpCircle, AlertTriangle, 
  Clock, Shield, ArrowRight, Activity, ChevronDown, ChevronUp, Edit3, Sparkles
} from "lucide-react";
import { ResponsePlan, PlanDecisionExplanation } from "../types";

interface ResponsePlanProps {
  plan: ResponsePlan | null;
  onApprove: (notes?: string) => void;
  onReject: (notes?: string) => void;
  onRecalculate: () => void;
  onRollback: (reason: string) => void;
  isProcessing: boolean;
}

export const ResponsePlanAndExplainer: React.FC<ResponsePlanProps> = ({
  plan,
  onApprove,
  onReject,
  onRecalculate,
  onRollback,
  isProcessing
}) => {
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyNotes, setModifyNotes] = useState("");
  const [expandedExplanationIdx, setExpandedExplanationIdx] = useState<number | null>(0);

  if (!plan) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto text-slate-600 animate-spin mb-2" />
        Generating Response Plan...
      </div>
    );
  }

  const indicator = plan.success_indicator;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
      
      {/* Plan Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-cyan-950 text-cyan-300 border border-cyan-800">
              {plan.version}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
              plan.status === "APPROVED" 
                ? "bg-emerald-950 text-emerald-300 border-emerald-800" 
                : plan.status === "REJECTED"
                ? "bg-red-950 text-red-300 border-red-800"
                : "bg-amber-950 text-amber-300 border-amber-800"
            }`}>
              STATUS: {plan.status}
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              ETA: <strong className="text-slate-200">{plan.expected_response_eta_minutes} mins</strong>
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-100 mt-1">{plan.title}</h3>
        </div>

        {/* Human Commander Decision Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onApprove("Commander verified resource allocations.")}
            disabled={isProcessing || plan.status === "APPROVED"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve Plan</span>
          </button>

          <button
            onClick={() => setShowModifyModal(true)}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-40"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Modify</span>
          </button>

          <button
            onClick={() => onReject("Commander requested strategic re-triage.")}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-medium border border-red-900/40 transition-colors disabled:opacity-40"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            onClick={onRecalculate}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-medium border border-cyan-800/60 transition-colors disabled:opacity-40"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Plan Success Indicator Widget */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-cyan-500/40 bg-cyan-950/30 text-cyan-300 font-mono font-black text-sm">
              {indicator.overall_score}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200 uppercase">
                  Plan Success Indicator
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {indicator.rating}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Simulated decision-support metric &bull; Evaluates 7 operational dimensions
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 italic max-w-xs text-right">
            *Simulated decision-support score, NOT a guarantee of physical disaster outcomes.
          </span>
        </div>

        {/* Contributing Factors Bar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Resource Cov.</span>
            <div className="text-cyan-400 font-bold text-xs">{indicator.resource_coverage_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Critical Zone</span>
            <div className="text-emerald-400 font-bold text-xs">{indicator.critical_zone_coverage_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Response ETA</span>
            <div className="text-amber-400 font-bold text-xs">{indicator.response_eta_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Hospital Cap.</span>
            <div className="text-indigo-400 font-bold text-xs">{indicator.hospital_capacity_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Conflict Res.</span>
            <div className="text-purple-400 font-bold text-xs">{indicator.conflict_resolution_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Evac. Coverage</span>
            <div className="text-blue-400 font-bold text-xs">{indicator.evacuation_coverage_score}%</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Shortage Pen.</span>
            <div className="text-red-400 font-bold text-xs">-{indicator.resource_shortage_penalty}%</div>
          </div>
        </div>
      </div>

      {/* Resource Allocations Matrix */}
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
          <span>Active Resource Allocations</span>
          <span className="text-slate-500 font-normal">{plan.allocations.length} Deployments</span>
        </h4>
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">Resource</th>
                <th className="py-2 px-3">Destination</th>
                <th className="py-2 px-3 text-center">Qty</th>
                <th className="py-2 px-3">Agent</th>
                <th className="py-2 px-3">Corridor Route</th>
                <th className="py-2 px-3 text-center">ETA</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {plan.allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-200">{alloc.resource_name}</td>
                  <td className="py-2 px-3 text-slate-300">{alloc.zone_name}</td>
                  <td className="py-2 px-3 text-center font-bold text-cyan-400">{alloc.quantity}</td>
                  <td className="py-2 px-3 text-slate-400">{alloc.agent_responsible}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans text-xs">
                    {alloc.route_id || "Direct"}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-300">{alloc.eta_minutes}m</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      alloc.status === "DELIVERED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : alloc.status === "EN_ROUTE"
                        ? "bg-blue-950 text-blue-400 border border-blue-800"
                        : alloc.status === "REVERTED"
                        ? "bg-red-950 text-red-400 border border-red-800 line-through"
                        : "bg-slate-950 text-slate-400 border border-slate-800"
                    }`}>
                      {alloc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Directives Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
          <span className="font-mono font-bold text-red-400 text-[11px] uppercase block mb-1.5">
            &bull; Medical & Triage Directives
          </span>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            {plan.medical_actions.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg">
          <span className="font-mono font-bold text-cyan-400 text-[11px] uppercase block mb-1.5">
            &bull; Evacuation & Convoy Directives
          </span>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            {plan.evacuation_actions.map((act, i) => (
              <li key={i}>{act}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* "EXPLAIN MY PLAN" SYSTEM */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 rounded bg-amber-950/80 border border-amber-600/50 text-amber-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wide">
              Explain My Plan &bull; Decision Factors & Changes
            </h4>
            <p className="text-[11px] text-slate-400">
              Clear, transparent explanations for prioritization, resource redirections & version changes.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {plan.explanations.map((exp, idx) => {
            const isExpanded = expandedExplanationIdx === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-800 rounded-md overflow-hidden bg-slate-900/60 transition-colors"
              >
                <button
                  onClick={() => setExpandedExplanationIdx(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono text-[11px]">Q{idx + 1}:</span>
                    <span>{exp.decision_topic}</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                    <p className="leading-relaxed text-slate-200">
                      {exp.explanation}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="font-mono font-semibold text-slate-400 block mb-0.5">Key Decision Drivers:</span>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {exp.key_factors.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="font-mono font-semibold text-amber-400/80 block mb-0.5">Constraint Enforced:</span>
                        <p className="text-slate-300">{exp.constraint_applied}</p>
                        <span className="font-mono font-semibold text-slate-400 block mt-1 mb-0.5">Alternatives Considered:</span>
                        <p className="text-slate-400">{exp.alternatives_considered}</p>
                      </div>
                    </div>

                    {exp.changes_from_previous && (
                      <div className="bg-cyan-950/30 border border-cyan-800/50 p-2 rounded text-[11px] text-cyan-200">
                        <strong>Delta from Previous Plan:</strong> {exp.changes_from_previous}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modify Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-4 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              Commander Plan Modification Directive
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Enter specialized operational constraints or commander preferences. ATLAS and OPTIMA will adjust allocation weights accordingly.
            </p>
            <textarea
              value={modifyNotes}
              onChange={(e) => setModifyNotes(e.target.value)}
              placeholder="e.g., Prioritize Zone B medical evacuation above all else; reserve at least 3 rescue boats for southern delta."
              className="w-full h-24 bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setShowModifyModal(false)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onApprove(modifyNotes);
                  setShowModifyModal(false);
                }}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Apply Directives & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
