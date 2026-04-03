"use client";
import { Search, Filter, UserPlus, Loader2, Plus, X, RefreshCw, Trash2, MoreVertical, AlertTriangle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { createWorkerProfile, getWorkersStatuses, updateWorkerStatus, deleteWorkerRecord } from "./actions";

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

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "password123",
    phone: "",
    platform: "Swiggy",
    city: "Mathura",
    zone: "Govardhan",
    tenure: "0",
    dailyAvgEarnings: "0"
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const [workersRes, statusesRes] = await Promise.all([
        supabase
          .from("worker_profiles")
          .select("id, full_name, mobile, city, city_zone, updated_at, gig_profiles(platform, tenure_months), income_data!income_data_worker_id_fkey(avg_daily_earnings)")
          .eq("onboarding_complete", true),
        getWorkersStatuses()
      ]);

      if (workersRes.error) {
        console.error("Error fetching workers details:", JSON.stringify(workersRes.error, null, 2), workersRes.error);
        return;
      }

      if (workersRes.data) {
        const statuses = statusesRes.success && statusesRes.statuses ? statusesRes.statuses : {};

        const formattedWorkers: Worker[] = workersRes.data.map((w: any) => {
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
          } else if (w.income_data_worker_id_fkey) {
            // In case PostgREST maps the key using the FK name
            const incomeData = Array.isArray(w.income_data_worker_id_fkey) && w.income_data_worker_id_fkey.length > 0
              ? w.income_data_worker_id_fkey[0]
              : w.income_data_worker_id_fkey;

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
            status: statuses[w.id] || "active",
            lastActive: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Just now",
          };
        });
        setWorkers(formattedWorkers.reverse());
      }
    } catch (err) {
      console.error("Failed to load workers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      alert("Please fill all required fields.");
      return;
    }
    
    setAdding(true);
    try {
      const result = await createWorkerProfile(formData);
      if (!result.success) throw new Error(result.message);

      alert("Worker added successfully!");
      setShowModal(false);
      setFormData({
        name: "", email: "", password: "password123", phone: "", platform: "Swiggy", city: "Mathura", zone: "Govardhan", tenure: "0", dailyAvgEarnings: "0"
      });
      fetchWorkers();

    } catch (err: any) {
      console.error("Error adding worker:", err);
      alert(err?.message || "Failed to add worker. See console.");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "active" | "inactive" | "suspended") => {
    try {
      // Optimistically update UI
      setWorkers(workers.map(w => w.id === id ? { ...w, status: newStatus } : w));
      const res = await updateWorkerStatus(id, newStatus);
      if (!res.success) {
        throw new Error(res.message);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to update status.");
      fetchWorkers(); // Revert on failure
    }
  };

  const confirmDeleteWorker = (id: string) => {
    setWorkerToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;
    const id = workerToDelete;
    setShowDeleteModal(false);
    setWorkerToDelete(null);

    try {
      const originalWorkers = [...workers];
      setWorkers(workers.filter(w => w.id !== id));
      const res = await deleteWorkerRecord(id);
      if (!res.success) {
        setWorkers(originalWorkers);
        throw new Error(res.message);
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete worker.");
      fetchWorkers(); // Revert on failure
    }
  };

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
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Partners</h2>
          <p className="text-sm text-gray-400 mt-1">
            {workers.length} registered workers across {uniqueCities} {uniqueCities === 1 ? 'city' : 'cities'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchWorkers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <UserPlus className="w-4 h-4" /> Add Worker
          </button>
        </div>
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
                {["Worker", "Platform", "City / Zone", "Tenure", "Avg. Earnings", "Status", "Last Active", "Actions"].map((h) => (
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
                    <div className="relative inline-block">
                      <select
                        value={w.status}
                        onChange={(e) => handleUpdateStatus(w.id, e.target.value as any)}
                        className={`pr-7 pl-3 py-1.5 rounded-full text-[11px] font-medium appearance-none cursor-pointer border-0 outline-none ${statusColor(w.status)}`}
                      >
                        <option value="active" className="bg-gray-900 text-emerald-400">Active</option>
                        <option value="inactive" className="bg-gray-900 text-amber-500">Inactive</option>
                        <option value="suspended" className="bg-gray-900 text-red-500">Suspended</option>
                      </select>
                      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-80 ${w.status === 'active' ? 'text-emerald-500' : w.status === 'inactive' ? 'text-amber-500' : 'text-red-500'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{w.lastActive}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => confirmDeleteWorker(w.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                      title="Permanently Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Add New Worker</h2>

            <form onSubmit={handleAddWorker} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">FULL NAME</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">MOBILE NUMBER</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">LOGIN EMAIL</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">LOGIN PASSWORD</label>
                <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">PLATFORM</label>
                <input type="text" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">CITY</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">CITY ZONE</label>
                <input type="text" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">TENURE (MONTHS)</label>
                <input type="number" value={formData.tenure} onChange={e => setFormData({...formData, tenure: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-400 mb-1 tracking-wider">AVG. DAILY EARNINGS (₹)</label>
                <input type="number" value={formData.dailyAvgEarnings} onChange={e => setFormData({...formData, dailyAvgEarnings: e.target.value})} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="col-span-2 mt-6">
                <button 
                  type="submit" 
                  disabled={adding}
                  className="w-full shadow-xl flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: adding ? "linear-gradient(135deg, #4f46e5, #6366f1)" : "linear-gradient(135deg, #6366f1, #818cf8)", opacity: adding ? 0.7 : 1 }}
                >
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} 
                  {adding ? "Saving Worker..." : "Add Worker Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow-2xl backdrop-blur-sm p-4">
          <div className="glass-card max-w-sm w-full p-6 text-center transform border border-red-500/20 bg-[#12121a] rounded-2xl relative">
            <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Delete Worker?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This action cannot be undone. It will permanently remove this worker's profile, including their documents, payment info, and gig data.
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setWorkerToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteWorker}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

