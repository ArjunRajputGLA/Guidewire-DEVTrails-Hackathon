"use client";
import { useAuth } from "@/context/AuthContext";
import { policies } from "@/data/mockData";
import { ShieldCheck, Calendar, IndianRupee, Zap } from "lucide-react";

export default function MyPolicyPage() {
  const { user } = useAuth();
  const policy = policies.find(
    (p) => p.workerName === user?.name || p.workerId === "W001"
  );

  const tierColors = {
    Starter: { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/30" },
    Standard: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" },
    Pro: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  };

  const colors = policy ? tierColors[policy.tier] : tierColors.Standard;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Your current income protection plan</p>
      </div>

      {policy ? (
        <>
          {/* Policy Card */}
          <div className={`glass-card p-8 border-l-4 ${colors.border}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                <ShieldCheck className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{policy.tier} Plan</h2>
                <span className={`status-badge text-[10px] ${
                  policy.status === "active" ? "bg-emerald-500/15 text-emerald-400" :
                  policy.status === "expired" ? "bg-gray-500/15 text-gray-400" :
                  "bg-red-500/15 text-red-400"
                }`}>
                  {policy.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/3">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Weekly Premium</p>
                </div>
                <p className="text-2xl font-bold text-white">₹{policy.weeklyPremium}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Max Payout</p>
                </div>
                <p className="text-2xl font-bold text-white">₹{policy.maxPayout.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Valid Until</p>
                </div>
                <p className="text-2xl font-bold text-white">{policy.endDate}</p>
              </div>
            </div>
          </div>

          {/* Policy Details */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Details</h3>
            <div className="space-y-3">
              {[
                { label: "Policy ID", value: policy.id },
                { label: "Start Date", value: policy.startDate },
                { label: "End Date", value: policy.endDate },
                { label: "Covered Events", value: "Heavy Rainfall, Extreme Heat, AQI Alert, Platform Outage, Curfew/Strike" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Policy</h3>
          <p className="text-gray-500 text-sm">You don&apos;t have an active policy. Contact support to get started.</p>
        </div>
      )}
    </div>
  );
}
