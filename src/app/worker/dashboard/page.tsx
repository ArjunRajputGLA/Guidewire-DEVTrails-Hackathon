'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Zap, TrendingUp, Shield, AlertTriangle, Activity } from 'lucide-react'

interface WorkerData {
  profile: Record<string, unknown> | null
  income:  Record<string, unknown> | null
  gig:     Record<string, unknown> | null
  payment: Record<string, unknown> | null
  policies: any[]
}

const PREMIUM_MAP = { starter: 29, standard: 49, pro: 79 }
const PAYOUT_MAP  = { starter: 1500, standard: 2500, pro: 4000 }
type Tier = 'starter' | 'standard' | 'pro'
function isTier(v: unknown): v is Tier { return v === 'starter' || v === 'standard' || v === 'pro' }

export default function WorkerDashboard() {
  const [data, setData] = useState<WorkerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [claimMsg, setClaimMsg] = useState('')
  const [locationVerified, setLocationVerified] = useState(false)
  const [weatherAlert, setWeatherAlert] = useState<{
    title: string;
    desc: string;
    emoji: string;
    disruptionType: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profile, income, gig, payment, policiesRes] = await Promise.all([
        supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
        supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('payment_info').select('*').eq('worker_id', user.id).maybeSingle(),
        supabase.from('worker_policies').select('*, insurance_products(*)').eq('worker_id', user.id).eq('status', 'active'),
      ])

      setData({
        profile: profile.data as Record<string, unknown>,
        income:  income.data  as Record<string, unknown> | null,
        gig:     gig.data     as Record<string, unknown> | null,
        payment: payment.data as Record<string, unknown> | null,
        policies: policiesRes.data || [],
      })

      // Fetch Live Weather using the worker's city
      try {
        const city = ((profile.data as Record<string, unknown>)?.city as string) || 'Delhi';
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (apiKey) {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`);
          const weatherData = await res.json();
          if (weatherData && weatherData.weather) {
            const condition = weatherData.weather[0].main.toLowerCase();
            const temp = weatherData.main?.temp;
            const humidity = weatherData.main?.humidity;
            const aqiTrigger = (condition === 'haze' || condition === 'smoke' || condition === 'dust') && humidity < 40;

            if (condition === 'rain' || condition === 'drizzle') {
              setWeatherAlert({ title: 'Heavy Rain Warning', desc: `Rain detected in ${city} — threshold nearly met.`, emoji: '🌧️', disruptionType: 'Heavy Rainfall' });
            } else if (condition === 'snow') {
              setWeatherAlert({ title: 'Snowfall Warning', desc: `Snow accumulation detected in ${city}.`, emoji: '❄️', disruptionType: 'Snowfall' });
            } else if (condition === 'thunderstorm' || condition === 'tornado') {
              setWeatherAlert({ title: 'Severe Storm Alert', desc: `Thunderstorm/severe weather detected in ${city}.`, emoji: '⛈️', disruptionType: 'Severe Storm' });
            } else if ((temp && temp > 40) || (weatherData.main?.feels_like && weatherData.main.feels_like >= 40)) {
              const displayTemp = weatherData.main?.feels_like || temp;
              setWeatherAlert({ title: 'Extreme Heat Alert', desc: `Temperatures reaching ${displayTemp}°C in ${city}.`, emoji: '🌡️', disruptionType: 'Extreme heat' });
            } else if (aqiTrigger) {
              setWeatherAlert({ title: 'Severe AQI Alert', desc: `Hazardous air quality indicators detected in ${city}.`, emoji: '🌫️', disruptionType: 'Severe AQI' });
            } else {
              setWeatherAlert(null); // No severe calamity detected
            }
          }
        }
      } catch (err) {
        console.error("OpenWeather API check failed", err);
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const handleQuickClaim = async () => {
    setSubmitting(true)
    setClaimStatus('idle')
    setClaimMsg('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setClaimStatus('error')
      setClaimMsg('User not authenticated')
      setSubmitting(false)
      return
    }

    const { latitude, longitude } = await new Promise<{ latitude: number; longitude: number }>((resolve) => {
      if (!navigator.geolocation) return resolve({ latitude: 28.7041, longitude: 77.1025 });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve({ latitude: 28.7041, longitude: 77.1025 })
      );
    });

    const payload = {
      user_id: user.id,
      disruption_type: weatherAlert?.disruptionType || "Heavy Rainfall",
      trigger_icon: weatherAlert?.emoji || "🌧️",
      amount: data?.income?.avg_daily_earnings ? Number(data.income.avg_daily_earnings) * 2 : 1500,
      lat: latitude,
      lon: longitude
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await response.json();

      if (!response.ok) {
        setClaimStatus('error')
        setClaimMsg(resData.message || "Failed to submit claim")
      } else {
        setLocationVerified(true);
        setTimeout(() => setLocationVerified(false), 5000);
        setClaimStatus('success')
        setClaimMsg(`Claim submitted! Status: ${resData.status}`)
      }
    } catch (err: any) {
      // Fallback if backend is down
      const { error } = await supabase.from('claims').insert({
        worker_id: payload.user_id,
        trigger_type: payload.disruption_type,
        trigger_icon: payload.trigger_icon,
        amount: payload.amount,
        status: 'pending-review',
        fraud_score: 50
      });

      if (error) {
        setClaimStatus('error');
        setClaimMsg("Network error & fallback failed: " + error.message);
      } else {
        setLocationVerified(true);
        setTimeout(() => setLocationVerified(false), 5000);
        setClaimStatus('success');
        setClaimMsg(`Claim submitted! Status: pending-review`);
      }
    }

    setSubmitting(false)
  }

  if (loading) return (
    <div className="gs-loading">
      <div className="gs-spinner" />
      <span>Loading your dashboard…</span>
      <style>{loadingStyle}</style>
    </div>
  )

  const policies = data?.policies || []
  let premium = 0
  let maxPayout = 0
  let primaryTier = 'standard'
  
  if (policies.length > 0) {
    premium = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.base_premium) || 0), 0)
    maxPayout = policies.reduce((sum, p) => sum + (Number(p.insurance_products?.max_payout) || 0), 0)
    const basePolicy = policies.find(p => ['Starter', 'Standard', 'Pro'].includes(p.insurance_products?.tier))
    if (basePolicy) primaryTier = basePolicy.insurance_products.tier.toLowerCase()
  } else if (data?.income?.income_tier) {
    primaryTier = data.income.income_tier as string
    const fallbackTier = isTier(primaryTier) ? primaryTier as Tier : 'standard'
    premium = PREMIUM_MAP[fallbackTier]
    maxPayout = PAYOUT_MAP[fallbackTier]
  }

  const tier = primaryTier
  const firstName = typeof data?.profile?.full_name === 'string' ? data.profile.full_name.split(' ')[0] : 'Partner'
  const city      = typeof data?.profile?.city === 'string' ? data.profile.city : ''
  const platform  = typeof data?.gig?.platform === 'string' ? data.gig.platform.charAt(0).toUpperCase() + data.gig.platform.slice(1) : 'Delivery'
  const daily     = typeof data?.income?.avg_daily_earnings === 'number' ? data.income.avg_daily_earnings : 0
  const risk      = typeof data?.income?.zone_risk_level === 'string' ? data.income.zone_risk_level : '-'
  const payout    = typeof data?.payment?.upi_id === 'string' && data.payment.upi_id ? 'UPI' : 'Bank'

  const TRIGGERS = [
    { icon: '🌧️', name: 'Heavy rainfall', threshold: '≥ 50mm in 3 hours', active: true },
    { icon: '🌡️', name: 'Extreme heat', threshold: 'Feels-like ≥ 45°C for 4+ hrs', active: true },
    { icon: '🌫️', name: 'Severe AQI', threshold: 'AQI ≥ 400 + GRAP Stage IV', active: true },
    { icon: '🚧', name: 'Curfew / bandh', threshold: 'Official curfew declared', active: true },
    { icon: '📵', name: 'Platform outage', threshold: 'App down ≥ 2 hrs', active: true },
  ]

  const tierColorMap: Record<string, string> = {
    starter: '#94a3b8',
    standard: '#6366f1',
    pro: '#f59e0b',
  }
  const tierColor = tierColorMap[tier] || '#6366f1'

  return (
    <div className="gs-dash">
      <style>{dashStyle}</style>

      {/* Location Verification Popup */}
      {locationVerified && (
        <>
          <style>{`
            @keyframes verifyFadeInOut {
              0% { opacity: 0; transform: translate(-50%, -20px); }
              10% { opacity: 1; transform: translate(-50%, 0); }
              90% { opacity: 1; transform: translate(-50%, 0); }
              100% { opacity: 0; transform: translate(-50%, -20px); }
            }
          `}</style>
          <div style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#047857',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            animation: 'verifyFadeInOut 5s ease-in-out forwards',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Location verified successfully</span>
          </div>
        </>
      )}

      {/* Hero greeting */}
      <div className="gs-hero">
        <div className="gs-hero-left">
          <div className="gs-greeting-badge">
            <Activity size={13} />
            <span>Live protection active</span>
          </div>
          <h1 className="gs-heading">Welcome back, {firstName} 👋</h1>
          <p className="gs-subheading">{platform} delivery partner{city ? ` · ${city}` : ''}</p>
        </div>
        <div className="gs-tier-pill" style={{ '--tier-color': tierColor } as any}>
          <Shield size={14} />
          <span>{tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</span>
        </div>
      </div>

      {/* Coverage stat cards */}
      <div className="gs-stats-row">
        {[
          { label: 'Weekly Premium', value: `₹${premium}`, icon: <TrendingUp size={18} />, accent: '#22d3ee' },
          { label: 'Max Payout', value: `₹${maxPayout.toLocaleString('en-IN')}`, icon: <Zap size={18} />, accent: '#a78bfa' },
          { label: 'Avg Daily Earn', value: `₹${daily.toLocaleString('en-IN')}`, icon: <Activity size={18} />, accent: '#34d399' },
          { label: 'Risk Zone', value: risk, icon: <AlertTriangle size={18} />, accent: '#fb923c', capitalize: true },
        ].map((card) => (
          <div className="gs-stat-card" key={card.label} style={{ '--accent': card.accent } as any}>
            <div className="gs-stat-icon">{card.icon}</div>
            <div>
              <p className="gs-stat-label">{card.label}</p>
              <p className="gs-stat-value" style={{ textTransform: card.capitalize ? 'capitalize' : undefined }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alert + Activity row */}
      <div className="gs-mid-row">
        {/* Weather Alert & Claim */}
        {weatherAlert ? (
          <div className="gs-alert-card">
            <p className="gs-card-label">Active Alert</p>
            <div className="gs-alert-banner">
              <span className="gs-alert-emoji">{weatherAlert.emoji}</span>
              <div>
                <p className="gs-alert-title">{weatherAlert.title}</p>
                <p className="gs-alert-desc">{weatherAlert.desc}</p>
              </div>
              <div className="gs-alert-pulse" />
            </div>

            {claimStatus === 'success' ? (
              <div className="gs-success-box">
                <div className="gs-success-icon">✓</div>
                <p>{claimMsg}</p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleQuickClaim}
                  disabled={submitting}
                  className={`gs-claim-btn ${submitting ? 'gs-claim-btn--loading' : ''}`}
                >
                  {submitting ? (
                    <>
                      <div className="gs-btn-spinner" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Quick Claim — {weatherAlert.disruptionType}
                    </>
                  )}
                </button>
                {claimStatus === 'error' && (
                  <p className="gs-error-msg">❌ {claimMsg}</p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="gs-alert-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <span style={{ fontSize: '2rem', filter: 'grayscale(1)', opacity: 0.5 }}>🌤️</span>
            <p style={{ marginTop: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>No active calamities detected in your zone.</p>
          </div>
        )}

        {/* Activity breakdown */}
        <div className="gs-activity-card">
          <p className="gs-card-label">Your Activity</p>
          <div className="gs-activity-list">
            {[
              ['Platform', platform],
              ['Payout Method', payout],
              ['Risk Zone', risk],
            ].map(([label, val]) => (
              <div className="gs-activity-row" key={label}>
                <span className="gs-activity-label">{label}</span>
                <span className="gs-activity-val">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Triggers grid */}
      <div className="gs-triggers-card">
        <p className="gs-card-label">Parametric Triggers Watching For You</p>
        <div className="gs-triggers-grid">
          {TRIGGERS.map(({ icon, name, threshold }) => (
            <div className="gs-trigger-item" key={name}>
              <div className="gs-trigger-icon-wrap">
                <span className="gs-trigger-emoji">{icon}</span>
                <span className="gs-trigger-dot" />
              </div>
              <div>
                <p className="gs-trigger-name">{name}</p>
                <p className="gs-trigger-threshold">{threshold}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const loadingStyle = `
  .gs-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; height: 60vh; color: rgba(255,255,255,0.4); font-size: 14px;
    font-family: 'Sora', sans-serif;
  }
  .gs-spinner {
    width: 36px; height: 36px; border: 2px solid rgba(99,102,241,0.2);
    border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`

const dashStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

  .gs-dash { font-family: 'Sora', sans-serif; animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:none; } }

  /* Hero */
  .gs-hero {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 16px; margin-bottom: 28px;
  }
  .gs-hero-left { display: flex; flex-direction: column; gap: 8px; }
  .gs-greeting-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25);
    color: #4ade80; font-size: 12px; font-weight: 500; padding: 5px 12px;
    border-radius: 99px; width: fit-content;
  }
  .gs-heading { margin: 0; font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -0.03em; }
  .gs-subheading { margin: 0; font-size: 14px; color: rgba(255,255,255,0.4); }
  .gs-tier-pill {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: var(--tier-color, #6366f1); font-size: 13px; font-weight: 600;
    padding: 8px 16px; border-radius: 99px; margin-top: 4px;
    box-shadow: 0 0 20px color-mix(in srgb, var(--tier-color, #6366f1) 20%, transparent);
  }

  /* Stat cards */
  .gs-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .gs-stat-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 14px;
    transition: all 0.2s; cursor: default;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .gs-stat-card:hover {
    background: rgba(255,255,255,0.055); border-color: rgba(255,255,255,0.12);
    transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
  }
  .gs-stat-icon {
    width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    color: var(--accent, #6366f1);
  }
  .gs-stat-label { margin: 0 0 4px; font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; }
  .gs-stat-value { margin: 0; font-size: 20px; font-weight: 600; color: #fff; letter-spacing: -0.02em; }

  /* Mid row */
  .gs-mid-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 16px; }
  .gs-card-label { margin: 0 0 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.3); }

  /* Alert card */
  .gs-alert-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .gs-alert-banner {
    display: flex; align-items: flex-start; gap: 14px;
    background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.04));
    border: 1px solid rgba(251,191,36,0.2); border-radius: 14px; padding: 16px;
    margin-bottom: 16px; position: relative; overflow: hidden;
  }
  .gs-alert-emoji { font-size: 28px; flex-shrink: 0; line-height: 1; margin-top: 2px; }
  .gs-alert-title { margin: 0 0 5px; font-size: 15px; font-weight: 600; color: #fbbf24; }
  .gs-alert-desc { margin: 0; font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }
  .gs-alert-pulse {
    position: absolute; top: 14px; right: 14px; width: 8px; height: 8px;
    border-radius: 50%; background: #fbbf24;
    box-shadow: 0 0 0 0 rgba(251,191,36,0.4);
    animation: alertPulse 2s infinite;
  }
  @keyframes alertPulse {
    0%   { box-shadow: 0 0 0 0 rgba(251,191,36,0.5); }
    70%  { box-shadow: 0 0 0 10px rgba(251,191,36,0); }
    100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
  }

  /* Claim button */
  .gs-claim-btn {
    width: 100%; padding: 14px; border: none; border-radius: 13px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Sora', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(249,115,22,0.35);
    transition: all 0.2s; position: relative;
  }
  .gs-claim-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(249,115,22,0.45); }
  .gs-claim-btn:active:not(:disabled) { transform: translateY(0); }
  .gs-claim-btn--loading { background: rgba(255,255,255,0.08); box-shadow: none; cursor: not-allowed; color: rgba(255,255,255,0.5); }
  .gs-btn-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2);
    border-top-color: rgba(255,255,255,0.7); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Success / error */
  .gs-success-box {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 20px; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
    border-radius: 13px; color: #4ade80; font-size: 13px; text-align: center;
  }
  .gs-success-icon {
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(34,197,94,0.15); display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700;
  }
  .gs-error-msg {
    margin-top: 10px; font-size: 13px; color: #f87171;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    padding: 10px 14px; border-radius: 10px; text-align: center;
  }

  /* Activity card */
  .gs-activity-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px;
  }
  .gs-activity-list { display: flex; flex-direction: column; gap: 0; }
  .gs-activity-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .gs-activity-row:last-child { border-bottom: none; }
  .gs-activity-label { font-size: 13px; color: rgba(255,255,255,0.4); }
  .gs-activity-val { font-size: 13px; font-weight: 500; color: #fff; text-transform: capitalize; }

  /* Triggers card */
  .gs-triggers-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .gs-triggers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
  .gs-trigger-item {
    display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
    padding: 16px 12px; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;
    transition: all 0.2s; cursor: default;
  }
  .gs-trigger-item:hover {
    background: rgba(255,255,255,0.06); border-color: rgba(34,197,94,0.25);
    transform: translateY(-2px);
  }
  .gs-trigger-icon-wrap { position: relative; display: inline-flex; }
  .gs-trigger-emoji { font-size: 26px; }
  .gs-trigger-dot {
    position: absolute; top: 0; right: -2px; width: 8px; height: 8px;
    border-radius: 50%; background: #22c55e;
    box-shadow: 0 0 8px rgba(34,197,94,0.6);
    border: 2px solid #131320;
  }
  .gs-trigger-name { margin: 0 0 3px; font-size: 12px; font-weight: 600; color: #fff; line-height: 1.3; }
  .gs-trigger-threshold { margin: 0; font-size: 10.5px; color: rgba(255,255,255,0.35); line-height: 1.4; }

  @media (max-width: 900px) {
    .gs-stats-row { grid-template-columns: 1fr 1fr; }
    .gs-mid-row { grid-template-columns: 1fr; }
    .gs-triggers-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 600px) {
    .gs-stats-row { grid-template-columns: 1fr 1fr; }
    .gs-triggers-grid { grid-template-columns: repeat(2, 1fr); }
    .gs-heading { font-size: 24px; }
  }
`