"use client";
import { Search, Filter, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";

export interface Worker {
  id: string;
  name: string;
  phone: string;
  platform: string;
  city: string;
  zone: string;
  tenure: number;
  dailyAvgEarnings: number;
  status: "active" | "inactive" | "suspended";
  lastActive: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const { data, error } = await supabase
          .from("worker_profiles")
          .select("id, full_name, mobile, city, city_zone, updated_at, gig_profiles(platform, tenure_months), income_data(avg_daily_earnings)");

        if (error) {
          console.error("Error fetching workers:", error);
          return;
        }

        if (data) {
          const formattedWorkers: Worker[] = data.map((w: any) => {
            let platformValue = "N/A";
            let tenureValue = 0;
            let earningsValue = 0;

            if (w.gig_profiles) {
              const gigProfile = Array.isArray(w.gig_profiles) && w.gig_profiles.length > 0
                ? w.gig_profiles[0]
                : w.gig_profiles;

              platformValue = gigProfile?.platform || "N/A";
              tenureValue = gigProfile?.tenure_months || 0;
            }

            if (w.income_data) {
              const incomeData = Array.isArray(w.income_data) && w.income_data.length > 0
                ? w.income_data[0]
                : w.income_data;

              earningsValue = incomeData?.avg_daily_earnings || 0;
            }

            return {
              id: w.id,
              name: w.full_name || "Unknown",
              phone: w.mobile || "N/A",
              platform: platformValue,
              city: w.city || "Unknown",
              zone: w.city_zone || "-",
              tenure: tenureValue,
              dailyAvgEarnings: earningsValue,
              status: "active",
              lastActive: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Just now",
            };
          });
          setWorkers(formattedWorkers);
        }
      } catch (err) {
        console.error("Failed to load workers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const filtered = workers.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
      w.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueCities = new Set(workers.map(w => w.city)).size;

  const statusColor = (s: string) => {
    if (s === "active") return "text-emerald-400 bg-emerald-500/10";
    if (s === "inactive") return "text-amber-500 bg-amber-500/10";
    if (s === "suspended") return "text-red-500 bg-red-500/10";
    return "text-emerald-500 bg-emerald-500/10";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Partners</h2>
          <p className="text-sm text-gray-400 mt-1">
            {workers.length} registered workers across {uniqueCities} {uniqueCities === 1 ? 'city' : 'cities'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <UserPlus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by name or city..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "active", "inactive", "suspended"].map((s) => (
            <button 
              key={s} 
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s 
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                  : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p>Loading worker profiles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2 py-20 text-gray-400">
            <UserPlus className="w-8 h-8 text-gray-600" />
            <p className="text-gray-300 font-medium">No workers found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Worker", "Platform", "City / Zone", "Tenure", "Avg. Earnings", "Status", "Last Active"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} className="border-b border-white/3 hover:bg-white/3 transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #6366f2, #a78bfa)" }}>
                        {w.name.split(" ").filter(n => n).map(n => n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{w.name}</p>
                        <p className="text-xs text-gray-500">{w.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-[120px]">{w.platform}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{w.city}</p>
                    <p className="text-xs text-gray-500">{w.zone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{w.tenure} months</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">₹{w.dailyAvgEarnings}/day</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${statusColor(w.status)}`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{w.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
