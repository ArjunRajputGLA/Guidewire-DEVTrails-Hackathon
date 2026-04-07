"use client";
import {
  Search, Filter, UserPlus, Loader2, Plus, X, RefreshCw, Trash2,
  AlertTriangle, ChevronDown, Users
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { createWorkerProfile, getWorkersStatuses, updateWorkerStatus, deleteWorkerRecord } from "./actions";

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  platform: string;
  city: string;
  zone: string;
  tenure: number;
  dailyAvgEarnings: number;
  status: "active" | "inactive" | "suspended";
  lastActive: string;
  coverageText: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "password123", phone: "",
    platform: "Swiggy", city: "Mathura", zone: "Govardhan", tenure: "0", dailyAvgEarnings: "0",
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const [workersRes, statusesRes] = await Promise.all([
        supabase
          .from("worker_profiles")
          .select("id, full_name, mobile, city, city_zone, updated_at, gig_profiles(platform, tenure_months), income_data!income_data_worker_id_fkey(avg_daily_earnings), worker_policies(status, insurance_products(tier))")
          .eq("onboarding_complete", true),
        getWorkersStatuses(),
      ]);

      if (workersRes.error) { console.error("Error fetching workers:", workersRes.error); return; }

      if (workersRes.data) {
        const statuses = statusesRes.success && statusesRes.statuses ? statusesRes.statuses : {};
        const emails = statusesRes.success && statusesRes.emails ? statusesRes.emails : {};
        const formattedWorkers: Worker[] = workersRes.data.map((w: any) => {
          let platformValue = "N/A", tenureValue = 0, earningsValue = 0;
          if (w.gig_profiles) {
            const gp = Array.isArray(w.gig_profiles) ? w.gig_profiles[0] : w.gig_profiles;
            platformValue = gp?.platform || "N/A";
            tenureValue = gp?.tenure_months || 0;
          }
          if (w.income_data) {
            const id = Array.isArray(w.income_data) ? w.income_data[0] : w.income_data;
            earningsValue = id?.avg_daily_earnings || 0;
          } else if (w.income_data_worker_id_fkey) {
            const id = Array.isArray(w.income_data_worker_id_fkey) ? w.income_data_worker_id_fkey[0] : w.income_data_worker_id_fkey;
            earningsValue = id?.avg_daily_earnings || 0;
          }
          let coverageText = "None";
          if (w.worker_policies && Array.isArray(w.worker_policies)) {
            const activePols = w.worker_policies.filter((p: any) => p.status === "active" && p.insurance_products);
            if (activePols.length > 0) {
              const basePln = activePols.find((p: any) => ["Starter", "Standard", "Pro"].includes(p.insurance_products?.tier));
              const baseTier = basePln ? basePln.insurance_products.tier : activePols[0].insurance_products?.tier || "Custom";
              const addOnCount = activePols.length - (basePln ? 1 : 0);
              coverageText = `${baseTier}${addOnCount > 0 ? ` + ${addOnCount} Add-on${addOnCount > 1 ? "s" : ""}` : ""}`;
            }
          }
          return {
            id: w.id, name: w.full_name || "Unknown", email: emails[w.id] || "N/A", phone: w.mobile || "N/A",
            platform: platformValue, city: w.city || "Unknown", zone: w.city_zone || "-",
            tenure: tenureValue, dailyAvgEarnings: earningsValue,
            status: statuses[w.id] || "active",
            lastActive: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Just now",
            coverageText,
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
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearch(q);
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      alert("Please fill all required fields."); return;
    }
    setAdding(true);
    try {
      const result = await createWorkerProfile(formData);
      if (!result.success) throw new Error(result.message);
      alert("Worker added successfully!");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "password123", phone: "", platform: "Swiggy", city: "Mathura", zone: "Govardhan", tenure: "0", dailyAvgEarnings: "0" });
      fetchWorkers();
    } catch (err: any) {
      alert(err?.message || "Failed to add worker.");
    } finally { setAdding(false); }
  };

  const handleUpdateStatus = async (id: string, newStatus: "active" | "inactive" | "suspended") => {
    try {
      setWorkers(workers.map((w) => (w.id === id ? { ...w, status: newStatus } : w)));
      const res = await updateWorkerStatus(id, newStatus);
      if (!res.success) throw new Error(res.message);
    } catch (err: any) {
      alert(err?.message || "Failed to update status.");
      fetchWorkers();
    }
  };

  const confirmDeleteWorker = (id: string) => { setWorkerToDelete(id); setShowDeleteModal(true); };
  const handleDeleteWorker = async () => {
    if (!workerToDelete) return;
    const id = workerToDelete;
    setShowDeleteModal(false);
    setWorkerToDelete(null);
    try {
      const originalWorkers = [...workers];
      setWorkers(workers.filter((w) => w.id !== id));
      const res = await deleteWorkerRecord(id);
      if (!res.success) { setWorkers(originalWorkers); throw new Error(res.message); }
    } catch (err: any) {
      alert(err?.message || "Failed to delete worker.");
      fetchWorkers();
    }
  };

  const filtered = workers.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
      w.city.toLowerCase().includes(search.toLowerCase()) || 
      w.phone.includes(search);
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const uniqueCities = new Set(workers.map((w) => w.city)).size;

  const statusStyle = (s: string) => {
    if (s === "active") return { select: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-400" };
    if (s === "inactive") return { select: "text-amber-400 bg-amber-500/10", dot: "bg-amber-400" };
    return { select: "text-red-400 bg-red-500/10", dot: "bg-red-400" };
  };

  const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  const avatarGradients = [
    "from-indigo-500 to-violet-500",
    "from-blue-500 to-indigo-500",
    "from-violet-500 to-purple-500",
    "from-emerald-500 to-teal-500",
  ];

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Delivery Partners</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            {workers.length} registered workers across {uniqueCities} {uniqueCities === 1 ? "city" : "cities"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 bg-white/5 border border-white/10 hover:bg-white/8 hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
          >
            <UserPlus className="w-4 h-4" />
            Add Worker
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-700" />
          {["all", "active", "inactive", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                statusFilter === s
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-white/5 text-gray-600 border border-transparent hover:bg-white/8 hover:text-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden min-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
            <p className="text-sm">Loading worker profiles...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <UserPlus className="w-10 h-10 text-gray-800 mb-3" />
            <p className="text-sm font-medium text-gray-500">No workers found</p>
            <p className="text-xs text-gray-700 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Worker", "Platform", "City / Zone", "Avg. Earnings", "Coverage", "Status", "Last Active", ""].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => {
                const ss = statusStyle(w.status);
                const gradient = avatarGradients[i % avatarGradients.length];
                return (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedWorker(w)}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors duration-150 group cursor-pointer"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${gradient} flex-shrink-0`}
                        >
                          {getInitials(w.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{w.name}</p>
                          <p className="text-xs text-gray-600 font-mono">{w.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/8 font-medium">
                        {w.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white">{w.city}</p>
                      <p className="text-xs text-gray-600">{w.zone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-emerald-400">₹{w.dailyAvgEarnings}</p>
                      <p className="text-[10px] text-gray-700">per day</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          w.coverageText === "None"
                            ? "bg-gray-500/10 text-gray-600 border border-gray-500/15"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}
                      >
                        {w.coverageText !== "None" && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                        {w.coverageText}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={w.status}
                          onChange={(e) => handleUpdateStatus(w.id, e.target.value as any)}
                          className={`pr-7 pl-3 py-1.5 rounded-full text-[11px] font-bold appearance-none cursor-pointer border-0 outline-none ${ss.select}`}
                        >
                          <option value="active" className="bg-gray-900 text-emerald-400">Active</option>
                          <option value="inactive" className="bg-gray-900 text-amber-400">Inactive</option>
                          <option value="suspended" className="bg-gray-900 text-red-400">Suspended</option>
                        </select>
                        <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${ss.select.split(" ")[0]}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-mono">{w.lastActive}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteWorker(w.id);
                        }}
                        className="p-2 text-gray-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Permanently Delete Worker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Worker Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0d0d18] border border-white/10 p-7 rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Add New Worker</h2>
                <p className="text-xs text-gray-600">Fill in the worker's profile details</p>
              </div>
            </div>

            <form onSubmit={handleAddWorker} className="grid grid-cols-2 gap-4">
              {[
                { key: "name", label: "FULL NAME", type: "text", required: true },
                { key: "phone", label: "MOBILE NUMBER", type: "text", required: true },
                { key: "email", label: "LOGIN EMAIL", type: "email", required: true },
                { key: "password", label: "LOGIN PASSWORD", type: "text", required: true },
                { key: "platform", label: "PLATFORM", type: "text" },
                { key: "city", label: "CITY", type: "text" },
                { key: "zone", label: "CITY ZONE", type: "text" },
                { key: "tenure", label: "TENURE (MONTHS)", type: "number" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1.5 tracking-widest">{f.label}</label>
                  <input
                    required={f.required}
                    type={f.type}
                    value={(formData as any)[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all duration-200 placeholder:text-gray-700"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1.5 tracking-widest">AVG. DAILY EARNINGS (₹)</label>
                <input
                  type="number"
                  value={formData.dailyAvgEarnings}
                  onChange={(e) => setFormData({ ...formData, dailyAvgEarnings: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all duration-200"
                />
              </div>

              <div className="col-span-2 mt-3">
                <button
                  type="submit"
                  disabled={adding}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
                >
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {adding ? "Saving Worker..." : "Add Worker Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0d0d18] max-w-sm w-full p-7 text-center rounded-2xl border border-red-500/20 shadow-2xl">
            <div className="w-14 h-14 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-5">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Worker?</h3>
            <p className="text-sm text-gray-500 mb-7 leading-relaxed">
              This action cannot be undone. It will permanently remove this worker's profile, documents, and all associated data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setWorkerToDelete(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/8 hover:text-white transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorker}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Worker Modal */}
      {selectedWorker && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 animate-in fade-in" 
          onClick={() => setSelectedWorker(null)}
        >
          <div 
            className="bg-[#0b0b14] border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] relative overflow-hidden transition-transform duration-300 animate-in zoom-in-95" 
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <button
              onClick={() => setSelectedWorker(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className={`w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-indigo-500 to-violet-500 border border-white/10`}>
                {getInitials(selectedWorker.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black text-white truncate mb-1">{selectedWorker.name}</h3>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-indigo-300 font-medium truncate">{selectedWorker.email}</p>
                  <p className="text-xs text-gray-400 font-mono tracking-wider">{selectedWorker.phone}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Platform</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <p className="text-sm text-gray-200 font-semibold">{selectedWorker.platform}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Location</p>
                <p className="text-sm text-gray-200 font-semibold leading-tight">{selectedWorker.city}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{selectedWorker.zone}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Tenure</p>
                <p className="text-sm text-gray-200 font-semibold">{selectedWorker.tenure} <span className="text-gray-500 font-normal">months</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Avg Daily Earnings</p>
                <p className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">₹{selectedWorker.dailyAvgEarnings}</p>
              </div>
              <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-indigo-300/70 font-medium mb-1.5 uppercase tracking-wider">Coverage Plan</p>
                    <p className="text-base text-indigo-300 font-bold">{selectedWorker.coverageText}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Status</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      selectedWorker.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      selectedWorker.status === 'inactive' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedWorker.status === 'active' ? 'bg-emerald-400' : 
                        selectedWorker.status === 'inactive' ? 'bg-amber-400' : 'bg-red-400'
                      }`}></span>
                      <span className="capitalize">{selectedWorker.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">Last active: <span className="text-gray-400">{selectedWorker.lastActive}</span></p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end relative z-10">
              <button
                onClick={() => setSelectedWorker(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}