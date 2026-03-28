"use client";
import { useEffect, useState } from "react";
import KPICard from "@/components/KPICard";
import { Users, ShieldCheck, ClipboardList, ShieldAlert, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { claimsChartData, premiumRevenueData, claims } from "@/data/mockData";
import { monitorAllLocations, IntegratedTrigger } from "@/services/monitorService";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboardPage() {
  const [liveTriggers, setLiveTriggers] = useState<IntegratedTrigger[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);

  useEffect(() => {
    const fetchLiveTriggers = async () => {
      setLoadingTriggers(true);
      try {
        const allTriggers = await monitorAllLocations();
        setLiveTriggers(allTriggers);
      } catch (error) {
        console.error("Failed to fetch live triggers on dashboard:", error);
      } finally {
        setLoadingTriggers(false);
      }
    };

    fetchLiveTriggers();
    const interval = setInterval(fetchLiveTriggers, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* KPI Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <KPICard
            title="Active Workers"
            value="1,247"
            change="↑ 12% from last week"
            changeType="positive"
            icon={Users}
            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Active Policies"
            value="983"
            change="↑ 8% from last week"
            changeType="positive"
            icon={ShieldCheck}
            gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)"
        />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Claims This Week"
            value="19"
            change="↓ 5 fewer than last week"
            changeType="positive"
            icon={ClipboardList}
            gradient="linear-gradient(135deg, #06b6d4, #22d3ee)"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title="Fraud Alerts"
            value="3"
            change="2 under investigation"
            changeType="negative"
            icon={ShieldAlert}
            gradient="linear-gradient(135deg, #f43f5e, #fb7185)"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Claims Trend */}
        <motion.div variants={itemVariants} className="glass-card p-6">
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
        </motion.div>

        {/* Revenue vs Claims */}
        <motion.div variants={itemVariants} className="glass-card p-6">
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
                formatter={(value) => [`₹${(Number(value) || 0).toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar dataKey="revenue" name="Premium Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="claims" name="Claims Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Bottom Row */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {claims.slice(0, 4).map((claim, index) => (
              <motion.div 
                key={claim.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
              >
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Triggers */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Triggers</h3>
            {loadingTriggers && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
          </div>
          <div className="space-y-3">
            {liveTriggers.filter(t => t.status === "active").length === 0 && !loadingTriggers ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">No active disruptions detected.</p>
              </div>
            ) : (
              liveTriggers.filter(t => t.status === "active").map((trigger, i) => (
                <motion.div 
                  key={trigger.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"
                >
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
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
