import React, { useState } from "react";
import { 
  Package, AlertTriangle, TrendingDown, Clock, ShieldAlert, 
  CheckCircle, ArrowUpRight, BarChart3, RefreshCw, Zap
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine 
} from "recharts";
import { ResourceItem, ResourceForecast } from "../types";

interface ResourceManagementProps {
  resources: ResourceItem[];
  forecasts: ResourceForecast[];
}

export const ResourceManagementAndForecast: React.FC<ResourceManagementProps> = ({
  resources,
  forecasts
}) => {
  const [selectedForecastId, setSelectedForecastId] = useState<string>("res_med");
  const activeForecast = forecasts.find(f => f.resource_id === selectedForecastId) || forecasts[0];

  const getStatusBadge = (status: ResourceItem["status"]) => {
    switch (status) {
      case "CRITICAL":
      case "DEPLETED":
        return "bg-red-950 text-red-400 border-red-800 animate-pulse";
      case "WARNING":
        return "bg-amber-950 text-amber-400 border-amber-800";
      case "LOW":
        return "bg-yellow-950 text-yellow-300 border-yellow-700";
      default:
        return "bg-emerald-950 text-emerald-400 border-emerald-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "text-red-400";
      case "HIGH": return "text-amber-400";
      case "MEDIUM": return "text-yellow-300";
      default: return "text-emerald-400";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
              Emergency Resource Management & Depletion Forecasting
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                10 Core Inventories
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live stock audits, non-exceedance allocation guards, and mathematical consumption horizons.
            </p>
          </div>
        </div>
      </div>

      {/* Resource Inventory Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Resource Asset</th>
              <th className="py-2 px-3 text-center">Total</th>
              <th className="py-2 px-3 text-center">Available</th>
              <th className="py-2 px-3 text-center">Allocated</th>
              <th className="py-2 px-3 text-center">In Transit</th>
              <th className="py-2 px-3 text-center">Used</th>
              <th className="py-2 px-3 text-center">Remaining</th>
              <th className="py-2 px-3 text-center">Demand</th>
              <th className="py-2 px-3 text-center">Shortage</th>
              <th className="py-2 px-3 text-right">Status Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {resources.map((res) => {
              const isSelected = selectedForecastId === res.id;
              return (
                <tr 
                  key={res.id} 
                  onClick={() => setSelectedForecastId(res.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-cyan-950/40 border-l-2 border-cyan-400" : "hover:bg-slate-800/40"
                  }`}
                >
                  <td className="py-2 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>{res.name}</span>
                    <span className="text-[10px] text-slate-500">({res.unit})</span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-300">{res.total}</td>
                  <td className="py-2 px-3 text-center font-bold text-cyan-400">{res.available}</td>
                  <td className="py-2 px-3 text-center text-amber-400">{res.allocated}</td>
                  <td className="py-2 px-3 text-center text-blue-400">{res.in_transit}</td>
                  <td className="py-2 px-3 text-center text-slate-500">{res.used}</td>
                  <td className="py-2 px-3 text-center font-bold text-slate-100">{res.remaining}</td>
                  <td className="py-2 px-3 text-center text-slate-400">{res.demand}</td>
                  <td className="py-2 px-3 text-center font-bold text-red-400">
                    {res.shortage > 0 ? `-${res.shortage}` : "0"}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resource Depletion Forecasting Panel */}
      {activeForecast && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs font-bold text-slate-200 uppercase">
                Forecast Simulation: <span className="text-cyan-300">{activeForecast.resource_name}</span>
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Burn Rate:</span>
                <span className="text-slate-200 font-bold">{activeForecast.consumption_rate_hourly}/hr</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Depletion In:</span>
                <span className={`font-bold ${getRiskColor(activeForecast.risk_level)}`}>
                  {activeForecast.depletion_time_hours} hours
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Risk Level:</span>
                <span className={`font-bold uppercase ${getRiskColor(activeForecast.risk_level)}`}>
                  {activeForecast.risk_level}
                </span>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeForecast.projected_timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} fontVariant="mono" />
                <YAxis stroke="#64748b" fontSize={10} fontVariant="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "6px", fontSize: "11px" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <ReferenceLine y={activeForecast.projected_timeline[0]?.safety_threshold || 50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Safety Threshold", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
                <Area type="monotone" dataKey="stock" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#stockGradient)" name="Projected Stock" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Actionable Resupply & Conservation Recommendations */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-mono font-bold text-amber-400 block mb-1">
              Automated OPTIMA Mitigation Recommendations:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeForecast.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5 bg-slate-900/90 p-2 rounded border border-slate-800 text-slate-300">
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
