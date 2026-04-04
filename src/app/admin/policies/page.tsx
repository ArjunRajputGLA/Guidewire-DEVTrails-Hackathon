"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Plus, Loader2 } from "lucide-react";

export default function PoliciesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase
        .from('insurance_products')
        .select('*')
        .order('base_premium', { ascending: true });
        
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchCatalog();
  }, []);

  const tierColor = (t: string) => {
    if (!t) return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
    const lower = t.toLowerCase();
    if (lower === "pro") return "bg-purple-500/15 text-purple-400 border border-purple-500/20";
    if (lower === "standard") return "bg-blue-500/15 text-blue-400 border border-blue-500/20";
    if (lower === "add-on") return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
    return "bg-gray-500/15 text-gray-400 border border-gray-500/20";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Insurance Catalog</h2>
          <p className="text-sm text-gray-400 mt-1">Manage all available income protection policies and add-ons</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      {/* Premium Tier Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { tier: "Starter", earnings: "₹2,500 – ₹3,500/wk", premium: "₹29/wk", payout: "₹1,500 max", color: "#6b7280" },
          { tier: "Standard", earnings: "₹3,500 – ₹5,500/wk", premium: "₹49/wk", payout: "₹2,500 max", color: "#3b82f6" },
          { tier: "Pro", earnings: "₹5,500 – ₹8,000/wk", premium: "₹79/wk", payout: "₹4,000 max", color: "#8b5cf6" },
        ].map((t) => (
          <div key={t.tier} className="glass-card p-5 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
              style={{ background: t.color }}>{t.tier[0]}</div>
            <h4 className="text-white font-semibold">{t.tier}</h4>
            <p className="text-xs text-gray-500 mt-1">{t.earnings}</p>
            <p className="text-lg font-bold text-white mt-2">{t.premium}</p>
            <p className="text-xs text-gray-500">{t.payout}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent">
             <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Product ID", "Name", "Tier", "Base Premium", "Max Payout", "Features", "Status"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const shortId = p.id.split('-')[0].toUpperCase();
                
                return (
                  <tr key={p.id} className="border-b border-white/3 hover:bg-white/3 transition-colors"
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="px-6 py-4 text-sm font-mono text-indigo-400">PROD-{shortId}</td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${tierColor(p.tier)}`}>{p.tier || 'Custom'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-400">₹{p.base_premium || 0}/wk</td>
                    <td className="px-6 py-4 text-sm text-gray-300">₹{Number(p.max_payout || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                      {p.features && p.features.length > 0 ? p.features.join(', ') : p.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${p.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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
