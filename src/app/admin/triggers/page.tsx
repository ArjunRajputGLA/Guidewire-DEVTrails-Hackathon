"use client";
import { useEffect, useState } from "react";
import { Radio, RefreshCw, Filter } from "lucide-react";
import { locations } from "@/data/locations";
import { monitorAllLocations, IntegratedTrigger } from "@/services/monitorService";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 }
};

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<IntegratedTrigger[]>([]);
  const [filteredTriggers, setFilteredTriggers] = useState<IntegratedTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("All India");

  const fetchTriggerData = async () => {
    setLoading(true);
    try {
      const allTriggers = await monitorAllLocations();
      
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

  useEffect(() => {
    if (selectedCity === "All India") {
      setFilteredTriggers(triggers);
    } else {
      setFilteredTriggers(triggers.filter((t) => t.city === selectedCity));
    }
  }, [selectedCity, triggers]);

  const statusColor = (s: string) => {
    if (s === "active") return "bg-red-500/15 text-red-400 border border-red-500/20";
    if (s === "monitoring") return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
  };

  const activeTriggers = filteredTriggers.filter(t => t.status === "active");
  const totalAffected = activeTriggers.reduce((sum, t) => sum + t.affectedWorkers, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1A1A24] border border-[#2D2D3A] rounded-xl px-3 py-1.5 min-w-[200px]">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-sm text-gray-200 outline-none w-full"
              aria-label="Filter triggers by city"
            >
              <option value="All India">All India</option>
              {locations.map((loc) => (
                <option key={loc.city} value={loc.city}>
                  {loc.city}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={fetchTriggerData}
            title="Refresh Triggers"
            className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-sm font-medium text-red-400">{activeTriggers.length} Active · {totalAffected} Workers</span>
          </div>
        </div>
      </div>

      {loading && filteredTriggers.length === 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 border border-gray-800/50 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full shrink-0" />
                <div className="space-y-3 w-full">
                  <div className="h-5 bg-gray-800 rounded w-1/3" />
                  <div className="h-4 bg-gray-800 rounded w-1/4" />
                  <div className="grid grid-cols-4 gap-6 mt-4">
                    <div className="h-10 bg-gray-800 rounded w-full" />
                    <div className="h-10 bg-gray-800 rounded w-full" />
                    <div className="h-10 bg-gray-800 rounded w-full" />
                    <div className="h-10 bg-gray-800 rounded w-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTriggers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-12 glass-card text-center border-dashed"
        >
          <span className="text-4xl mb-4">☀️</span>
          <h3 className="text-lg font-medium text-white mb-2">No Active Disruption Triggers</h3>
          <p className="text-sm text-gray-400">Weather conditions in {selectedCity} are normal. No external disruptions detected for gig workers.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4"
        >
          <AnimatePresence mode="popLayout">
          {filteredTriggers.map((trigger) => (
            <motion.div 
              key={trigger.id} 
              variants={itemVariants}
              layout
              className="glass-card p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="text-4xl shrink-0 mt-1">{trigger.icon}</span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{trigger.type}</h3>
                      <span className={`status-badge ${statusColor(trigger.status)}`}>
                        {trigger.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                        {trigger.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">📍 {trigger.location}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Threshold</p>
                        <p className="text-sm font-medium text-gray-300 mt-0.5">{trigger.threshold}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Current Value</p>
                        <p className={`text-sm font-bold mt-0.5 ${trigger.status === "active" ? "text-red-400" : trigger.status === "monitoring" ? "text-amber-400" : "text-emerald-400"}`}>
                          {trigger.currentValue}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Workers Affected</p>
                        <p className="text-sm font-medium text-white mt-0.5">{trigger.affectedWorkers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Detected At</p>
                        <p className="text-sm text-gray-400 mt-0.5">{trigger.detectedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {trigger.status === "active" && (
                  <button className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-all whitespace-nowrap">
                    View Details
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
