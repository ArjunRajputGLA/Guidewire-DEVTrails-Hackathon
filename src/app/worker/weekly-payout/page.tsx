// "use client";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase-browser";
// import { IndianRupee, Loader2, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";

// export default function WeeklyPayoutPage() {
//   const [policies, setPolicies] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         setLoading(false);
//         return;
//       }
      
//       const { data: activeRows } = await supabase
//         .from('worker_policies')
//         .select('*, insurance_products(*)')
//         .eq('worker_id', user.id)
//         .eq('status', 'active');
        
//       setPolicies(activeRows || []);
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
//       </div>
//     );
//   }

//   const hasPolicy = policies.length > 0;
//   const premiumAmt = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.base_premium) || 0), 0);
//   const payoutAmt = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.max_payout) || 0), 0);

//   return (
//     <div className="space-y-8 max-w-3xl">
//       <div>
//         <h1 className="text-2xl font-bold text-white">Weekly Payout Dashboard</h1>
//         <p className="text-gray-500 text-sm mt-1">Manage your weekly policy settlements</p>
//       </div>

//       {hasPolicy ? (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
//               <div className="flex items-center justify-between mb-4">
//                  <h2 className="text-sm font-medium text-emerald-400">Next Auto-Deduction</h2>
//                  <Clock className="w-5 h-5 text-emerald-500/50" />
//               </div>
//               <p className="text-3xl font-bold text-white mb-2">₹{premiumAmt}</p>
//               <p className="text-xs text-gray-400">Due coming Sunday, 11:59 PM</p>
//             </div>

//             <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20">
//               <div className="flex items-center justify-between mb-4">
//                  <h2 className="text-sm font-medium text-indigo-400">Max Entitled Payout</h2>
//                  <ArrowUpRight className="w-5 h-5 text-indigo-500/50" />
//               </div>
//               <p className="text-3xl font-bold text-white mb-2">₹{payoutAmt.toLocaleString()}</p>
//               <p className="text-xs text-gray-400">For qualifying parametric triggers</p>
//             </div>
//           </div>
          
//           <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 mt-8">
//             <h3 className="text-lg font-semibold text-white mb-4">Recent Payout History</h3>
            
//             <div className="space-y-4">
//                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
//                   <div className="flex items-center gap-4">
//                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
//                         <CheckCircle2 className="w-5 h-5 text-emerald-500" />
//                      </div>
//                      <div>
//                        <p className="text-sm font-medium text-white">Premium Deduction</p>
//                        <p className="text-xs text-gray-400">Auto-paid via platform deduction</p>
//                      </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-bold text-emerald-400">- ₹{premiumAmt}</p>
//                     <p className="text-xs text-gray-500">Last Sunday</p>
//                   </div>
//                </div>

//                <div className="text-center p-6 border border-dashed border-white/10 rounded-xl">
//                  <p className="text-sm text-gray-500">No recent claims payouts to display.</p>
//                </div>
//             </div>
//           </div>
//         </>
//       ) : (
//         <div className="glass-card p-8 text-center rounded-2xl bg-white/5">
//           <IndianRupee className="w-12 h-12 text-gray-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-white mb-2">No Active Entitlements</h3>
//           <p className="text-gray-500 text-sm">Please set up your policy to view weekly payouts.</p>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { IndianRupee, Loader2, ArrowUpRight, Clock, CheckCircle2, TrendingUp } from "lucide-react";

export default function WeeklyPayoutPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: activeRows } = await supabase
        .from('worker_policies').select('*, insurance_products(*)')
        .eq('worker_id', user.id).eq('status', 'active');
      setPolicies(activeRows || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="wp-loading">
      <Loader2 size={28} className="wp-spin" />
      <style>{payoutStyle}</style>
    </div>
  );

  const hasPolicy = policies.length > 0;
  const premiumAmt = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.base_premium) || 0), 0);
  const payoutAmt  = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.max_payout) || 0), 0);

  // Compute next Sunday
  const nextSunday = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7 || 7);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  })();

  return (
    <div className="wp-wrap">
      <style>{payoutStyle}</style>

      <div className="wp-header">
        <h1 className="wp-title">Weekly Payout</h1>
        <p className="wp-subtitle">Your premium schedule and payout entitlements</p>
      </div>

      {hasPolicy ? (
        <>
          {/* Top stat cards */}
          <div className="wp-cards-row">
            <div className="wp-card wp-card--emerald">
              <div className="wp-card-label">
                <Clock size={14} />
                <span>Next Auto-Deduction</span>
              </div>
              <p className="wp-card-amount">₹{premiumAmt}</p>
              <p className="wp-card-sub">Due {nextSunday}, 11:59 PM</p>
              <div className="wp-card-glow wp-card-glow--emerald" />
            </div>

            <div className="wp-card wp-card--indigo">
              <div className="wp-card-label">
                <ArrowUpRight size={14} />
                <span>Max Entitled Payout</span>
              </div>
              <p className="wp-card-amount">₹{payoutAmt.toLocaleString('en-IN')}</p>
              <p className="wp-card-sub">For qualifying parametric triggers</p>
              <div className="wp-card-glow wp-card-glow--indigo" />
            </div>

            <div className="wp-card wp-card--amber">
              <div className="wp-card-label">
                <TrendingUp size={14} />
                <span>Coverage Ratio</span>
              </div>
              <p className="wp-card-amount">{premiumAmt > 0 ? (payoutAmt / premiumAmt).toFixed(0) : '—'}×</p>
              <p className="wp-card-sub">Payout per rupee of premium</p>
              <div className="wp-card-glow wp-card-glow--amber" />
            </div>
          </div>

          {/* Active policies breakdown */}
          <div className="wp-section-card">
            <h3 className="wp-section-title">Active Coverage Breakdown</h3>
            <div className="wp-breakdown-list">
              {policies.map((p) => {
                const product = p.insurance_products;
                if (!product) return null;
                return (
                  <div key={p.id} className="wp-breakdown-row">
                    <div className="wp-breakdown-info">
                      <p className="wp-breakdown-name">{product.name}</p>
                      <p className="wp-breakdown-tier">{product.tier}</p>
                    </div>
                    <div className="wp-breakdown-amounts">
                      <span className="wp-breakdown-premium">−₹{product.base_premium}/wk</span>
                      <span className="wp-breakdown-payout">up to ₹{Number(product.max_payout).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
              <div className="wp-breakdown-total">
                <span>Total weekly cost</span>
                <span className="wp-total-amount">₹{premiumAmt}</span>
              </div>
            </div>
          </div>

          {/* Payout history */}
          <div className="wp-section-card">
            <h3 className="wp-section-title">Recent Payout History</h3>
            <div className="wp-history-list">
              <div className="wp-history-item">
                <div className="wp-history-icon wp-history-icon--green">
                  <CheckCircle2 size={16} />
                </div>
                <div className="wp-history-info">
                  <p className="wp-history-name">Premium Deduction</p>
                  <p className="wp-history-sub">Auto-paid via platform deduction · Last Sunday</p>
                </div>
                <span className="wp-history-amount wp-history-amount--debit">−₹{premiumAmt}</span>
              </div>

              <div className="wp-history-empty">
                <IndianRupee size={18} style={{ opacity: 0.3 }} />
                <p>No claim payouts yet. Triggered payouts will appear here.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="wp-empty">
          <div className="wp-empty-icon">
            <IndianRupee size={28} />
          </div>
          <h3>No Active Entitlements</h3>
          <p>Set up your policy to view weekly payout details.</p>
        </div>
      )}
    </div>
  );
}

const payoutStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
  .wp-wrap { font-family: 'Sora', sans-serif; max-width: 780px; animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

  .wp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #34d399; font-family: 'Sora', sans-serif; }
  .wp-spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .wp-header { margin-bottom: 28px; }
  .wp-title { margin: 0 0 5px; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.025em; }
  .wp-subtitle { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }

  /* Cards row */
  .wp-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
  .wp-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px; padding: 22px 22px 18px;
    position: relative; overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .wp-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
  .wp-card--emerald { border-color: rgba(52,211,153,0.15); }
  .wp-card--indigo  { border-color: rgba(129,140,248,0.15); }
  .wp-card--amber   { border-color: rgba(251,191,36,0.15); }

  .wp-card-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    margin-bottom: 14px;
  }
  .wp-card--emerald .wp-card-label { color: #34d399; }
  .wp-card--indigo  .wp-card-label { color: #818cf8; }
  .wp-card--amber   .wp-card-label { color: #fbbf24; }

  .wp-card-amount { margin: 0 0 6px; font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -0.03em; z-index: 1; position: relative; }
  .wp-card-sub { margin: 0; font-size: 12px; color: rgba(255,255,255,0.35); z-index: 1; position: relative; }

  .wp-card-glow {
    position: absolute; bottom: -20px; right: -20px;
    width: 100px; height: 100px; border-radius: 50%; filter: blur(30px); opacity: 0.3; pointer-events: none;
  }
  .wp-card-glow--emerald { background: #34d399; }
  .wp-card-glow--indigo  { background: #818cf8; }
  .wp-card-glow--amber   { background: #fbbf24; }

  /* Section cards */
  .wp-section-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px; margin-bottom: 14px;
  }
  .wp-section-title { margin: 0 0 18px; font-size: 15px; font-weight: 600; color: #fff; }

  /* Breakdown */
  .wp-breakdown-list { display: flex; flex-direction: column; }
  .wp-breakdown-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .wp-breakdown-name { margin: 0 0 3px; font-size: 14px; font-weight: 500; color: #fff; }
  .wp-breakdown-tier { margin: 0; font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; }
  .wp-breakdown-amounts { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .wp-breakdown-premium { font-size: 13px; font-weight: 600; color: #f87171; }
  .wp-breakdown-payout { font-size: 12px; color: rgba(255,255,255,0.35); }
  .wp-breakdown-total {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0 0; font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 500;
  }
  .wp-total-amount { font-size: 18px; font-weight: 700; color: #fff; }

  /* History */
  .wp-history-list { display: flex; flex-direction: column; gap: 10px; }
  .wp-history-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; background: rgba(255,255,255,0.03); border-radius: 13px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .wp-history-icon {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .wp-history-icon--green { background: rgba(52,211,153,0.1); color: #34d399; }
  .wp-history-info { flex: 1; }
  .wp-history-name { margin: 0 0 3px; font-size: 14px; font-weight: 500; color: #fff; }
  .wp-history-sub { margin: 0; font-size: 12px; color: rgba(255,255,255,0.35); }
  .wp-history-amount { font-size: 15px; font-weight: 700; flex-shrink: 0; }
  .wp-history-amount--debit { color: #4ade80; }

  .wp-history-empty {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 28px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 13px;
    color: rgba(255,255,255,0.35); font-size: 13px; text-align: center;
  }
  .wp-history-empty p { margin: 0; }

  /* Empty state */
  .wp-empty {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 64px 24px; background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.08); border-radius: 20px; text-align: center;
  }
  .wp-empty-icon {
    width: 60px; height: 60px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 18px;
    display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.25);
  }
  .wp-empty h3 { margin: 0; font-size: 17px; font-weight: 600; color: #fff; }
  .wp-empty p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.4); }

  @media (max-width: 700px) {
    .wp-cards-row { grid-template-columns: 1fr; }
  }
`