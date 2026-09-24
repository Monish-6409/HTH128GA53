import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Activity, Mic, Play, RefreshCw, FileText, 
  Radio, Volume2, Sparkles, CheckCircle2
} from "lucide-react";
import { DisasterState, AgentInfo } from "../types";

interface NavbarProps {
  disaster: DisasterState | null;
  agents: AgentInfo[];
  onOpenVoiceModal: () => void;
  onOpenSitrepModal: () => void;
  onOpenDemoModal: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  disaster,
  agents,
  onOpenVoiceModal,
  onOpenSitrepModal,
  onOpenDemoModal,
  onReset
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 px-4 py-2.5 sticky top-0 z-40 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1920px] mx-auto">
        
        {/* Brand & Incident Info */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 shadow-red-950 shadow-md">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
                ResQ<span className="text-cyan-400">AI</span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  Command Ops v2.4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-red-400 font-medium font-mono">{disaster?.title || "Disaster Event"}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono text-[11px]">UTC: {currentTime}</span>
            </p>
          </div>
        </div>

        {/* Live Agents Status Strip */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400 font-mono font-semibold text-[11px] uppercase mr-1">Agents:</span>
          {agents.map((agent) => {
            const isAnalyzing = agent.status === "ANALYZING" || agent.status === "DEBATING";
            return (
              <div 
                key={agent.name}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700/60"
                title={`${agent.name} (${agent.role}) - ${agent.status}`}
              >
                <span className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                <span className="font-mono font-bold text-[11px] text-slate-200">{agent.name}</span>
              </div>
            );
          })}
        </div>

        {/* Action Controls & Demo Launcher */}
        <div className="flex items-center gap-2">
          {/* Hackathon Demo Walkthrough */}
          <button
            onClick={onOpenDemoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold shadow-md transition-all border border-amber-400/40 glow-amber"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo</span>
          </button>

          {/* Voice Command Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-cyan-800/40 transition-colors shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Voice Control</span>
          </button>

          {/* Situation Report */}
          <button
            onClick={onOpenSitrepModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">SitRep</span>
          </button>

          {/* Reset Scenario */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors"
            title="Reset Simulation Scenario"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
};
