// app/onboarding/step-5/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

// Income tier calculation from GigShield spec
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

  // Computed values
  const daily = parseFloat(form.avg_daily_earnings) || 0
  const days = parseInt(form.working_days_per_week) || 6
  const weekly = daily * days
  const monthly = weekly * 4.3
  const tier = getIncomeTier(weekly)
  const premium = getWeeklyPremium(tier)
  const maxPayout = getMaxPayout(tier)
  const riskLevel = CITY_RISK[userCity] ?? CITY_RISK[form.city_zone] ?? 'medium'

  useEffect(() => {
    // Pre-fill city from worker_profiles
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

    const { error: dbError } = await supabase.from('income_data').insert({
      worker_id: user.id,
      avg_daily_earnings: daily,
      avg_weekly_earnings: weekly,
      avg_monthly_earnings: monthly,
      working_days_per_week: days,
      city_zone: form.city_zone,
      zone_risk_level: riskLevel as any,
      income_tier: tier as any,
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }
    await supabase.from('worker_profiles').update({ onboarding_step: 5, onboarding_complete: true }).eq('id', user.id)
    router.push('/worker/dashboard')
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 15,
    fontFamily: '"DM Sans", sans-serif', outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 } as React.CSSProperties

  const tierColors: Record<string, string> = { starter: '#3b82f6', standard: '#f97316', pro: '#a855f7' }
  const riskColors: Record<string, string> = { low: '#22c55e', medium: '#f97316', high: '#ef4444' }

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
        .btn { transition: all 0.2s ease; }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .preview-card { animation: slideIn 0.3s ease; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(249,115,22,0.15)', marginBottom: 16, fontSize: 24,
        }}>💰</div>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
          Income & operating zone
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          We use this to calculate your coverage and weekly premium
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
        }}>{error}</div>
      )}

      {/* Daily earnings */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Average daily earnings (₹)</label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.5)', fontSize: 15,
          }}>₹</span>
          <input style={{ ...inputStyle, paddingLeft: 32 }}
            type="number" placeholder="700" min="100" max="5000"
            value={form.avg_daily_earnings}
            onChange={e => setForm(f => ({ ...f, avg_daily_earnings: e.target.value }))}
          />
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          Based on last 30 days average from your platform earnings
        </p>
      </div>

      {/* Working days */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Working days per week: <strong style={{ color: '#fb923c' }}>{days} days</strong></label>
        <input type="range" min="3" max="7" value={form.working_days_per_week}
          onChange={e => setForm(f => ({ ...f, working_days_per_week: e.target.value }))}
          style={{ width: '100%', accentColor: '#f97316' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          <span>3 days</span><span>7 days</span>
        </div>
      </div>

      {/* City zone */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Primary operating city / zone</label>
        <input style={inputStyle} placeholder="e.g. Andheri West, Mumbai"
          value={form.city_zone}
          onChange={e => setForm(f => ({ ...f, city_zone: e.target.value }))}
        />
      </div>

      {/* Live preview card */}
      {daily > 0 && (
        <div className="preview-card" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, padding: 20, marginBottom: 28,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your coverage preview
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Weekly earnings</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>₹{Math.round(weekly).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Monthly earnings</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#fff' }}>₹{Math.round(monthly).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '12px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{
              background: `${tierColors[tier]}15`,
              border: `1px solid ${tierColors[tier]}40`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Your tier</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: tierColors[tier], textTransform: 'capitalize' }}>{tier}</p>
            </div>
            <div style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 10, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Weekly premium</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#fb923c' }}>₹{premium}</p>
            </div>
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 10, padding: '10px 12px',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Max payout</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#4ade80' }}>₹{maxPayout.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {form.city_zone && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: riskColors[riskLevel] }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {form.city_zone} zone: <span style={{ color: riskColors[riskLevel], fontWeight: 600 }}>{riskLevel} risk</span>
              </p>
            </div>
          )}
        </div>
      )}

      <button className="btn" onClick={handleNext} disabled={loading}
        style={{
          width: '100%', padding: '15px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '"DM Sans", sans-serif', opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  )
}