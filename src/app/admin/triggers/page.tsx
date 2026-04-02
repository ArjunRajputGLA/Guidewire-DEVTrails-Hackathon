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

const CITIES = []; // We now dynamically fetch cities from worker profiles

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<WeatherTrigger[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!apiKey) throw new Error("Weather API Key not found. Please add NEXT_PUBLIC_WEATHER_API_KEY to your environment.");

      // Fetch dynamic active worker cities from income_data city_zone
      const { data: incomeData, error: incomeError } = await supabase
        .from("income_data")
        .select("city_zone");
      
      if (incomeError) throw new Error(`Supabase query failed: ${incomeError.message}`);
      
      const rawZones = incomeData?.map(d => d.city_zone).filter(Boolean) || [];
      const uniqueZones = Array.from(new Set([...rawZones, "Mathura", "Vrindavan"])) as string[];

      if (uniqueZones.length === 0) {
         setTriggers([]);
         setLoading(false);
         return;
      }

      const rawTriggers = await Promise.all(
        uniqueZones.map(async (zoneName) => {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(zoneName)},IN&appid=${apiKey}&units=metric`
          );
          if (!res.ok) {
            console.warn(`Weather check failed for ${zoneName}`);
            return null;
          }
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
            .from("income_data")
            .select("*", { count: "exact", head: true })
            .ilike("city_zone", `%${zoneName}%`);

          return {
            id: `trigger-${zoneName.toLowerCase().replace(/\s+/g, '-')}`,
            type: alertType,
            icon,
            location: `${zoneName}, India`,
            status,
            threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
            currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
            affectedWorkers: count || 0,
            detectedAt: new Date().toLocaleTimeString(),
            lat: data.coord.lat,
            lon: data.coord.lon,
            temp
          };
        })
      );
      
      const validTriggers = rawTriggers.filter(Boolean) as WeatherTrigger[];
      setTriggers(validTriggers.sort((a,b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)));
      setLastRefreshed(new Date());
      setElapsedSeconds(0);
    } catch (err: unknown) {
      console.error("Error fetching weather data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while fetching zones.";
      setError(errorMessage);
      setTriggers([]);
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
              className={`flex items-center gap-2 group px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-indigo-400 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              Fetch Zones
            </button>
          </h2>
          <p className="text-sm text-gray-400 mt-2">Real-time parametric disruption detection (Updated {elapsedSeconds}s ago)</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-sm font-medium text-red-400">{activeTriggers.length} Active · {totalAffected} Workers Affected</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          <strong>Error loading triggers:</strong> {error}
        </div>
      )}

      {!loading && triggers.length === 0 && !error && (
        <div className="p-12 border border-dashed border-gray-700 rounded-xl text-center flex flex-col items-center justify-center text-gray-400">
          <span className="text-4xl mb-3">📡</span>
          <h3 className="text-lg font-semibold text-white">No zones to monitor</h3>
          <p className="text-sm mt-1 max-w-sm">No worker city zones were found in the database. Register gig workers first, then fetch zones to start tracking anomalies.</p>
          <button 
            onClick={fetchWeatherData}
            className="mt-6 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors"
          >
            Refetch Regions
          </button>
        </div>
      )}

      {loading && triggers.length === 0 && (
        <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p>Fetching active worker zones and weather data...</p>
        </div>
      )}

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
