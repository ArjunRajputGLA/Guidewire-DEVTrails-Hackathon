"use client";
import { claims } from "@/data/mockData";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ClaimsPage() {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    "paid": { color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Paid" },
    "auto-approved": { color: "bg-blue-500/15 text-blue-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Auto-Approved" },
    "pending-review": { color: "bg-amber-500/15 text-amber-400", icon: <Clock className="w-3.5 h-3.5" />, label: "Pending Review" },
    "rejected": { color: "bg-red-500/15 text-red-400", icon: <XCircle className="w-3.5 h-3.5" />, label: "Rejected" },
  };

  const fraudScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400";
    if (score < 60) return "text-amber-400";
    return "text-red-400";
  };

  const stats = [
    { label: "Total Claims", value: claims.length, icon: <AlertCircle className="w-5 h-5 text-indigo-400" /> },
    { label: "Paid Out", value: claims.filter(c => c.status === "paid").length, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
    { label: "Pending", value: claims.filter(c => c.status === "pending-review").length, icon: <Clock className="w-5 h-5 text-amber-400" /> },
    { label: "Rejected", value: claims.filter(c => c.status === "rejected").length, icon: <XCircle className="w-5 h-5 text-red-400" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Claims Pipeline</h2>
        <p className="text-sm text-gray-400 mt-1">Zero-touch parametric claims processing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            {s.icon}
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Claims Cards */}
      <div className="space-y-4">
        {claims.map((claim, i) => (
          <div key={claim.id} className="glass-card p-5 flex items-center justify-between"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{claim.triggerIcon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{claim.workerName}</p>
                  <span className="text-xs font-mono text-gray-500">{claim.id}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{claim.triggerType} · Filed {claim.filedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Fraud Score</p>
                <p className={`text-lg font-bold ${fraudScoreColor(claim.fraudScore)}`}>{claim.fraudScore}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Payout</p>
                <p className="text-lg font-bold text-white">₹{claim.amount}</p>
              </div>
              <span className={`status-badge flex items-center gap-1.5 ${statusConfig[claim.status].color}`}>
                {statusConfig[claim.status].icon}
                {statusConfig[claim.status].label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
