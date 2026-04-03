"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { IndianRupee, Loader2, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";

export default function WeeklyPayoutPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: activeRows } = await supabase
        .from('worker_policies')
        .select('*, insurance_products(*)')
        .eq('worker_id', user.id)
        .eq('status', 'active');
        
      setPolicies(activeRows || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const hasPolicy = policies.length > 0;
  const premiumAmt = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.base_premium) || 0), 0);
  const payoutAmt = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.max_payout) || 0), 0);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Weekly Payout Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your weekly policy settlements</p>
      </div>

      {hasPolicy ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-medium text-emerald-400">Next Auto-Deduction</h2>
                 <Clock className="w-5 h-5 text-emerald-500/50" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">₹{premiumAmt}</p>
              <p className="text-xs text-gray-400">Due coming Sunday, 11:59 PM</p>
            </div>

            <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-medium text-indigo-400">Max Entitled Payout</h2>
                 <ArrowUpRight className="w-5 h-5 text-indigo-500/50" />
              </div>
              <p className="text-3xl font-bold text-white mb-2">₹{payoutAmt.toLocaleString()}</p>
              <p className="text-xs text-gray-400">For qualifying parametric triggers</p>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Payout History</h3>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-white">Premium Deduction</p>
                       <p className="text-xs text-gray-400">Auto-paid via platform deduction</p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">- ₹{premiumAmt}</p>
                    <p className="text-xs text-gray-500">Last Sunday</p>
                  </div>
               </div>

               <div className="text-center p-6 border border-dashed border-white/10 rounded-xl">
                 <p className="text-sm text-gray-500">No recent claims payouts to display.</p>
               </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-8 text-center rounded-2xl bg-white/5">
          <IndianRupee className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Active Entitlements</h3>
          <p className="text-gray-500 text-sm">Please set up your policy to view weekly payouts.</p>
        </div>
      )}
    </div>
  );
}
