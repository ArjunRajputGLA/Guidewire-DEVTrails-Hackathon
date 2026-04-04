"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from '@/lib/supabase-browser';
import { User, Phone, MapPin, Briefcase, Calendar, IndianRupee, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileData {
  mobile: string;
  platform: string;
  cityContext: string;
  tenure: string;
  dailyEarnings: string;
  status: string;
  fullName: string;
  email: string;
  activePolicies: any[];
}

export default function ProfilePage() {
  const { user: authUser, updateProfilePic } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const [profileRes, gigRes, incomeRes, policiesRes] = await Promise.all([
        supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
        supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('worker_policies').select('*, insurance_products(*)').eq('worker_id', user.id).eq('status', 'active'),
      ]);

      const p = profileRes.data || {};
      const g = gigRes.data || {};
      const i = incomeRes.data || {};
      const activePolicies = policiesRes.data || [];

      setData({
        mobile: p.mobile || "N/A",
        platform: g.platform ? g.platform.charAt(0).toUpperCase() + g.platform.slice(1) : "N/A",
        cityContext: `${p.city || 'Unknown City'} — ${i.zone_risk_level || p.city_zone || 'Unknown Zone'}`,
        tenure: g.tenure_months ? `${g.tenure_months} months` : "N/A",
        dailyEarnings: i.avg_daily_earnings ? `₹${i.avg_daily_earnings}` : "N/A",
        status: p.onboarding_complete ? "active" : "pending",
        fullName: p.full_name || "Worker",
        email: user.email || "",
        activePolicies: activePolicies,
      });
      
      setLoading(false);
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-2xl animate-fade-in">
        <p className="text-gray-500">Loading profile data...</p>
      </div>
    );
  }

  const profileItems = data
    ? [
        { icon: Phone, label: "Phone", value: data.mobile },
        { icon: Briefcase, label: "Platform", value: data.platform },
        { icon: MapPin, label: "City", value: data.cityContext },
        { icon: Calendar, label: "Tenure", value: data.tenure },
        { icon: IndianRupee, label: "Avg Daily Earnings", value: data.dailyEarnings },
      ]
    : [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card p-8 flex flex-col items-center text-center border border-white/5 bg-white/5 rounded-2xl relative">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageUpload}
        />
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 relative group cursor-pointer overflow-hidden border-2 border-white/10 hover:border-blue-500/50 transition-colors shadow-lg"
          style={{ background: authUser?.profilePic ? "none" : "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
          onClick={() => fileInputRef.current?.click()}
        >
          {authUser?.profilePic ? (
            <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            data?.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "W"
          )}
          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
            <Camera className="w-8 h-8 text-white/90" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{data?.fullName}</h2>
        <p className="text-sm text-gray-500">{data?.email}</p>
        <span className="mt-2 status-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full text-[10px] uppercase tracking-wide">
          {data?.status}
        </span>
      </div>

      {/* Profile Details */}
      {data && (
        <div className="glass-card p-6 border border-white/5 bg-white/5 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Details
          </h3>
          <div className="space-y-3">
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-400 w-36">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Policies */}
      {data?.activePolicies && data.activePolicies.length > 0 && (
        <div className="glass-card p-6 border border-white/5 bg-white/5 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Active Policies
          </h3>
          <div className="space-y-3">
             {data.activePolicies.map((p) => {
               const product = p.insurance_products;
               if (!product) return null;
               return (
                 <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                   <div>
                     <p className="text-sm font-medium text-white">{product.name}</p>
                     <p className="text-xs text-gray-400">{product.tier === 'Add-on' ? 'Add-on Coverage' : 'Base Plan'}</p>
                   </div>
                   <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded">
                     Active
                   </span>
                 </div>
               )
             })}
          </div>
        </div>
      )}
    </div>
  );
}
