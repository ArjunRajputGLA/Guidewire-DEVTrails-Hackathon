"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Plus, Loader2, Shield } from "lucide-react";

export default function PoliciesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase
        .from("insurance_products")
        .select("*")
        .order("base_premium", { ascending: true });
      if (data) setProducts(data);
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

  const tiers = [
    {
      tier: "Starter",
      earnings: "₹2,500 – ₹3,500/wk",
      premium: "₹29/wk",
      payout: "₹1,500 max",
      gradient: "from-gray-500/15 to-gray-600/5",
      border: "border-gray-500/20",
      accent: "#6b7280",
      letter: "#9ca3af",
    },
    {
      tier: "Standard",
      earnings: "₹3,500 – ₹5,500/wk",
      premium: "₹49/wk",
      payout: "₹2,500 max",
      gradient: "from-blue-500/15 to-blue-600/5",
      border: "border-blue-500/20",
      accent: "#3b82f6",
      letter: "#60a5fa",
    },
    {
      tier: "Pro",
      earnings: "₹5,500 – ₹8,000/wk",
      premium: "₹79/wk",
      payout: "₹4,000 max",
      gradient: "from-violet-500/15 to-violet-600/5",
      border: "border-violet-500/20",
      accent: "#8b5cf6",
      letter: "#a78bfa",
    },
  ];

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

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t, i) => (
          <div
            key={t.tier}
            className={`relative rounded-2xl bg-gradient-to-br ${t.gradient} border ${t.border} p-6 hover:scale-[1.02] transition-all duration-200 group overflow-hidden`}
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] -translate-y-8 translate-x-8"
              style={{ background: t.accent }}
            />
            <div
              className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-sm font-bold border"
              style={{
                background: `${t.accent}20`,
                borderColor: `${t.accent}35`,
                color: t.letter,
              }}
            >
              {t.tier[0]}
            </div>
            <h4 className="text-base font-bold text-white mb-1">{t.tier}</h4>
            <p className="text-xs text-gray-500 mb-4">{t.earnings}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{t.premium}</p>
                <p className="text-xs text-gray-600">per week</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: t.letter }}>{t.payout}</p>
                <p className="text-xs text-gray-600">max payout</p>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] opacity-50"
              style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }}
            />
          </div>
        ))}
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
    </div>
  );
}