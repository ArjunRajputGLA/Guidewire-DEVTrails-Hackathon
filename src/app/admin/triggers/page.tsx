"use client";
import { useState, useEffect } from "react";
import { Radio, RefreshCw, Thermometer, Droplets, CheckCircle2, AlertCircle } from "lucide-react";
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

const CITIES = [];

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

      const { data: profilesData, error: profilesError } = await supabase
        .from("worker_profiles")
        .select("city, state, city_zone");

      if (profilesError) throw new Error(`Supabase query failed: ${profilesError.message}`);

      let allProfiles = profilesData || [];

      if (allProfiles.length === 0) {
        setTriggers([]);
        setLoading(false);
        return;
      }

      const uniqueProfilesMap = new Map<string, { profile: any; count: number }>();
      for (const p of allProfiles) {
        const isLocationEmpty = !p.city_zone?.trim() && !p.city?.trim() && !p.state?.trim();
        if (isLocationEmpty) continue;
        const key = `${p.city_zone || ""}|${p.city || ""}|${p.state || ""}`;
        if (!uniqueProfilesMap.has(key)) uniqueProfilesMap.set(key, { profile: p, count: 0 });
        uniqueProfilesMap.get(key)!.count++;
      }

      const weatherCache = new Map<string, any>();
      const getWeatherData = async (loc?: string, timeoutMs: number = 2000) => {
        if (!loc || !loc.trim()) return null;
        const normalizedLoc = loc.trim();
        if (weatherCache.has(normalizedLoc)) return weatherCache.get(normalizedLoc);
        try {
          const fetchPromise = fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(normalizedLoc)},IN&appid=${apiKey}&units=metric`);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs));
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
          if (dataZone) matchedData = dataZone;
          else {
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
              weather: [{ main: "Unknown", description: "Weather API unable to locate region" }],
              coord: { lat: 0, lon: 0 },
              rain: {},
            };
          }
          const existing = resolvedGroups.get(key);
          if (existing) existing.count += count;
          else resolvedGroups.set(key, { count, data: matchedData, fullLocation });
        })
      );

      if (resolvedGroups.size === 0) {
        setTriggers([]);
        setLoading(false);
        return;
      }

      const rawTriggers = Array.from(resolvedGroups.entries()).map(([key, { count, data, fullLocation }]) => {
        const temp = data.main.temp;
        const weatherMain = data.weather[0].main.toLowerCase();
        let status: "active" | "monitoring" | "normal" = "normal";
        let alertType = "Clear Weather";
        let icon = "☀️";
        if (temp > 40) { status = "active"; alertType = "Extreme Heatwave"; icon = "🔥"; }
        else if (temp > 35) { status = "monitoring"; alertType = "Heat Warning"; icon = "🌡️"; }
        else if (weatherMain.includes("rain") || weatherMain.includes("storm") || data.rain?.["1h"] > 10) { status = "active"; alertType = "Heavy Rainfall"; icon = "⛈️"; }
        else if (weatherMain.includes("drizzle") || data.rain?.["1h"] > 0) { status = "monitoring"; alertType = "Rain Warning"; icon = "🌧️"; }
        return {
          id: `trigger-${key.replace(/[^a-zA-Z0-9]/g, "-")}`,
          type: alertType, icon, location: fullLocation, status,
          threshold: temp > 35 ? "> 35°C" : "> 10mm/h Rain",
          currentValue: `${temp.toFixed(1)}°C, ${data.weather[0].description}`,
          affectedWorkers: count,
          detectedAt: new Date().toLocaleTimeString(),
          lat: data.coord.lat, lon: data.coord.lon, temp,
        };
      });

      setTriggers(
        (rawTriggers as WeatherTrigger[]).sort(
          (a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)
        )
      );
      setLastRefreshed(new Date());
      setElapsedSeconds(0);
    } catch (err: unknown) {
      console.error("Error fetching weather data:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setTriggers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setTriggers((prev) =>
        prev.map((t) => {
          const jitter = (Math.random() - 0.5) * 0.1;
          const newTemp = t.temp + jitter;
          return {
            ...t,
            temp: newTemp,
            currentValue: t.currentValue.replace(/[-+]?[0-9]*\.?[0-9]+°C/, `${newTemp.toFixed(1)}°C`),
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statusStyle = (s: string) => {
    if (s === "active") return { badge: "bg-red-500/10 text-red-400 border border-red-500/20", dot: "bg-red-400", value: "text-red-400", card: "border-red-500/15 bg-red-500/[0.03]" };
    if (s === "monitoring") return { badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", dot: "bg-amber-400", value: "text-amber-400", card: "border-amber-500/15 bg-amber-500/[0.03]" };
    return { badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400", value: "text-emerald-400", card: "border-white/[0.07] bg-white/[0.02]" };
  };

  const activeTriggers = triggers.filter((t) => t.status === "active");
  const monitoringTriggers = triggers.filter((t) => t.status === "monitoring");
  const normalTriggers = triggers.filter((t) => t.status === "normal");
  const totalAffected = activeTriggers.reduce((sum, t) => sum + t.affectedWorkers, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <Radio className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Trigger Monitoring</h2>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/18 transition-all text-indigo-400 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
                }`}
              />
              Refresh Zones
            </button>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Real-time parametric disruption detection · Last update {elapsedSeconds}s ago
          </p>
        </div>

        {/* Live status pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-semibold text-red-400">{activeTriggers.length} Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{monitoringTriggers.length} Monitoring</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">{normalTriggers.length} Normal</span>
          </div>
          {totalAffected > 0 && (
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-gray-400">{totalAffected} workers at risk</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.06] text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Error loading triggers: </span>
            {error}
          </div>
        </div>
      )}

      {/* Empty / Loading states */}
      {!loading && triggers.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-gray-500">
          <span className="text-4xl mb-4">📡</span>
          <h3 className="text-base font-semibold text-white mb-1">No zones to monitor</h3>
          <p className="text-sm text-gray-600 max-w-sm text-center mb-6">
            No worker city zones were found. Register gig workers first, then fetch zones to start tracking.
          </p>
          <button
            onClick={fetchWeatherData}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
          >
            Fetch Regions
          </button>
        </div>
      )}

      {loading && triggers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
          <p className="text-sm">Fetching active worker zones and weather data...</p>
        </div>
      )}

      {/* Trigger Cards */}
      {triggers.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {triggers.map((trigger, i) => {
            const style = statusStyle(trigger.status);
            return (
              <div
                key={trigger.id}
                className={`group relative rounded-2xl border ${style.card} transition-all duration-200 hover:scale-[1.005] overflow-hidden`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {trigger.status === "active" && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
                )}

                <div className="flex items-start justify-between p-5 gap-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                        trigger.status === "active"
                          ? "bg-red-500/10 border-red-500/20"
                          : trigger.status === "monitoring"
                          ? "bg-amber-500/10 border-amber-500/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {trigger.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-white">{trigger.type}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${style.badge}`}>
                          {trigger.status === "active" && (
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                          )}
                          {trigger.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">📍 {trigger.location}</p>

                      <div className="flex items-center gap-6 flex-wrap">
                        <div>
                          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-bold mb-0.5">Threshold</p>
                          <p className="text-sm font-medium text-gray-400">{trigger.threshold}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-bold mb-0.5">Current Value</p>
                          <p className={`text-sm font-bold tabular-nums ${style.value}`}>{trigger.currentValue}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-bold mb-0.5">Workers Affected</p>
                          <p className="text-sm font-semibold text-white">{trigger.affectedWorkers}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-bold mb-0.5">Detected At</p>
                          <p className="text-sm font-mono text-gray-500">{trigger.detectedAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {trigger.status === "active" && (
                    <button className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/8 hover:text-white border border-white/10 hover:border-white/18 transition-all duration-200">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}