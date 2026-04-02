"use client";
import { useState, useEffect } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

interface WeatherTrigger {
  id: string;
  type: string;
  icon: string;
  location: string;
  status: "active" | "monitoring" | "normal";
  threshold: string;
  currentValue: string;
  affectedWorkers: number;
  detectedAt: string;
  lat: number;
  lon: number;
  temp: number;
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

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<WeatherTrigger[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!apiKey) throw new Error("Weather API Key not found");

      const newTriggers: WeatherTrigger[] = await Promise.all(
        CITIES.map(async (city) => {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`
          );
          if (!res.ok) throw new Error(`Weather check failed for ${city.name}`);
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

          // Fetch affected workers count from Supabase
          const { count } = await supabase
            .from("worker_profiles")
            .select("*", { count: "exact", head: true })
            .ilike("city", `%${city.region}%`); // Match broader region

          return {
            id: `trigger-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
            type: alertType,
            icon,
            location: `${city.name}, ${city.region}`,
            status,
            threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
            currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
            affectedWorkers: count || 0,
            detectedAt: new Date().toLocaleTimeString(),
            lat: city.lat,
            lon: city.lon,
            temp
          };
        })
      );
      
      setTriggers(newTriggers.sort((a,b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)));
      setLastRefreshed(new Date());
      setElapsedSeconds(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // Refresh weather data every 5 minutes 
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Simulating 24/7 every second real-time updates for UI 
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      
      // Add slight jitter logic to make values "move" every second for realism as requested
      setTriggers(prev => prev.map(t => {
         const jitter = (Math.random() - 0.5) * 0.1;
         const newTemp = t.temp + jitter;
         return {
           ...t,
           temp: newTemp,
           currentValue: t.currentValue.replace(/[-+]?[0-9]*\.?[0-9]+°C/, `${newTemp.toFixed(1)}°C`)
         }
      }))
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Trigger Monitoring
            <button 
              onClick={fetchWeatherData} 
              disabled={loading}
              className={`p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all ${loading ? 'opacity-50' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Real-time parametric disruption detection (Updated {elapsedSeconds}s ago)</p>
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
