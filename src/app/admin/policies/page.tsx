"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Plus, Loader2, Shield, Search } from "lucide-react";
import { fetchWorkerPoliciesAction } from "./actions";

export default function PoliciesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [workerPolicies, setWorkerPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase
        .from("insurance_products")
        .select("*")
        .order("base_premium", { ascending: true });
      if (data) setProducts(data);
      
      const response = await fetchWorkerPoliciesAction();
      if (response && response.success && response.data) {
        setWorkerPolicies(response.data);
      }
      
      setLoading(false);
    };
    fetchCatalog();
  }, []);

  const tierColor = (t: string) => {
    if (!t) return { badge: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" };
    const lower = t.toLowerCase();
    if (lower === "pro") return { badge: "bg-violet-500/10 text-violet-400 border border-violet-500/20", dot: "#8b5cf6" };
    if (lower === "standard") return { badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20", dot: "#3b82f6" };
    if (lower === "add-on") return { badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", dot: "#22c55e" };
    return { badge: "bg-gray-500/10 text-gray-400 border border-gray-500/20", dot: "#6b7280" };
  };

  const filteredWorkerPolicies = workerPolicies.filter((wp) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const workerName = (wp.worker_profiles?.full_name || "").toLowerCase();
    const workerMobile = (wp.worker_profiles?.mobile || "").toLowerCase();
    const policyName = (wp.insurance_products?.name || "").toLowerCase();
    return workerName.includes(term) || workerMobile.includes(term) || policyName.includes(term);
  });

  const groupedPolicies = Object.entries(
    filteredWorkerPolicies.reduce((acc, wp) => {
      const mobile = wp.worker_profiles?.mobile || "Unknown Phone";
      if (!acc[mobile]) {
        acc[mobile] = {
          worker: wp.worker_profiles,
          policies: [],
        };
      }
      acc[mobile].policies.push(wp);
      return acc;
    }, {} as Record<string, { worker: any; policies: any[] }>)
  ).map(([mobile, data]) => ({ 
    mobile, 
    worker: data.worker, 
    policies: data.policies 
  }));


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Insurance Catalog</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">Manage income protection policies and add-ons</p>
        </div>
        <button
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          Create Policy
        </button>
      </div>

      {/* Tier Cards - Dynamically rendered for base policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.filter(p => ["Starter", "Standard", "Pro"].includes(p.tier) && p.is_active).map((p, i) => {
          
          let gradient = "from-gray-500/15 to-gray-600/5";
          let border = "border-gray-500/20";
          let accent = "#6b7280";
          let letter = "#9ca3af";
          
          if (p.tier === "Pro") {
            gradient = "from-violet-500/15 to-violet-600/5"; border = "border-violet-500/20"; accent = "#8b5cf6"; letter = "#a78bfa";
          } else if (p.tier === "Standard") {
            gradient = "from-blue-500/15 to-blue-600/5"; border = "border-blue-500/20"; accent = "#3b82f6"; letter = "#60a5fa";
          }
          
          return (
            <div
              key={p.id}
              className={`relative rounded-2xl bg-gradient-to-br ${gradient} border ${border} p-6 hover:scale-[1.02] transition-all duration-200 group overflow-hidden`}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] -translate-y-8 translate-x-8"
                style={{ background: accent }}
              />
              <div
                className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-sm font-bold border"
                style={{
                  background: `${accent}20`,
                  borderColor: `${accent}35`,
                  color: letter,
                }}
              >
                {p.tier[0]}
              </div>
              <h4 className="text-base font-bold text-white mb-1">{p.tier} Policy</h4>
              <p className="text-xs text-gray-500 mb-4">{p.description || "Income Protection"}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">₹{p.base_premium}</p>
                  <p className="text-xs text-gray-600">per week</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: letter }}>₹{Number(p.max_payout).toLocaleString()} max</p>
                  <p className="text-xs text-gray-600">max payout</p>
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-50"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
              />
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              <p className="text-sm text-gray-600">Loading insurance catalog...</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Product ID", "Name", "Tier", "Base Premium", "Max Payout", "Features", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const shortId = p.id.split("-")[0].toUpperCase();
                const tc = tierColor(p.tier);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors duration-150 group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/15">
                        PROD-{shortId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${tc.badge}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tc.dot }} />
                        {p.tier || "Custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-400">₹{p.base_premium || 0}</span>
                      <span className="text-xs text-gray-600">/wk</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-medium">
                      ₹{Number(p.max_payout || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                      {p.features && p.features.length > 0 ? p.features.join(", ") : p.description || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          p.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.is_active ? "bg-emerald-400" : "bg-red-400"
                          } ${p.is_active ? "animate-pulse" : ""}`}
                        />
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-600 text-sm">
                    No insurance products found in database catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Worker Active Policies */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Active Worker Subscriptions</h3>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <input
              type="text"
              placeholder="Search workers, phones, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all z-0"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : groupedPolicies.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl py-12 text-center text-gray-500 text-sm">
              {searchQuery ? "No matches found for your search." : "No active worker subscriptions found."}
            </div>
          ) : (
            groupedPolicies.map((group, groupIdx) => (
              <div 
                key={group.mobile} 
                className="rounded-2xl bg-white/[0.03] border border-white/[0.07] overflow-hidden"
                style={{ animationDelay: `${groupIdx * 40}ms` }}
              >
                {/* Group Header */}
                <div className="bg-white/[0.02] px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center border border-indigo-500/20 text-indigo-300 font-bold">
                      {(group.worker?.full_name?.[0] || "?").toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {group.worker?.full_name || "Unknown Worker"}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono bg-white/5 px-1.5 py-0.5 rounded mt-0.5 w-max">
                        {group.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">Total Subscriptions</p>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {group.policies.length} {group.policies.length === 1 ? 'Policy' : 'Policies'}
                    </span>
                  </div>
                </div>

                {/* Group Policies Table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {["Policy / Add-on", "Tier", "Enrolled Date"].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-black/20">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.policies.map((wp: any, i: number) => {
                      const tc = tierColor(wp.insurance_products?.tier);
                      const enrolledDate = new Date(wp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      
                      return (
                        <tr key={wp.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3.5 text-sm font-medium text-gray-200">
                            {wp.insurance_products?.name || "Unknown Policy"}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${tc.badge}`}>
                              {wp.insurance_products?.tier || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-xs text-gray-500">
                            {enrolledDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}