"use client";
import KPICard from "@/components/KPICard";
import { Users, ShieldCheck, ClipboardList, ShieldAlert, TrendingUp, Activity } from "lucide-react";
import { claimsChartData, premiumRevenueData, claims, triggers } from "@/data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard
          title="Active Workers"
          value="1,247"
          change="↑ 12% from last week"
          changeType="positive"
          icon={Users}
          gradient="linear-gradient(135deg, #6366f1, #818cf8)"
        />
        <KPICard
          title="Active Policies"
          value="983"
          change="↑ 8% from last week"
          changeType="positive"
          icon={ShieldCheck}
          gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)"
        />
        <KPICard
          title="Claims This Week"
          value="19"
          change="↓ 5 fewer than last week"
          changeType="positive"
          icon={ClipboardList}
          gradient="linear-gradient(135deg, #06b6d4, #22d3ee)"
        />
        <KPICard
          title="Fraud Alerts"
          value="3"
          change="2 under investigation"
          changeType="negative"
          icon={ShieldAlert}
          gradient="linear-gradient(135deg, #f43f5e, #fb7185)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Claims Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Claims Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={claimsChartData}>
              <defs>
                <linearGradient id="claimsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#f3f4f6",
                }}
              />
              <Area type="monotone" dataKey="claims" stroke="#6366f1" strokeWidth={2} fill="url(#claimsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs Claims */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Premium Revenue vs Payouts
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={premiumRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#f3f4f6",
                }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="revenue" name="Premium Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="claims" name="Claims Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {claims.slice(0, 4).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{claim.triggerIcon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{claim.workerName}</p>
                    <p className="text-xs text-gray-500">{claim.triggerType} · {claim.filedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹{claim.amount}</p>
                  <span className={`status-badge text-[10px] ${
                    claim.status === "paid" ? "bg-emerald-500/15 text-emerald-400" :
                    claim.status === "auto-approved" ? "bg-blue-500/15 text-blue-400" :
                    claim.status === "pending-review" ? "bg-amber-500/15 text-amber-400" :
                    "bg-red-500/15 text-red-400"
                  }`}>
                    {claim.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Triggers */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Triggers</h3>
          <div className="space-y-3">
            {triggers.filter(t => t.status === "active").map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{trigger.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{trigger.type}</p>
                    <p className="text-xs text-gray-500">{trigger.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-400">{trigger.currentValue}</p>
                  <p className="text-xs text-gray-500">{trigger.affectedWorkers} workers affected</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
