"use client";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase-browser';
import { User, Phone, MapPin, Briefcase, Calendar, IndianRupee } from "lucide-react";

interface ProfileData {
  mobile: string;
  platform: string;
  cityContext: string;
  tenure: string;
  dailyEarnings: string;
  status: string;
  fullName: string;
  email: string;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setLoading(false);
        return;
      }

      const [profileRes, gigRes, incomeRes] = await Promise.all([
        supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
        supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      const p = profileRes.data || {};
      const g = gigRes.data || {};
      const i = incomeRes.data || {};

      setData({
        mobile: p.mobile || "N/A",
        platform: g.platform ? g.platform.charAt(0).toUpperCase() + g.platform.slice(1) : "N/A",
        cityContext: `${p.city || 'Unknown City'} — ${i.zone_risk_level || p.city_zone || 'Unknown Zone'}`,
        tenure: g.tenure_months ? `${g.tenure_months} months` : "N/A",
        dailyEarnings: i.avg_daily_earnings ? `₹${i.avg_daily_earnings}` : "N/A",
        status: p.onboarding_complete ? "active" : "pending",
        fullName: p.full_name || "Worker",
        email: user.email || ""
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

  return (
    <div className="space-y-8 max-w-2xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card p-8 flex flex-col items-center text-center border border-white/5 bg-white/5 rounded-2xl">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4"
          style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
        >
          {data?.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "W"}
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
    </div>
  );
}
