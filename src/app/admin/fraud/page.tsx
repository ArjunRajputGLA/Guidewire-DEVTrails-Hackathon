"use client";
import { fraudAlerts } from "@/data/mockData";
import { ShieldAlert, ShieldCheck, ShieldQuestion, Cpu } from "lucide-react";

export default function FraudPage() {
  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    confirmed: {
      color: "text-red-400",
      bg: "bg-red-500/10 border border-red-500/20",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      label: "Confirmed Fraud",
    },
    investigating: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border border-amber-500/20",
      icon: <ShieldQuestion className="w-3.5 h-3.5" />,
      label: "Investigating",
    },
    cleared: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border border-emerald-500/20",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      label: "Cleared",
    },
  };

  const detectionLayers = [
    { layer: "L1", name: "GPS Validation", desc: "Geofence + movement", color: "#6366f1" },
    { layer: "L2", name: "Platform Cross-check", desc: "Order count verify", color: "#8b5cf6" },
    { layer: "L3", name: "Claim Frequency", desc: "Isolation Forest", color: "#a855f7" },
    { layer: "L4", name: "Time Anomaly", desc: "Z-score analysis", color: "#d946ef" },
    { layer: "L5", name: "Network Clustering", desc: "Fraud ring detection", color: "#ec4899" },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return { stroke: "#ef4444", glow: "rgba(239,68,68,0.3)", text: "text-red-400", label: "HIGH" };
    if (score >= 50) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.3)", text: "text-amber-400", label: "MED" };
    return { stroke: "#22c55e", glow: "rgba(34,197,94,0.3)", text: "text-emerald-400", label: "LOW" };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Fraud Detection</h2>
        </div>
        <p className="text-sm text-gray-500 ml-11">5-layer AI-powered fraud prevention system</p>
      </div>

      {/* Detection Layers */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {detectionLayers.map((l, i) => (
          <div
            key={l.layer}
            className="relative group rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 text-center hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Connector line between layers */}
            {i < detectionLayers.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-gradient-to-r from-white/10 to-transparent hidden md:block" />
            )}
            <div
              className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center text-xs font-bold text-white border"
              style={{ background: `${l.color}20`, borderColor: `${l.color}35`, color: l.color }}
            >
              {l.layer}
            </div>
            <div
              className="w-1 h-1 rounded-full mx-auto mb-2 animate-pulse"
              style={{ backgroundColor: l.color }}
            />
            <p className="text-xs font-semibold text-white leading-tight">{l.name}</p>
            <p className="text-[10px] text-gray-600 mt-1">{l.desc}</p>
          </div>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {fraudAlerts.map((alert, i) => {
          const risk = getRiskColor(alert.riskScore);
          const cfg = statusConfig[alert.status];
          const circumference = 2 * Math.PI * 26;
          const strokeDash = (alert.riskScore / 100) * circumference;

          return (
            <div
              key={alert.id}
              className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 overflow-hidden"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Top gradient accent */}
              {alert.status === "confirmed" && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
              )}
              {alert.status === "investigating" && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    {/* Risk Score Ring */}
                    <div className="relative flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#ffffff0a" strokeWidth="5" />
                        <circle
                          cx="32" cy="32" r="26" fill="none"
                          stroke={risk.stroke}
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={`${strokeDash} ${circumference}`}
                          style={{ filter: `drop-shadow(0 0 6px ${risk.glow})` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-base font-bold tabular-nums leading-none ${risk.text}`}>
                          {alert.riskScore}
                        </span>
                        <span className={`text-[8px] font-bold ${risk.text} opacity-70`}>{risk.label}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1.5">
                        <h3 className="text-base font-semibold text-white">{alert.type}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="text-gray-400 font-medium">{alert.workerName}</span>
                        {" · "}
                        <span className="text-xs bg-white/5 px-2 py-0.5 rounded-md border border-white/8 font-mono">
                          {alert.detectionLayer}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{alert.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/8 hover:text-white border border-white/8 hover:border-white/15 transition-all duration-200">
                      View Worker
                    </button>
                    {alert.status === "investigating" && (
                      <button className="px-3 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 transition-all duration-200">
                        Confirm Fraud
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}