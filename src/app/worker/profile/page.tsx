"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase-browser";
import { User, Phone, MapPin, Briefcase, Calendar, IndianRupee, Camera, ShieldCheck } from "lucide-react";
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
      if (!user) { setLoading(false); return; }

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
        activePolicies,
      });
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const initials = data?.fullName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "W";

  const profileItems = data ? [
    { icon: Phone,        label: "Phone",             value: data.mobile },
    { icon: Briefcase,    label: "Platform",           value: data.platform },
    { icon: MapPin,       label: "City",               value: data.cityContext },
    { icon: Calendar,     label: "Tenure",             value: data.tenure },
    { icon: IndianRupee,  label: "Avg Daily Earnings", value: data.dailyEarnings },
  ] : [];

  if (loading) return (
    <div className="pf-loading">
      <div className="pf-skeleton-avatar" />
      <div className="pf-skeleton-lines">
        <div className="pf-skeleton" style={{ width: 140, height: 20 }} />
        <div className="pf-skeleton" style={{ width: 100, height: 14 }} />
      </div>
      <style>{profileStyle}</style>
    </div>
  );

  return (
    <div className="pf-wrap">
      <style>{profileStyle}</style>

      <div className="pf-page-header">
        <h1 className="pf-title">Profile</h1>
        <p className="pf-subtitle">Your account and partner details</p>
      </div>

      {/* Avatar hero card */}
      <div className="pf-hero-card">
        <div className="pf-hero-bg" />
        <input type="file" accept="image/*" className="pf-hidden" ref={fileInputRef} onChange={handleImageUpload} />
        <div className="pf-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
          {authUser?.profilePic ? (
            <img src={authUser.profilePic} alt="Profile" className="pf-avatar-img" />
          ) : (
            <span className="pf-avatar-initials">{initials}</span>
          )}
          <div className="pf-avatar-overlay">
            <Camera size={22} />
          </div>
        </div>
        <div className="pf-hero-info">
          <h2 className="pf-name">{data?.fullName}</h2>
          <p className="pf-email">{data?.email}</p>
          <span className={`pf-status-badge ${data?.status === 'active' ? 'pf-status-badge--active' : 'pf-status-badge--pending'}`}>
            {data?.status === 'active' ? '● Active' : '○ Pending'}
          </span>
        </div>
      </div>

      {/* Details */}
      {data && (
        <div className="pf-section-card">
          <div className="pf-section-header">
            <User size={16} className="pf-section-icon" />
            <h3 className="pf-section-title">Details</h3>
          </div>
          <div className="pf-details-list">
            {profileItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="pf-detail-row">
                <div className="pf-detail-icon"><Icon size={14} /></div>
                <span className="pf-detail-label">{label}</span>
                <span className="pf-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active policies */}
      {data?.activePolicies && data.activePolicies.length > 0 && (
        <div className="pf-section-card">
          <div className="pf-section-header">
            <ShieldCheck size={16} className="pf-section-icon pf-section-icon--green" />
            <h3 className="pf-section-title">Active Policies</h3>
          </div>
          <div className="pf-policies-list">
            {data.activePolicies.map((p) => {
              const product = p.insurance_products;
              if (!product) return null;
              return (
                <div key={p.id} className="pf-policy-row">
                  <div>
                    <p className="pf-policy-name">{product.name}</p>
                    <p className="pf-policy-type">{product.tier === 'Add-on' ? 'Add-on Coverage' : 'Base Plan'}</p>
                  </div>
                  <span className="pf-policy-active">Active</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const profileStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
  .pf-wrap { font-family: 'Sora', sans-serif; max-width: 580px; margin: 0 auto; animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }

  .pf-loading {
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    padding: 60px 24px; font-family: 'Sora', sans-serif;
  }
  .pf-skeleton-avatar { width: 96px; height: 96px; border-radius: 50%; background: rgba(255,255,255,0.07); animation: shimmer 1.5s ease infinite; }
  .pf-skeleton-lines { display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .pf-skeleton { background: rgba(255,255,255,0.07); border-radius: 6px; animation: shimmer 1.5s ease infinite; }
  @keyframes shimmer { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
  .pf-hidden { display: none; }

  .pf-page-header { margin-bottom: 24px; }
  .pf-title { margin: 0 0 5px; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.025em; }
  .pf-subtitle { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }

  /* Hero card */
  .pf-hero-card {
    position: relative; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 22px; padding: 32px 28px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 24px; overflow: hidden;
  }
  .pf-hero-bg {
    position: absolute; inset: 0; opacity: 0.4; pointer-events: none;
    background: radial-gradient(ellipse at 10% 50%, rgba(99,102,241,0.15) 0%, transparent 65%);
  }
  .pf-avatar-wrap {
    width: 88px; height: 88px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; overflow: hidden;
    border: 3px solid rgba(255,255,255,0.12); z-index: 1;
    box-shadow: 0 8px 24px rgba(99,102,241,0.3); transition: box-shadow 0.2s;
  }
  .pf-avatar-wrap:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.45); }
  .pf-avatar-img { width: 100%; height: 100%; object-fit: cover; }
  .pf-avatar-initials { font-size: 28px; font-weight: 700; color: #fff; z-index: 1; }
  .pf-avatar-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    color: #fff; opacity: 0; transition: opacity 0.2s;
  }
  .pf-avatar-wrap:hover .pf-avatar-overlay { opacity: 1; }

  .pf-hero-info { display: flex; flex-direction: column; gap: 6px; z-index: 1; }
  .pf-name { margin: 0; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .pf-email { margin: 0; font-size: 13px; color: rgba(255,255,255,0.4); }
  .pf-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 11px; border-radius: 99px; border: 1px solid transparent; width: fit-content; }
  .pf-status-badge--active { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.2); color: #4ade80; }
  .pf-status-badge--pending { background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.2); color: #fbbf24; }

  /* Section cards */
  .pf-section-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px; margin-bottom: 14px;
  }
  .pf-section-header { display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
  .pf-section-icon { color: #818cf8; }
  .pf-section-icon--green { color: #34d399; }
  .pf-section-title { margin: 0; font-size: 15px; font-weight: 600; color: #fff; }

  /* Detail rows */
  .pf-details-list { display: flex; flex-direction: column; }
  .pf-detail-row {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px; transition: background 0.15s;
  }
  .pf-detail-row:hover { background: rgba(255,255,255,0.03); }
  .pf-detail-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; width: 18px; display: flex; align-items: center; }
  .pf-detail-label { font-size: 13px; color: rgba(255,255,255,0.4); flex: 0 0 150px; }
  .pf-detail-value { font-size: 13px; font-weight: 500; color: #fff; }

  /* Policy rows */
  .pf-policies-list { display: flex; flex-direction: column; gap: 8px; }
  .pf-policy-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
    transition: border-color 0.2s;
  }
  .pf-policy-row:hover { border-color: rgba(52,211,153,0.2); }
  .pf-policy-name { margin: 0 0 3px; font-size: 14px; font-weight: 600; color: #fff; }
  .pf-policy-type { margin: 0; font-size: 12px; color: rgba(255,255,255,0.35); }
  .pf-policy-active {
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 4px 10px; border-radius: 6px;
    background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.2);
  }
`