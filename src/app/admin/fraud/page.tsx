"use client";
import { fraudAlerts } from "@/data/mockData";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

export default function FraudPage() {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    confirmed: { color: "bg-red-500/15 text-red-400", icon: <ShieldAlert className="w-4 h-4" />, label: "Confirmed Fraud" },
    investigating: { color: "bg-amber-500/15 text-amber-400", icon: <ShieldQuestion className="w-4 h-4" />, label: "Investigating" },
    cleared: { color: "bg-emerald-500/15 text-emerald-400", icon: <ShieldCheck className="w-4 h-4" />, label: "Cleared" },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const riskGradient = (score: number) => {
    if (score >= 80) return "from-red-500 to-red-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    return "from-emerald-500 to-emerald-600";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Fraud Detection</h2>
        <p className="text-sm text-gray-400 mt-1">5-layer AI-powered fraud prevention system</p>
      </div>

      {/* Detection Layers */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { layer: "L1", name: "GPS Validation", desc: "Geofence + movement" },
          { layer: "L2", name: "Platform Cross-check", desc: "Order count verify" },
          { layer: "L3", name: "Claim Frequency", desc: "Isolation Forest" },
          { layer: "L4", name: "Time Anomaly", desc: "Z-score analysis" },
          { layer: "L5", name: "Network Clustering", desc: "Fraud ring detection" },
        ].map((l) => (
          <div key={l.layer} className="glass-card p-4 text-center">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-xs font-bold text-white bg-indigo-500/20 border border-indigo-500/30">
              {l.layer}
            </div>
            <p className="text-xs font-semibold text-white">{l.name}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{l.desc}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {fraudAlerts.map((alert, i) => (
          <div key={alert.id} className="glass-card p-6"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Risk Score Circle */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#1f2937" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none"
                      stroke={alert.riskScore >= 80 ? "#ef4444" : alert.riskScore >= 50 ? "#f59e0b" : "#22c55e"}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${(alert.riskScore / 100) * 175.9} 175.9`} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                    {alert.riskScore}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white">{alert.type}</h3>
                    <span className={`status-badge flex items-center gap-1.5 ${statusConfig[alert.status].color}`}>
                      {statusConfig[alert.status].icon}
                      {statusConfig[alert.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.workerName} · {alert.detectionLayer}</p>
                  <p className="text-sm text-gray-500 mt-2 max-w-2xl">{alert.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-all">
                  View Worker
                </button>
                {alert.status === "investigating" && (
                  <button className="px-4 py-2 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">
                    Confirm Fraud
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
