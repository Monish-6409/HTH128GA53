import React, { useState } from "react";
import { 
  Users, MessageSquare, AlertCircle, CheckCircle, 
  Scale, Shield, Bot, ArrowRight, Zap, RefreshCw, Cpu
} from "lucide-react";
import { AgentInfo, AgentDebate, DebateStatement } from "../types";

interface AgentCouncilProps {
  agents: AgentInfo[];
  debates: AgentDebate[];
  onTriggerCouncilSync: () => void;
  isSyncing: boolean;
}

export const AgentCouncilAndDebate: React.FC<AgentCouncilProps> = ({
  agents,
  debates,
  onTriggerCouncilSync,
  isSyncing
}) => {
  const [selectedDebateIndex, setSelectedDebateIndex] = useState<number>(0);
  const activeDebate = debates[selectedDebateIndex] || debates[0];

  const getAgentColor = (name: string) => {
    switch (name) {
      case "ATLAS": return "border-purple-500/50 text-purple-400 bg-purple-950/20";
      case "TRIAGE": return "border-red-500/50 text-red-400 bg-red-950/20";
      case "CONVOY": return "border-amber-500/50 text-amber-400 bg-amber-950/20";
      case "OPTIMA": return "border-cyan-500/50 text-cyan-400 bg-cyan-950/20";
      case "COMMUNICATION": return "border-emerald-500/50 text-emerald-400 bg-emerald-950/20";
      default: return "border-slate-700 text-slate-300 bg-slate-900";
    }
  };

  const getStatementTypeBadge = (type: DebateStatement["statement_type"]) => {
    switch (type) {
      case "PROPOSAL": return "bg-blue-950 text-blue-400 border-blue-800";
      case "CHALLENGE": return "bg-amber-950 text-amber-400 border-amber-800";
      case "VALIDATION": return "bg-indigo-950 text-indigo-400 border-indigo-800";
      case "SYNTHESIS": return "bg-cyan-950 text-cyan-300 border-cyan-700";
      case "CONSENSUS": return "bg-emerald-950 text-emerald-300 border-emerald-700";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
              Autonomous Agent Council & Debate Chamber
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                Multi-Agent Orchestration
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              5 specialized agents debating operational trade-offs, enforcing constraints & reaching mathematical consensus.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerCouncilSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold border border-purple-700/50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Evaluating Council..." : "Run Agent Council"}</span>
        </button>
      </div>

      {/* Agents Roster Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
        {agents.map((agent) => (
          <div 
            key={agent.name}
            className={`p-2.5 rounded-lg border ${getAgentColor(agent.name)} transition-all`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-xs">{agent.name}</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-700/60">
                {(agent.confidence * 100).toFixed(0)}% Conf
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-300 line-clamp-1">{agent.role}</div>
            <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{agent.description}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {agent.specialties.slice(0, 2).map((s, idx) => (
                <span key={idx} className="text-[9px] px-1 py-0.2 rounded bg-slate-950/60 text-slate-400">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Active Debate Viewer */}
      {activeDebate && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-4">
          {/* Debate Switcher if multiple */}
          {debates.length > 1 && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Debate Sessions:</span>
              {debates.map((d, index) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDebateIndex(index)}
                  className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors border ${
                    index === selectedDebateIndex
                      ? "bg-purple-950 text-purple-300 border-purple-700"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  {d.topic.length > 40 ? d.topic.slice(0, 40) + "..." : d.topic}
                </button>
              ))}
            </div>
          )}

          {/* Conflict Alert Banner */}
          <div className="bg-red-950/30 border border-red-800/60 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wide">
                    Conflict Detected:
                  </span>
                  <span className="font-mono text-xs text-slate-300">{activeDebate.resource_at_stake}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeDebate.conflict_detected}
                </p>
              </div>
            </div>
          </div>

          {/* Structured Debate Rounds */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800/80 pb-1">
              <span>DEBATE EXCHANGE & CONSTRAINT VERIFICATION</span>
              <span>Consensus: {(activeDebate.consensus_score * 100).toFixed(0)}%</span>
            </div>

            {activeDebate.rounds.map((round, idx) => (
              <div 
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-md p-3 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getAgentColor(round.agent_name)}`}>
                      {round.agent_name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getStatementTypeBadge(round.statement_type)}`}>
                      Round {round.round_number}: {round.statement_type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: {(round.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Concise Argument (No hidden CoT) */}
                <p className="text-xs text-slate-200 leading-relaxed mb-2.5">
                  {round.content}
                </p>

                {/* Concise Decision Factors / Evidence & Constraints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                    <span className="font-mono font-semibold text-slate-400 block mb-1">Key Evidence / Factors:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {round.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                    <span className="font-mono font-semibold text-amber-400/90 block mb-1">Constraints Evaluated:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {round.constraints_noted.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Resolution & OPTIMA Verdict */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-md p-3.5">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Consensus Resolution Directives:
                  </h4>
                  <span className="text-emerald-400 font-mono text-xs font-semibold">
                    Score: {(activeDebate.consensus_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {activeDebate.resolution_summary}
                </p>

                {/* Final Allocation matrix */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(activeDebate.final_allocation).map(([zone, resMap]) => (
                    <div key={zone} className="bg-slate-900/90 border border-emerald-900/50 p-2 rounded">
                      <span className="font-mono font-semibold text-cyan-300 text-[11px] block">{zone}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(resMap).map(([res, qty]) => (
                          <span key={res} className="font-mono text-[11px] text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {res}: <strong className="text-emerald-400">{qty}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
