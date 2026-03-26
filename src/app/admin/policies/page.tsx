"use client";
import { policies } from "@/data/mockData";
import { Plus } from "lucide-react";

export default function PoliciesPage() {
  const statusColor = (s: string) => {
    if (s === "active") return "bg-emerald-500/15 text-emerald-400";
    if (s === "expired") return "bg-gray-500/15 text-gray-400";
    return "bg-red-500/15 text-red-400";
  };

  const tierColor = (t: string) => {
    if (t === "Pro") return "bg-purple-500/15 text-purple-400 border border-purple-500/20";
    if (t === "Standard") return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Policies</h2>
          <p className="text-sm text-gray-400 mt-1">Manage 7-day rolling income protection policies</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      {/* Premium Tier Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { tier: "Starter", earnings: "₹2,500 – ₹3,500/wk", premium: "₹29/wk", payout: "₹1,500 max", color: "#6b7280" },
          { tier: "Standard", earnings: "₹3,500 – ₹5,500/wk", premium: "₹49/wk", payout: "₹2,500 max", color: "#3b82f6" },
          { tier: "Pro", earnings: "₹5,500 – ₹8,000/wk", premium: "₹79/wk", payout: "₹4,000 max", color: "#8b5cf6" },
        ].map((t) => (
          <div key={t.tier} className="glass-card p-5 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
              style={{ background: t.color }}>{t.tier[0]}</div>
            <h4 className="text-white font-semibold">{t.tier}</h4>
            <p className="text-xs text-gray-500 mt-1">{t.earnings}</p>
            <p className="text-lg font-bold text-white mt-2">{t.premium}</p>
            <p className="text-xs text-gray-500">{t.payout}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Policy ID", "Worker", "Tier", "Premium", "Max Payout", "Coverage Period", "Status"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policies.map((p, i) => (
              <tr key={p.id} className="border-b border-white/3 hover:bg-white/3 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}>
                <td className="px-6 py-4 text-sm font-mono text-indigo-400">{p.id}</td>
                <td className="px-6 py-4 text-sm text-white">{p.workerName}</td>
                <td className="px-6 py-4">
                  <span className={`status-badge ${tierColor(p.tier)}`}>{p.tier}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">₹{p.weeklyPremium}/wk</td>
                <td className="px-6 py-4 text-sm text-gray-300">₹{p.maxPayout.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{p.startDate} → {p.endDate}</td>
                <td className="px-6 py-4">
                  <span className={`status-badge ${statusColor(p.status)}`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
