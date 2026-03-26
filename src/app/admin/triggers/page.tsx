"use client";
import { useEffect, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { fetchWeather } from "@/services/weatherService";
import { generateTriggers, DisruptionTrigger } from "@/services/triggerService";

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<DisruptionTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTriggerData = async () => {
    setLoading(true);
    try {
      const indianCities = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];
      
      // Fetch weather for all cities concurrently
      const weatherPromises = indianCities.map(city => fetchWeather(city));
      const weatherResults = await Promise.all(weatherPromises);
      
      // Generate triggers for all cities and flatten into a single array
      const allTriggers = weatherResults.flatMap(data => generateTriggers(data));
      
      setTriggers(allTriggers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggerData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchTriggerData();
    }, 60000);

    return () => clearInterval(interval);
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
          <h2 className="text-2xl font-bold text-white">Trigger Monitoring</h2>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400 mt-1">Real-time parametric disruption detection</p>
            {lastUpdated && (
              <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                | Last updated: {lastUpdated.toLocaleTimeString()}
                {loading && <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-sm font-medium text-red-400">{activeTriggers.length} Active · {totalAffected} Workers Affected</span>
        </div>
      </div>

      {loading && triggers.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : triggers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 glass-card text-center">
          <span className="text-4xl mb-4">☀️</span>
          <h3 className="text-lg font-medium text-white mb-2">No Active Disruption Triggers</h3>
          <p className="text-sm text-gray-400">Weather conditions are normal. No external disruptions detected for gig workers.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
