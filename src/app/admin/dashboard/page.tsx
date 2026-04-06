"use client";
import { useState, useEffect } from "react";
import KPICard from "@/components/KPICard";
import { Users, ShieldCheck, ClipboardList, ShieldAlert, TrendingUp, Activity, AlertTriangle, Wifi } from "lucide-react";
import { claimsChartData, premiumRevenueData } from "@/data/mockData";
import { supabase } from "@/lib/supabase-browser";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

interface WeatherTrigger {
  id: string;
  type: string;
  icon: string;
  location: string;
  status: "active" | "monitoring" | "normal";
  threshold: string;
  currentValue: string;
  affectedWorkers: number;
}

const CITIES = [];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0e0e1a] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name === "revenue" || entry.name === "claims"
              ? `₹${Number(entry.value).toLocaleString()}`
              : entry.value}{" "}
            <span className="text-gray-500 font-normal text-xs">{entry.name}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [activeTriggers, setActiveTriggers] = useState<WeatherTrigger[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [claimsChartDataState, setClaimsChartDataState] = useState<any[]>([]);
  const [premiumRevenueDataState, setPremiumRevenueDataState] = useState<any[]>([]);

  const [kpiStats, setKpiStats] = useState({
    workers: "...",
    policies: "...",
    claimsThisWeek: "...",
    fraudAlerts: "...",
  });

  useEffect(() => {
    const fetchActiveTriggers = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) throw new Error("Weather API Key not found");

        const { data: profilesData, error: profilesError } = await supabase
          .from("worker_profiles")
          .select("city, state, city_zone");

        if (profilesError) throw profilesError;

        let allProfiles = profilesData || [];

        if (allProfiles.length === 0) {
          setActiveTriggers([]);
          setLoadingTriggers(false);
          return;
        }

        const uniqueProfilesMap = new Map<string, { profile: any; count: number }>();
        for (const p of allProfiles) {
          const key = `${p.city_zone || ""}|${p.city || ""}|${p.state || ""}`;
          if (!uniqueProfilesMap.has(key)) {
            uniqueProfilesMap.set(key, { profile: p, count: 0 });
          }
          uniqueProfilesMap.get(key)!.count++;
        }

        const weatherCache = new Map<string, any>();
        const getWeatherData = async (loc?: string, timeoutMs: number = 2000) => {
          if (!loc || !loc.trim()) return null;
          const normalizedLoc = loc.trim();
          if (weatherCache.has(normalizedLoc)) return weatherCache.get(normalizedLoc);
          try {
            const fetchPromise = fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedLoc)},IN&appid=${apiKey}&units=metric`
            );
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), timeoutMs)
            );
            const res = (await Promise.race([fetchPromise, timeoutPromise])) as Response;
            if (res && res.ok) {
              const data = await res.json();
              weatherCache.set(normalizedLoc, data);
              return data;
            }
          } catch (e) {}
          weatherCache.set(normalizedLoc, null);
          return null;
        };

        const resolvedGroups = new Map<string, { count: number; data: any; fullLocation: string }>();

        await Promise.all(
          Array.from(uniqueProfilesMap.entries()).map(async ([key, { profile, count }]) => {
            let matchedData = null;
            const dataZone = await getWeatherData(profile.city_zone, 5000);
            if (dataZone) {
              matchedData = dataZone;
            } else {
              const dataCity = await getWeatherData(profile.city);
              if (dataCity) matchedData = dataCity;
              else {
                const dataState = await getWeatherData(profile.state);
                if (dataState) matchedData = dataState;
              }
            }
            const fullLocation = [profile.city_zone, profile.city, profile.state].filter(Boolean).join(", ");
            if (!matchedData) {
              matchedData = {
                main: { temp: 0 },
                weather: [{ main: "Unknown", description: "City API Not Found" }],
                coord: { lat: 0, lon: 0 },
                rain: {},
              };
            }
            const existing = resolvedGroups.get(key);
            if (existing) existing.count += count;
            else resolvedGroups.set(key, { count, data: matchedData, fullLocation });
          })
        );

        const triggerResults = Array.from(resolvedGroups.entries()).map(([key, { count, data, fullLocation }]) => {
          const temp = data.main.temp;
          const weatherMain = data.weather[0].main.toLowerCase();
          let status: "active" | "monitoring" | "normal" = "normal";
          let alertType = "Clear Weather";
          let icon = "☀️";
          if (temp > 40) { status = "active"; alertType = "Extreme Heatwave"; icon = "🔥"; }
          else if (temp > 35) { status = "monitoring"; alertType = "Heat Warning"; icon = "🌡️"; }
          else if (weatherMain.includes("rain") || weatherMain.includes("storm") || data.rain?.["1h"] > 10) { status = "active"; alertType = "Heavy Rainfall"; icon = "⛈️"; }
          else if (weatherMain.includes("drizzle") || data.rain?.["1h"] > 0) { status = "monitoring"; alertType = "Rain Warning"; icon = "🌧️"; }
          if (status !== "active") return null;
          return {
            id: `trigger-${key.replace(/[^a-zA-Z0-9]/g, "-")}`,
            type: alertType, icon, location: fullLocation, status,
            threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
            currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
            affectedWorkers: count,
          };
        });

        setActiveTriggers(triggerResults.filter(Boolean) as WeatherTrigger[]);
      } catch (err) {
        console.error("Error fetching active triggers for dashboard", err);
      } finally {
        setLoadingTriggers(false);
      }
    };

    fetchActiveTriggers();
    const interval = setInterval(fetchActiveTriggers, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecentClaims = async () => {
      setLoadingClaims(true);
      const { data, error } = await supabase
        .from("claims")
        .select("*, worker_profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (!error && data) setRecentClaims(data);
      setLoadingClaims(false);
    };

    const fetchChartData = async () => {
      // Calculate start dates for the last 5 weeks
      const weeksData: { week: string, claims: number, paid: number, revenue: number }[] = [];
      for (let i = 4; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - (i * 7 + 7));
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        weeksData.push({
          week: `Week ${5 - i}`, // Or format date: start.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
          claims: 0,
          paid: 0,
          revenue: 0
        });
      }

      // Fetch claims from the last 35 days
      const thirtyFiveDaysAgo = new Date();
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);
      
      const { data: claimsData } = await supabase
        .from("claims")
        .select("amount, created_at, status")
        .gte("created_at", thirtyFiveDaysAgo.toISOString());
        
      if (claimsData) {
        claimsData.forEach(claim => {
          const claimDate = new Date(claim.created_at);
          const diffDays = Math.floor((Date.now() - claimDate.getTime()) / (1000 * 60 * 60 * 24));
          const weekIndex = 4 - Math.min(Math.floor(diffDays / 7), 4);
          
          if (weekIndex >= 0 && weekIndex < 5) {
            weeksData[weekIndex].claims += 1;
            if (claim.status === "paid" || claim.status === "auto-approved" || claim.status === "approved") {
              weeksData[weekIndex].paid += Number(claim.amount || 0);
            }
          }
        });
      }

      // We'll simulate regular premium revenue slightly scaling with number of active policies
      const { count: policiesCount } = await supabase
        .from("worker_policies")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
        
      const avgWeeklyPremiumPerPolicy = 100; // estimated weekly premium per worker
      const totalWeeklyRevenue = (policiesCount || 0) * avgWeeklyPremiumPerPolicy;
      
      weeksData.forEach(w => {
        w.revenue = totalWeeklyRevenue > 0 ? totalWeeklyRevenue : 25000; // fallback if no policies
      });

      setClaimsChartDataState(weeksData.map(w => ({ week: w.week, claims: w.claims })));
      setPremiumRevenueDataState(weeksData.map(w => ({ week: w.week, revenue: w.revenue, claims: w.paid })));
    };

    const fetchKPIs = async () => {
      const { count: workersCount } = await supabase
        .from("worker_profiles")
        .select("*", { count: "exact", head: true });
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: policiesCount } = await supabase
        .from("worker_policies")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      const { count: claimsCount } = await supabase
        .from("claims")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());
      const { count: fraudCount } = await supabase
        .from("claims")
        .select("*", { count: "exact", head: true })
        .gte("fraud_score", 30)
        .eq("status", "pending-review");
      setKpiStats({
        workers: workersCount ? workersCount.toString() : "0",
        policies: policiesCount ? policiesCount.toString() : "0",
        claimsThisWeek: claimsCount ? claimsCount.toString() : "0",
        fraudAlerts: fraudCount ? fraudCount.toString() : "0",
      });
    };

    fetchRecentClaims();
    fetchChartData();
    fetchKPIs();
  }, []);

  function formatAgo(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 60) return `${diffMins || 1}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  const claimStatusStyle = (status: string) => {
    if (status === "paid") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (status === "auto-approved") return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    if (status === "pending-review") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-red-500/10 text-red-400 border border-red-500/20";
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPICard title="Active Workers" value={kpiStats.workers} change="Live from database" changeType="positive" icon={Users} gradient="linear-gradient(135deg, #6366f1, #818cf8)" />
        <KPICard title="Active Policies" value={kpiStats.policies} change="Live from database" changeType="positive" icon={ShieldCheck} gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
        <KPICard title="Claims This Week" value={kpiStats.claimsThisWeek} change="Past 7 days live data" changeType="neutral" icon={ClipboardList} gradient="linear-gradient(135deg, #06b6d4, #22d3ee)" />
        <KPICard title="Fraud Alerts" value={kpiStats.fraudAlerts} change="Pending > 30 risk score" changeType={kpiStats.fraudAlerts === "0" ? "neutral" : "negative"} icon={ShieldAlert} gradient="linear-gradient(135deg, #f43f5e, #fb7185)" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 hover:border-white/[0.12] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Claims Trend</h3>
                <p className="text-xs text-gray-600">Weekly filing volume</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={claimsChartDataState.length > 0 ? claimsChartDataState : claimsChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="claimsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="claims" stroke="#6366f1" strokeWidth={2.5} fill="url(#claimsFill)" dot={false} activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 hover:border-white/[0.12] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue vs Payouts</h3>
                <p className="text-xs text-gray-600">Premium collected vs claims paid</p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={premiumRevenueDataState.length > 0 ? premiumRevenueDataState : premiumRevenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#6b7280", fontSize: "11px", paddingTop: "12px" }} />
              <Bar dataKey="revenue" name="Premium Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={24} />
              <Bar dataKey="claims" name="Claims Paid" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Claims */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 hover:border-white/[0.12] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Recent Claims</h3>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              Live
            </span>
          </div>
          <div className="space-y-2">
            {loadingClaims ? (
              <div className="flex items-center gap-3 py-8 justify-center text-gray-600">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="text-sm">Loading claims...</span>
              </div>
            ) : recentClaims.length === 0 ? (
              <p className="text-sm text-gray-600 py-8 text-center">No recent claims</p>
            ) : (
              recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.045] border border-transparent hover:border-white/[0.07] transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                      {claim.trigger_icon || "⚠️"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-none mb-1">
                        {claim.worker_profiles?.full_name || "Unknown Worker"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {claim.trigger_type} · {formatAgo(claim.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white mb-1">₹{claim.amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${claimStatusStyle(claim.status)}`}>
                      {claim.status?.replace("-", " ").toUpperCase() || "PENDING"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Triggers */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 hover:border-white/[0.12] transition-all duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Active Triggers</h3>
            {activeTriggers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {activeTriggers.length} active
              </div>
            )}
          </div>
          <div className="space-y-2">
            {loadingTriggers ? (
              <div className="flex items-center gap-3 py-8 justify-center text-gray-600">
                <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-sm">Scanning weather zones...</span>
              </div>
            ) : activeTriggers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-400">All regions clear</p>
                <p className="text-xs text-gray-600 mt-1">No active disruptions detected</p>
              </div>
            ) : (
              activeTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/[0.04] hover:bg-red-500/[0.07] border border-red-500/10 hover:border-red-500/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center text-base flex-shrink-0">
                      {trigger.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-none mb-1 flex items-center gap-1.5">
                        {trigger.type}
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                      </p>
                      <p className="text-xs text-gray-600">📍 {trigger.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400 mb-1">{trigger.currentValue}</p>
                    <p className="text-xs text-gray-600">{trigger.affectedWorkers} workers</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}