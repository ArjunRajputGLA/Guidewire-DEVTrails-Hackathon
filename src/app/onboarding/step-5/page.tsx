// app/onboarding/step-5/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const getIncomeTier = (weekly: number): string => {
  if (weekly < 3500) return 'starter'
  if (weekly < 5500) return 'standard'
  return 'pro'
}

const getWeeklyPremium = (tier: string): number => {
  return { starter: 29, standard: 49, pro: 79 }[tier] ?? 49
}

const getMaxPayout = (tier: string): number => {
  return { starter: 1500, standard: 2500, pro: 4000 }[tier] ?? 2500
}

const CITY_RISK: Record<string, string> = {
  Mumbai: 'high', Delhi: 'high', Chennai: 'high', Kolkata: 'medium',
  Bengaluru: 'medium', Hyderabad: 'medium', Pune: 'medium', Ahmedabad: 'low',
  Jaipur: 'low', Surat: 'low',
}

export default function Step5() {
  const router = useRouter()
  const [form, setForm] = useState({
    avg_daily_earnings: '', working_days_per_week: '6', city_zone: '',
  })
  const [userCity, setUserCity] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const daily = parseFloat(form.avg_daily_earnings) || 0
  const days = parseInt(form.working_days_per_week) || 6
  const weekly = daily * days
  const monthly = weekly * 4.3
  const tier = getIncomeTier(weekly)
  const premium = getWeeklyPremium(tier)
  const maxPayout = getMaxPayout(tier)
  const riskLevel = CITY_RISK[userCity] ?? CITY_RISK[form.city_zone] ?? 'medium'

  useEffect(() => {
    const fetchCity = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('worker_profiles').select('city, city_zone').eq('id', user.id).single()
      if (data?.city) {
        setUserCity(data.city)
        setForm(f => ({ ...f, city_zone: data.city_zone || data.city }))
      }
    }
    fetchCity()
  }, [])

  const handleNext = async () => {
    setError('')
    if (!form.avg_daily_earnings || daily < 100) { setError('Please enter your average daily earnings (min ₹100)'); return }
    if (!form.city_zone) { setError('Please enter your operating city/zone'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: product, error: fetchError } = await supabase
      .from('insurance_products')
      .select('id, base_premium, max_payout')
      .ilike('tier', tier)
      .limit(1)
      .single()

    if (fetchError || !product) {
      setError('Could not find a matching insurance policy for your tier. Make sure the database is seeded.')
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase.from('income_data').insert({
      worker_id: user.id,
      avg_daily_earnings: daily,
      avg_weekly_earnings: weekly,
      avg_monthly_earnings: monthly,
      working_days_per_week: days,
      city_zone: form.city_zone,
      zone_risk_level: riskLevel as any,
      income_tier: tier as any,
      base_premium: product.base_premium,
      final_premium: product.base_premium,
      max_weekly_payout: product.max_payout,
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }

    const { error: linkError } = await supabase.from('worker_policies').insert({
      worker_id: user.id,
      policy_id: product.id,
      status: 'active'
    })

    if (linkError) { setError(linkError.message); setLoading(false); return }
    await supabase.from('worker_profiles').update({ onboarding_step: 5, onboarding_complete: true }).eq('id', user.id)
    router.push('/worker/dashboard')
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, color: '#fff', fontSize: 14,
    fontFamily: 'Outfit, sans-serif',
  }

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.4)', marginBottom: 8,
    letterSpacing: '0.08em', textTransform: 'uppercase',
  }

  const tierConfig: Record<string, { color: string; bg: string; label: string }> = {
    starter: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Starter' },
    standard: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', label: 'Standard' },
    pro: { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', label: 'Pro' },
  }
  const riskConfig: Record<string, { color: string; bg: string }> = {
    low: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    high: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  }

  const tc = tierConfig[tier]
  const rc = riskConfig[riskLevel]

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .h1 { animation: fadeUp 0.4s ease 0.05s both; }
        .h2 { animation: fadeUp 0.4s ease 0.12s both; }
        .h3 { animation: fadeUp 0.4s ease 0.19s both; }
        .h4 { animation: fadeUp 0.4s ease 0.26s both; }
        .h5 { animation: fadeUp 0.4s ease 0.33s both; }

        @keyframes slideInCard {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .preview-card { animation: slideInCard 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards; }

        /* Slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%; height: 4px;
          border-radius: 4px; cursor: pointer;
          background: rgba(255,255,255,0.08);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: linear-gradient(135deg, #f97316, #dc2626);
          box-shadow: 0 0 8px rgba(249,115,22,0.4);
          cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 18,
        }}>💰</div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>Income & operating zone</h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          We use this to calculate your coverage and weekly premium
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: '#fca5a5', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Daily earnings */}
      <div className="h1" style={{ marginBottom: 18 }}>
        <label style={lbl}>Average daily earnings (₹)</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.45)', fontSize: 16, fontWeight: 600,
          }}>₹</span>
          <input style={{ ...inp, paddingLeft: 34 }}
            type="number" placeholder="700" min="100" max="5000"
            value={form.avg_daily_earnings}
            onChange={e => setForm(f => ({ ...f, avg_daily_earnings: e.target.value }))}
          />
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 6 }}>
          Based on your last 30 days average from platform earnings
        </p>
      </div>

      {/* Working days slider */}
      <div className="h2" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={lbl}>Working days per week</label>
          <div style={{
            padding: '4px 12px',
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fb923c' }}>{days}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 3 }}>days</span>
          </div>
        </div>
        <input type="range" min="3" max="7" value={form.working_days_per_week}
          onChange={e => setForm(f => ({ ...f, working_days_per_week: e.target.value }))}
          style={{ accentColor: '#f97316' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
          <span>3 days</span>
          <span>7 days</span>
        </div>
      </div>

      {/* City zone */}
      <div className="h3" style={{ marginBottom: 24 }}>
        <label style={lbl}>Primary operating city / zone</label>
        <input style={inp} placeholder="e.g. Andheri West, Mumbai"
          value={form.city_zone}
          onChange={e => setForm(f => ({ ...f, city_zone: e.target.value }))}
        />
      </div>

      {/* Live preview card */}
      {daily > 0 && (
        <div className="preview-card" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: 20, marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Accent glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 150, height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tc.color}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Your coverage preview
            </p>
            <div style={{
              padding: '3px 10px', borderRadius: 100,
              background: tc.bg, border: `1px solid ${tc.color}40`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tc.color }}>{tc.label} tier</span>
            </div>
          </div>

          {/* Earnings row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Weekly earnings', value: `₹${Math.round(weekly).toLocaleString('en-IN')}` },
              { label: 'Monthly earnings', value: `₹${Math.round(monthly).toLocaleString('en-IN')}` },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px',
              }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 6px' }}>{stat.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: '"Bricolage Grotesque", sans-serif', letterSpacing: '-0.5px' }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ background: tc.bg, border: `1px solid ${tc.color}30`, borderRadius: 11, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tier</p>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: tc.color, textTransform: 'capitalize' }}>{tier}</p>
            </div>
            <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 11, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Premium/wk</p>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#fb923c' }}>₹{premium}</p>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 11, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max payout</p>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#4ade80' }}>₹{maxPayout.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Risk level */}
          {form.city_zone && (
            <div style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
              background: rc.bg, border: `1px solid ${rc.color}25`,
              borderRadius: 9, padding: '8px 12px',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.color, boxShadow: `0 0 6px ${rc.color}` }} />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {form.city_zone} is a{' '}
                <span style={{ color: rc.color, fontWeight: 700 }}>{riskLevel} risk</span>
                {' '}zone
              </p>
            </div>
          )}
        </div>
      )}

      <div className="h5">
        <button className="step-btn" onClick={handleNext} disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? 'rgba(249,115,22,0.35)' : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
            border: 'none', borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
            transition: 'all 0.25s ease',
          }}
        >
          {loading ? 'Saving…' : 'Complete Setup →'}
        </button>
      </div>
    </div>
  )
}