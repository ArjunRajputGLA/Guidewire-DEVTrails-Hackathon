"use client";
import { useAuth } from "@/context/AuthContext";
import { claims, policies, triggers } from "@/data/mockData";
import {
  IndianRupee,
  ShieldCheck,
  ClipboardList,
  CloudRain,
  FileText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function WorkerDashboardPage() {
  const { user } = useAuth();

  // Find worker's data from mock
  const workerClaims = claims.filter(
    (c) => c.workerName === user?.name || c.workerId === "W001"
  );
  const workerPolicy = policies.find(
    (p) => p.workerName === user?.name || p.workerId === "W001"
  );
  const activeAlerts = triggers.filter((t) => t.status === "active");

  const kpis = [
    {
      title: "Today's Earnings",
      value: "₹850",
      subtitle: "Avg this week: ₹780",
      icon: IndianRupee,
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
      title: "Active Policy",
      value: workerPolicy?.tier || "Standard",
      subtitle: `₹${workerPolicy?.weeklyPremium || 49}/week`,
      icon: ShieldCheck,
      gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    },
    {
      title: "Claims Filed",
      value: String(workerClaims.length),
      subtitle: `${workerClaims.filter((c) => c.status === "paid").length} paid out`,
      icon: ClipboardList,
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
    {
      title: "Weather Alerts",
      value: String(activeAlerts.length),
      subtitle: activeAlerts.length > 0 ? activeAlerts[0].type : "All clear",
      icon: CloudRain,
      gradient: "linear-gradient(135deg, #ef4444, #f87171)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Hello, {user?.name?.split(" ")[0] || "Worker"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s your protection overview for today
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="glass-card p-5 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.gradient }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
              <p className="text-[10px] text-gray-600 mt-0.5 uppercase tracking-wider">
                {kpi.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/worker/my-claims"
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}
          >
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">File a Claim</p>
            <p className="text-xs text-gray-500">
              Report a disruption and get paid automatically
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/worker/my-policy"
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">View My Policy</p>
            <p className="text-xs text-gray-500">
              Check coverage details and renewal date
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Claims */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Claims
        </h3>
        {workerClaims.length === 0 ? (
          <p className="text-gray-500 text-sm">No claims yet.</p>
        ) : (
          <div className="space-y-3">
            {workerClaims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{claim.triggerIcon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {claim.triggerType}
                    </p>
                    <p className="text-xs text-gray-500">{claim.filedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ₹{claim.amount}
                  </p>
                  <span
                    className={`status-badge text-[10px] ${
                      claim.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : claim.status === "auto-approved"
                        ? "bg-blue-500/15 text-blue-400"
                        : claim.status === "pending-review"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {claim.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="glass-card p-6 border-l-4 border-amber-500/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-amber-400" />
            Active Alerts in Your Area
          </h3>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{alert.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {alert.type}
                    </p>
                    <p className="text-xs text-gray-500">{alert.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-400">
                    {alert.currentValue}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.affectedWorkers} workers affected
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
