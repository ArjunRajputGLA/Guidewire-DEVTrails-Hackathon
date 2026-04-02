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

const CITIES = [
  // Mumbai & Suburbs
  { name: "Andheri", region: "Mumbai", area: "Maharashtra", lat: 19.1136, lon: 72.8697 },
  { name: "Bandra", region: "Mumbai", area: "Maharashtra", lat: 19.0596, lon: 72.8295 },
  { name: "Navi Mumbai", region: "Navi Mumbai", area: "Maharashtra", lat: 19.0330, lon: 73.0297 },
  { name: "Thane", region: "Thane", area: "Maharashtra", lat: 19.2183, lon: 72.9781 },
  // Delhi & NCR
  { name: "Connaught Place", region: "Delhi", area: "Delhi", lat: 28.6304, lon: 77.2177 },
  { name: "Dwarka", region: "Delhi", area: "Delhi", lat: 28.5823, lon: 77.0500 },
  { name: "Rohini", region: "Delhi", area: "Delhi", lat: 28.7366, lon: 77.1132 },
  { name: "Gurugram", region: "Gurugram", area: "Haryana", lat: 28.4595, lon: 77.0266 },
  { name: "Noida", region: "Noida", area: "UP", lat: 28.5355, lon: 77.3910 },
  // Bangalore
  { name: "Koramangala", region: "Bangalore", area: "Karnataka", lat: 12.9352, lon: 77.6245 },
  { name: "Whitefield", region: "Bangalore", area: "Karnataka", lat: 12.9698, lon: 77.7499 },
  { name: "Indiranagar", region: "Bangalore", area: "Karnataka", lat: 12.9784, lon: 77.6408 },
  { name: "Electronic City", region: "Bangalore", area: "Karnataka", lat: 12.8399, lon: 77.6770 },
  // Hyderabad
  { name: "HITEC City", region: "Hyderabad", area: "Telangana", lat: 17.4435, lon: 78.3772 },
  { name: "Gachibowli", region: "Hyderabad", area: "Telangana", lat: 17.4401, lon: 78.3489 },
  // Chennai
  { name: "T Nagar", region: "Chennai", area: "Tamil Nadu", lat: 13.0405, lon: 80.2337 },
  { name: "Velachery", region: "Chennai", area: "Tamil Nadu", lat: 12.9754, lon: 80.2205 },
  // Pune
  { name: "Hinjewadi", region: "Pune", area: "Maharashtra", lat: 18.5913, lon: 73.7389 },
  { name: "Kothrud", region: "Pune", area: "Maharashtra", lat: 18.5074, lon: 73.8077 },
  // Kolkata
  { name: "Salt Lake", region: "Kolkata", area: "West Bengal", lat: 22.5804, lon: 88.4200 },
  { name: "New Town", region: "Kolkata", area: "West Bengal", lat: 22.5855, lon: 88.4633 },
  // Ahmedabad
  { name: "Satellite", region: "Ahmedabad", area: "Gujarat", lat: 23.0333, lon: 72.5217 },
  { name: "Bopal", region: "Ahmedabad", area: "Gujarat", lat: 23.0305, lon: 72.4597 }
];

export default function AdminDashboardPage() {
  const [activeTriggers, setActiveTriggers] = useState<WeatherTrigger[]>([]);
  const [loadingTriggers, setLoadingTriggers] = useState(true);

  useEffect(() => {
    const fetchActiveTriggers = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) throw new Error("Weather API Key not found");

        const triggerResults = await Promise.all(
          CITIES.map(async (city) => {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`
            );
            if (!res.ok) return null;
            const data = await res.json();

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

            const { count } = await supabase
              .from("worker_profiles")
              .select("*", { count: "exact", head: true })
              .ilike("city", `%${city.region}%`); // Match worker profiles by broad region

            return {
              id: `trigger-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
              type: alertType,
              icon,
              location: `${city.name}, ${city.region}`,
              status,
              threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
              currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
              affectedWorkers: count || 0,
            };
          })
        );
        
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
