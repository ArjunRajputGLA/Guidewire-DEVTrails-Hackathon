"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { ShieldCheck, Calendar, IndianRupee, Zap, Loader2, PlusCircle, Check } from "lucide-react";

export default function MyPolicyPage() {
  const [activePolicies, setActivePolicies] = useState<any[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);
    
    // Fetch active policies for user
    const { data: activeRows } = await supabase
      .from('worker_policies')
      .select('*, insurance_products(*)')
      .eq('worker_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true });
      
    const policies = activeRows || [];
    setActivePolicies(policies);

    // Fetch all add-ons
    const { data: addons } = await supabase
      .from('insurance_products')
      .select('*')
      .eq('tier', 'Add-on')
      .eq('is_active', true);
      
    // Filter out add-ons that the user already has active
    const activeProductIds = policies.map(p => p.policy_id);
    const available = (addons || []).filter(addon => !activeProductIds.includes(addon.id));
    
    setAvailableAddons(available);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPolicy = async (productId: string) => {
    if (!userId) return;
    
    const { error } = await supabase.from('worker_policies').insert({
      worker_id: userId,
      policy_id: productId,
      status: 'active'
    });
    
    if (!error) {
      fetchData(); // refresh data
    } else {
      alert("Failed to add policy: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const primaryPolicyRow = activePolicies.find(p => ['Starter', 'Standard', 'Pro'].includes(p.insurance_products?.tier)) || activePolicies[0];
  const hasPolicy = !!primaryPolicyRow;
  
  const tierColors: any = {
    Starter: { bg: "bg-gray-500/15", text: "text-gray-400", border: "border-gray-500/30" },
    Standard: { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" },
    Pro: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    'Add-on': { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Your current income protection plan and add-ons</p>
      </div>

      {hasPolicy ? (
        <div className="space-y-6">
          {activePolicies.map((row) => {
            const product = row.insurance_products;
            const colors = tierColors[product.tier] || tierColors.Standard;
            const startDate = new Date(row.start_date || row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            // mock end date as 1 month from start for display
            const endDate = new Date(new Date(row.start_date || row.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            return (
              <div key={row.id} className="space-y-4">
                <div className={`glass-card p-8 border-l-4 ${colors.border} rounded-2xl bg-white/5`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
                      <ShieldCheck className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{product.name}</h2>
                      <span className="status-badge text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded inline-block mt-1">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Weekly Premium</p>
                      </div>
                      <p className="text-2xl font-bold text-white">₹{product.base_premium}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Max Payout</p>
                      </div>
                      <p className="text-2xl font-bold text-white">₹{Number(product.max_payout).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Valid Until</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{endDate}</p>
                    </div>
                  </div>
                  
                  {product.features && product.features.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                       <h4 className="text-sm font-medium text-gray-400 mb-3">Covered Events:</h4>
                       <div className="flex flex-wrap gap-2">
                         {product.features.map((feature: string, idx: number) => (
                           <span key={idx} className="text-xs px-3 py-1 bg-white/5 text-gray-300 rounded-full border border-white/10">
                             {feature}
                           </span>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center rounded-2xl bg-white/5">
          <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Policy</h3>
          <p className="text-gray-500 text-sm">You don't have an active policy. Complete your onboarding to get started.</p>
        </div>
      )}

      {/* ADD POLICY SECTION */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-6">
           <div>
             <h2 className="text-xl font-bold text-white">Explore Add-ons</h2>
             <p className="text-gray-500 text-sm">Enhance your protection with extra coverage</p>
           </div>
        </div>
        
        {availableAddons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {availableAddons.map((addon) => (
               <div key={addon.id} className="glass-card p-5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-md font-bold text-white">{addon.name}</h3>
                     <span className="text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded">₹{addon.base_premium} / week</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{addon.description}</p>
                  <button 
                    onClick={() => handleAddPolicy(addon.id)} 
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-sm transition-colors border border-emerald-500/20 hover:border-emerald-500/40"
                  >
                     Add to Plan
                  </button>
               </div>
             ))}
          </div>
        ) : (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/5 text-gray-400 text-sm">
            You currently have all available add-ons active!
          </div>
        )}
      </div>
    </div>
  );
}
