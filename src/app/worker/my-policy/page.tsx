// "use client";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase-browser";
// import { ShieldCheck, Calendar, IndianRupee, Zap, Loader2, PlusCircle, Check } from "lucide-react";

// export default function MyPolicyPage() {
//   const [activePolicies, setActivePolicies] = useState<any[]>([]);
//   const [availableAddons, setAvailableAddons] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState<string | null>(null);

//   const fetchData = async () => {
//     setLoading(true);
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       setLoading(false);
//       return;
//     }
//     setUserId(user.id);
    
//     // Fetch active policies for user
//     const { data: activeRows } = await supabase
//       .from('worker_policies')
//       .select('*, insurance_products(*)')
//       .eq('worker_id', user.id)
//       .eq('status', 'active')
//       .order('created_at', { ascending: true });
      
//     const policies = activeRows || [];
//     setActivePolicies(policies);

//     // Fetch all add-ons
//     const { data: addons } = await supabase
//       .from('insurance_products')
//       .select('*')
//       .eq('tier', 'Add-on')
//       .eq('is_active', true);
      
//     // Filter out add-ons that the user already has active
//     const activeProductIds = policies.map(p => p.policy_id);
//     const available = (addons || []).filter(addon => !activeProductIds.includes(addon.id));
    
//     setAvailableAddons(available);
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleAddPolicy = async (productId: string) => {
//     if (!userId) return;
    
//     const { error } = await supabase.from('worker_policies').insert({
//       worker_id: userId,
//       policy_id: productId,
//       status: 'active'
//     });
    
//     if (!error) {
//       fetchData(); // refresh data
//     } else {
//       alert("Failed to add policy: " + error.message);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
//       </div>
//     );
//   }

//   const primaryPolicyRow = activePolicies.find(p => ['Starter', 'Standard', 'Pro'].includes(p.insurance_products?.tier)) || activePolicies[0];
//   const hasPolicy = !!primaryPolicyRow;
  
//   const tierColors: any = {
//     Starter: { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/30" },
//     Standard: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" },
//     Pro: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
//     'Add-on': { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" }
//   };

//   return (
//     <div className="space-y-8 max-w-3xl">
//       <div>
//         <h1 className="text-2xl font-bold text-white">My Policy</h1>
//         <p className="text-gray-500 text-sm mt-1">Your current income protection plan and add-ons</p>
//       </div>

//       {hasPolicy ? (
//         <div className="space-y-6">
//           {activePolicies.map((row) => {
//             const product = row.insurance_products;
//             const colors = tierColors[product.tier] || tierColors.Standard;
//             const startDate = new Date(row.start_date || row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//             // mock end date as 1 month from start for display
//             const endDate = new Date(new Date(row.start_date || row.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
//             return (
//               <div key={row.id} className="space-y-4">
//                 <div className={`glass-card p-8 border-l-4 ${colors.border} rounded-2xl bg-white/5`}>
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
//                       <ShieldCheck className={`w-6 h-6 ${colors.text}`} />
//                     </div>
//                     <div>
//                       <h2 className="text-xl font-bold text-white">{product.name}</h2>
//                       <span className="status-badge text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded inline-block mt-1">
//                         Active
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div className="p-4 rounded-xl bg-white/5">
//                       <div className="flex items-center gap-2 mb-2">
//                         <IndianRupee className="w-4 h-4 text-gray-500" />
//                         <p className="text-xs text-gray-500 uppercase tracking-wider">Weekly Premium</p>
//                       </div>
//                       <p className="text-2xl font-bold text-white">₹{product.base_premium}</p>
//                     </div>

//                     <div className="p-4 rounded-xl bg-white/5">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Zap className="w-4 h-4 text-gray-500" />
//                         <p className="text-xs text-gray-500 uppercase tracking-wider">Max Payout</p>
//                       </div>
//                       <p className="text-2xl font-bold text-white">₹{Number(product.max_payout).toLocaleString('en-IN')}</p>
//                     </div>

//                     <div className="p-4 rounded-xl bg-white/5">
//                       <div className="flex items-center gap-2 mb-2">
//                         <Calendar className="w-4 h-4 text-gray-500" />
//                         <p className="text-xs text-gray-500 uppercase tracking-wider">Valid Until</p>
//                       </div>
//                       <p className="text-2xl font-bold text-white">{endDate}</p>
//                     </div>
//                   </div>
                  
//                   {product.features && product.features.length > 0 && (
//                     <div className="mt-6 pt-6 border-t border-white/5">
//                        <h4 className="text-sm font-medium text-gray-400 mb-3">Covered Events:</h4>
//                        <div className="flex flex-wrap gap-2">
//                          {product.features.map((feature: string, idx: number) => (
//                            <span key={idx} className="text-xs px-3 py-1 bg-white/5 text-gray-300 rounded-full border border-white/10">
//                              {feature}
//                            </span>
//                          ))}
//                        </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       ) : (
//         <div className="glass-card p-8 text-center rounded-2xl bg-white/5">
//           <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-white mb-2">No Active Policy</h3>
//           <p className="text-gray-500 text-sm">You don't have an active policy. Complete your onboarding to get started.</p>
//         </div>
//       )}

//       {/* ADD POLICY SECTION */}
//       <div className="mt-12 pt-8 border-t border-white/10">
//         <div className="flex items-center justify-between mb-6">
//            <div>
//              <h2 className="text-xl font-bold text-white">Explore Add-ons</h2>
//              <p className="text-gray-500 text-sm">Enhance your protection with extra coverage</p>
//            </div>
//         </div>
        
//         {availableAddons.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//              {availableAddons.map((addon) => (
//                <div key={addon.id} className="glass-card p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
//                   <div className="flex justify-between items-start mb-2">
//                      <h3 className="text-md font-bold text-white">{addon.name}</h3>
//                      <span className="text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">₹{addon.base_premium} / week</span>
//                   </div>
//                   <p className="text-sm text-gray-400 mb-4">{addon.description}</p>
//                   <button 
//                     onClick={() => handleAddPolicy(addon.id)} 
//                     className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm transition-colors border border-emerald-500/20 hover:border-emerald-500/40"
//                   >
//                      Add to Plan
//                   </button>
//                </div>
//              ))}
//           </div>
//         ) : (
//           <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5 text-gray-400 text-sm">
//             You currently have all available add-ons active!
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { ShieldCheck, Calendar, IndianRupee, Zap, Loader2, PlusCircle, Check, Sparkles } from "lucide-react";

export default function MyPolicyPage() {
  const [activePolicies, setActivePolicies] = useState<any[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data: activeRows } = await supabase
      .from('worker_policies').select('*, insurance_products(*)')
      .eq('worker_id', user.id).eq('status', 'active').order('created_at', { ascending: true });

    const policies = activeRows || [];
    setActivePolicies(policies);

    const { data: addons } = await supabase
      .from('insurance_products').select('*').eq('tier', 'Add-on').eq('is_active', true);

    const activeProductIds = policies.map(p => p.policy_id);
    setAvailableAddons((addons || []).filter(addon => !activeProductIds.includes(addon.id)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPolicy = async (productId: string) => {
    if (!userId) return;
    setAddingId(productId);
    const { error } = await supabase.from('worker_policies').insert({
      worker_id: userId, policy_id: productId, status: 'active'
    });
    if (!error) fetchData();
    else alert("Failed to add policy: " + error.message);
    setAddingId(null);
  };

  if (loading) return (
    <div className="mp-loading">
      <Loader2 size={28} className="mp-spin" />
      <style>{policyStyle}</style>
    </div>
  );

  const primaryPolicyRow = activePolicies.find(p => ['Starter', 'Standard', 'Pro'].includes(p.insurance_products?.tier)) || activePolicies[0];
  const hasPolicy = !!primaryPolicyRow;

  const TIER_THEMES: Record<string, { accent: string; glow: string; badge: string }> = {
    Starter:  { accent: '#94a3b8', glow: 'rgba(148,163,184,0.15)', badge: '#64748b' },
    Standard: { accent: '#818cf8', glow: 'rgba(129,140,248,0.15)', badge: '#4f46e5' },
    Pro:      { accent: '#fbbf24', glow: 'rgba(251,191,36,0.15)',  badge: '#d97706' },
    'Add-on': { accent: '#34d399', glow: 'rgba(52,211,153,0.12)',  badge: '#059669' },
  };

  return (
    <div className="mp-wrap">
      <style>{policyStyle}</style>

      <div className="mp-page-header">
        <h1 className="mp-title">My Policy</h1>
        <p className="mp-subtitle">Your income protection coverage and add-ons</p>
      </div>

      {hasPolicy ? (
        <div className="mp-policies">
          {activePolicies.map((row) => {
            const product = row.insurance_products;
            const theme = TIER_THEMES[product.tier] || TIER_THEMES.Standard;
            const startDate = new Date(row.start_date || row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const endDate = new Date(new Date(row.start_date || row.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            return (
              <div key={row.id} className="mp-policy-card" style={{ '--accent': theme.accent, '--glow': theme.glow } as any}>
                <div className="mp-policy-header">
                  <div className="mp-policy-icon-wrap">
                    <ShieldCheck size={20} style={{ color: theme.accent }} />
                  </div>
                  <div className="mp-policy-name-row">
                    <h2 className="mp-policy-name">{product.name}</h2>
                    <span className="mp-active-badge">● Active</span>
                  </div>
                  <span className="mp-tier-chip" style={{ background: theme.badge + '22', color: theme.accent, border: `1px solid ${theme.badge}44` }}>
                    {product.tier}
                  </span>
                </div>

                <div className="mp-policy-stats">
                  <div className="mp-stat">
                    <div className="mp-stat-icon"><IndianRupee size={15} /></div>
                    <p className="mp-stat-label">Weekly Premium</p>
                    <p className="mp-stat-val">₹{product.base_premium}</p>
                  </div>
                  <div className="mp-stat-divider" />
                  <div className="mp-stat">
                    <div className="mp-stat-icon"><Zap size={15} /></div>
                    <p className="mp-stat-label">Max Payout</p>
                    <p className="mp-stat-val">₹{Number(product.max_payout).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="mp-stat-divider" />
                  <div className="mp-stat">
                    <div className="mp-stat-icon"><Calendar size={15} /></div>
                    <p className="mp-stat-label">Valid Until</p>
                    <p className="mp-stat-val">{endDate}</p>
                  </div>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="mp-features">
                    <p className="mp-features-label">Covered Events</p>
                    <div className="mp-features-list">
                      {product.features.map((feature: string, idx: number) => (
                        <span key={idx} className="mp-feature-chip">
                          <Check size={11} style={{ opacity: 0.7 }} /> {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mp-empty-card">
          <ShieldCheck size={36} className="mp-empty-icon" />
          <h3>No Active Policy</h3>
          <p>Complete your onboarding to get started.</p>
        </div>
      )}

      {/* Add-ons section */}
      <div className="mp-addons-section">
        <div className="mp-addons-header">
          <div>
            <h2 className="mp-addons-title"><Sparkles size={18} /> Explore Add-ons</h2>
            <p className="mp-addons-sub">Boost your protection with extra coverage modules</p>
          </div>
        </div>

        {availableAddons.length > 0 ? (
          <div className="mp-addons-grid">
            {availableAddons.map((addon) => (
              <div key={addon.id} className="mp-addon-card">
                <div className="mp-addon-top">
                  <h3 className="mp-addon-name">{addon.name}</h3>
                  <span className="mp-addon-price">₹{addon.base_premium}<span>/wk</span></span>
                </div>
                <p className="mp-addon-desc">{addon.description}</p>
                <button
                  onClick={() => handleAddPolicy(addon.id)}
                  disabled={addingId === addon.id}
                  className="mp-addon-btn"
                >
                  {addingId === addon.id ? (
                    <><div className="mp-spin-sm" /> Adding…</>
                  ) : (
                    <><PlusCircle size={14} /> Add to Plan</>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mp-addons-full">
            <Check size={20} />
            <span>You have all available add-ons active!</span>
          </div>
        )}
      </div>
    </div>
  );
}

const policyStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
  .mp-wrap { font-family: 'Sora', sans-serif; max-width: 780px; }

  .mp-loading { display: flex; align-items: center; justify-content: center; height: 200px; color: #34d399; }
  .mp-spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .mp-spin-sm { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

  .mp-page-header { margin-bottom: 28px; }
  .mp-title { margin: 0 0 5px; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.025em; }
  .mp-subtitle { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }

  /* Policy cards */
  .mp-policies { display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
  .mp-policy-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 24px 26px;
    box-shadow: 0 0 40px var(--glow, rgba(99,102,241,0.08));
    transition: box-shadow 0.3s;
    animation: fadeUp 0.35s ease both;
  }
  .mp-policy-card:hover { box-shadow: 0 0 60px var(--glow, rgba(99,102,241,0.15)); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

  .mp-policy-header { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
  .mp-policy-icon-wrap {
    width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
    background: var(--glow, rgba(99,102,241,0.1));
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .mp-policy-name-row { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .mp-policy-name { margin: 0; font-size: 18px; font-weight: 700; color: #fff; }
  .mp-active-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #4ade80; }
  .mp-tier-chip { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 5px 11px; border-radius: 7px; }

  .mp-policy-stats { display: flex; align-items: center; gap: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; }
  .mp-stat { flex: 1; padding: 16px 20px; }
  .mp-stat-divider { width: 1px; height: 50px; background: rgba(255,255,255,0.07); flex-shrink: 0; }
  .mp-stat-icon { color: rgba(255,255,255,0.3); margin-bottom: 8px; }
  .mp-stat-label { margin: 0 0 5px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.35); }
  .mp-stat-val { margin: 0; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }

  .mp-features { margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.06); }
  .mp-features-label { margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); font-weight: 600; }
  .mp-features-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .mp-feature-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    padding: 5px 12px; border-radius: 99px;
  }

  .mp-empty-card {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 60px 24px; background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.08); border-radius: 20px; text-align: center;
    margin-bottom: 36px;
  }
  .mp-empty-icon { color: rgba(255,255,255,0.2); }
  .mp-empty-card h3 { margin: 0; font-size: 17px; font-weight: 600; color: #fff; }
  .mp-empty-card p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.4); }

  /* Add-ons */
  .mp-addons-section { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px; }
  .mp-addons-header { margin-bottom: 20px; }
  .mp-addons-title { margin: 0 0 5px; font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
  .mp-addons-title svg { color: #fbbf24; }
  .mp-addons-sub { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }

  .mp-addons-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .mp-addon-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 20px 22px;
    transition: all 0.2s; display: flex; flex-direction: column; gap: 10px;
  }
  .mp-addon-card:hover { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.03); transform: translateY(-2px); }
  .mp-addon-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .mp-addon-name { margin: 0; font-size: 15px; font-weight: 600; color: #fff; }
  .mp-addon-price { font-size: 14px; font-weight: 700; color: #fbbf24; white-space: nowrap; }
  .mp-addon-price span { font-size: 11px; font-weight: 400; color: rgba(255,255,255,0.4); }
  .mp-addon-desc { margin: 0; font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.55; flex: 1; }
  .mp-addon-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    width: 100%; padding: 10px; background: rgba(52,211,153,0.08);
    border: 1px solid rgba(52,211,153,0.2); color: #34d399;
    border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Sora', sans-serif; transition: all 0.2s; margin-top: auto;
  }
  .mp-addon-btn:hover:not(:disabled) { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.35); }
  .mp-addon-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .mp-addons-full {
    display: flex; align-items: center; gap: 10px; justify-content: center;
    padding: 28px; border: 1px dashed rgba(52,211,153,0.2); border-radius: 14px;
    color: #34d399; font-size: 14px; background: rgba(52,211,153,0.04);
  }

  @media (max-width: 600px) {
    .mp-addons-grid { grid-template-columns: 1fr; }
    .mp-policy-stats { flex-direction: column; }
    .mp-stat-divider { width: 100%; height: 1px; }
  }
`