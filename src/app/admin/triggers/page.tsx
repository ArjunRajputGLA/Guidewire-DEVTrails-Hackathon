"use client";
import { triggers } from "@/data/mockData";
import { Radio } from "lucide-react";

export default function TriggersPage() {
  const statusColor = (s: string) => {
    if (s === "active") return "bg-red-500/15 text-red-400 border border-red-500/20";
    if (s === "monitoring") return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
  };

  const activeTriggers = triggers.filter(t => t.status === "active");
  const totalAffected = activeTriggers.reduce((sum, t) => sum + t.affectedWorkers, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trigger Monitoring</h2>
          <p className="text-sm text-gray-400 mt-1">Real-time parametric disruption detection</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-sm font-medium text-red-400">{activeTriggers.length} Active · {totalAffected} Workers Affected</span>
        </div>
      </div>

      {/* Trigger Cards */}
      <div className="grid grid-cols-1 gap-4">
        {triggers.map((trigger, i) => (
          <div key={trigger.id} className="glass-card p-6"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{trigger.icon}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{trigger.type}</h3>
                    <span className={`status-badge ${statusColor(trigger.status)}`}>
                      {trigger.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                      {trigger.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">📍 {trigger.location}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Threshold</p>
                      <p className="text-sm font-medium text-gray-300">{trigger.threshold}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Value</p>
                      <p className={`text-sm font-bold ${trigger.status === "active" ? "text-red-400" : trigger.status === "monitoring" ? "text-amber-400" : "text-emerald-400"}`}>
                        {trigger.currentValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Workers Affected</p>
                      <p className="text-sm font-medium text-white">{trigger.affectedWorkers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Detected At</p>
                      <p className="text-sm text-gray-400">{trigger.detectedAt}</p>
                    </div>
                  </div>
                </div>
              </div>
              {trigger.status === "active" && (
                <button className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-all">
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
