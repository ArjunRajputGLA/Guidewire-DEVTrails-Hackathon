"use client";
import { useState, useEffect } from "react";
import KPICard from "@/components/KPICard";
import { Users, ShieldCheck, ClipboardList, ShieldAlert, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { claimsChartData, premiumRevenueData, claims } from "@/data/mockData";
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

const CITIES = []; // We now dynamically fetch cities from worker profiles

export default function AdminDashboardPage() {
  const [activeTriggers, setActiveTriggers] = useState<WeatherTrigger[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);

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

        const uniqueProfilesMap = new Map<string, { profile: any, count: number }>();
        for (const p of allProfiles) {
          const key = `${p.city_zone || ''}|${p.city || ''}|${p.state || ''}`;
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
            const fetchPromise = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedLoc)},IN&appid=${apiKey}&units=metric`);
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('timeout')), timeoutMs)
            );

            // Strict fallback countdown. OpenWeatherMap must resolve in exactly < timeoutMs.
            const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
            if (res && res.ok) {
              const data = await res.json();
              weatherCache.set(normalizedLoc, data);
              return data;
            }
          } catch(e) {
            // Aborts or network fails seamlessly fall through
          }
          weatherCache.set(normalizedLoc, null);
          return null;
        };

        const resolvedGroups = new Map<string, { count: number, data: any, fullLocation: string }>();

        await Promise.all(Array.from(uniqueProfilesMap.entries()).map(async ([key, { profile, count }]) => {
          let matchedLoc = null;
          let matchedData = null;

          // Start countdown timeout limit specifically shorter for highly granular zones (e.g. 5 seconds max) 
          const dataZone = await getWeatherData(profile.city_zone, 5000);
          if (dataZone) {
            matchedLoc = profile.city_zone!.trim();
            matchedData = dataZone;
          } else {
            const dataCity = await getWeatherData(profile.city);
            if (dataCity) {
              matchedLoc = profile.city!.trim();
              matchedData = dataCity;
            } else {
              const dataState = await getWeatherData(profile.state);
              if (dataState) {
                matchedLoc = profile.state!.trim();
                matchedData = dataState;
              }
            }
          }

          const fullLocation = [profile.city_zone, profile.city, profile.state]
            .filter(Boolean)
            .join(", ");

          // Always add the profile so it never disappears from monitoring,
          // even if the API completely rejects the zone/city/state strings.
          if (!matchedData) {
             matchedData = {
                main: { temp: 0 },
                weather: [{ main: "Unknown", description: "City API Not Found" }],
                coord: { lat: 0, lon: 0 },
                rain: {}
             };
          }
          
          const existing = resolvedGroups.get(key);
          if (existing) {
            existing.count += count;
          } else {
            resolvedGroups.set(key, { count, data: matchedData, fullLocation });
          }
        }));

        const triggerResults = Array.from(resolvedGroups.entries()).map(([key, { count, data, fullLocation }]) => {
          const temp = data.main.temp;
          const weatherMain = data.weather[0].main.toLowerCase();
          
          let status: "active" | "monitoring" | "normal" = "normal";
          let alertType = "Clear Weather";
          let icon = "☀️";
          
          if (temp > 40) {
            status = "active"; alertType = "Extreme Heatwave"; icon = "🔥";
          } else if (temp > 35) {
            status = "monitoring"; alertType = "Heat Warning"; icon = "🌡️";
          } else if (weatherMain.includes("rain") || weatherMain.includes("storm") || data.rain?.["1h"] > 10) {
             status = "active"; alertType = "Heavy Rainfall"; icon = "⛈️";
          } else if (weatherMain.includes("drizzle") || data.rain?.["1h"] > 0) {
            status = "monitoring"; alertType = "Rain Warning"; icon = "🌧️";
          }

          if (status !== "active") return null;

          return {
            id: `trigger-${key.replace(/[^a-zA-Z0-9]/g, '-')}`,
            type: alertType,
            icon,
            location: fullLocation,
            status,
            threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
            currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
            affectedWorkers: count,
          };
        });
        
        const validActiveTriggers = triggerResults.filter(Boolean) as WeatherTrigger[];
        setActiveTriggers(validActiveTriggers);
      } catch (err) {
        console.error("Error fetching active triggers for dashboard", err);
      } finally {
        setLoadingTriggers(false);
      }
    };

    fetchActiveTriggers();
    const interval = setInterval(fetchActiveTriggers, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

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
            {loadingTriggers ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            ) : activeTriggers.length === 0 ? (
              <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-emerald-400">All regions clear</p>
                <p className="text-xs text-gray-500 mt-1">No active disruptions detected across operating zones.</p>
              </div>
            ) : (
              activeTriggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-red-500/10 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{trigger.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        {trigger.type}
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      </p>
                      <p className="text-xs text-gray-500">📍 {trigger.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-400">{trigger.currentValue}</p>
                    <p className="text-xs text-gray-500">{trigger.affectedWorkers} workers affected</p>
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
