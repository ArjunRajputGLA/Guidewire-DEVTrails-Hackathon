'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { Zap } from 'lucide-react'

interface WorkerData {
  profile: Record<string, unknown> | null
  income:  Record<string, unknown> | null
  gig:     Record<string, unknown> | null
  payment: Record<string, unknown> | null
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

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profile, income, gig, payment] = await Promise.all([
        supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
        supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('payment_info').select('*').eq('worker_id', user.id).maybeSingle(),
      ])

      setData({
        profile: profile.data as Record<string, unknown>,
        income:  income.data  as Record<string, unknown> | null,
        gig:     gig.data     as Record<string, unknown> | null,
        payment: payment.data as Record<string, unknown> | null,
      })
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

    const payload = {
      worker_id: user.id,
      trigger_type: "Heavy Rainfall",
      trigger_icon: "🌧️",
      amount: data?.income?.avg_daily_earnings ? Number(data.income.avg_daily_earnings) * 2 : 1500, // 2 days of earnings
      fraud_score: Math.floor(Math.random() * 40),
      status: "pending-review"
    };

    const { error } = await supabase.from("claims").insert([payload]);

    if (error) {
      setClaimStatus('error')
      setClaimMsg("Failed to submit claim: " + error.message)
    } else {
      setClaimStatus('success')
      setClaimMsg('Your claim for Heavy Rainfall has been submitted successfully and is pending review!')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
      Loading dashboard data...
    </div>
  )

  const tier: Tier = isTier(data?.income?.income_tier) ? data!.income!.income_tier as Tier : 'standard'
  const premium   = PREMIUM_MAP[tier]
  const maxPayout = PAYOUT_MAP[tier]
  const firstName = typeof data?.profile?.full_name === 'string' ? data.profile.full_name.split(' ')[0] : 'Partner'
  const city      = typeof data?.profile?.city === 'string' ? data.profile.city : ''
  const platform  = typeof data?.gig?.platform === 'string' ? data.gig.platform.charAt(0).toUpperCase() + data.gig.platform.slice(1) : 'Delivery'
  const daily     = typeof data?.income?.avg_daily_earnings === 'number' ? data.income.avg_daily_earnings : 0
  const risk      = typeof data?.income?.zone_risk_level === 'string' ? data.income.zone_risk_level : '-'
  const payout    = typeof data?.payment?.upi_id === 'string' && data.payment.upi_id ? 'UPI' : 'Bank'

  const s: Record<string, React.CSSProperties> = {
    card:    { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 },
    label:   { fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 16px' },
    metricBox: { background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16 },
    metricLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' },
    metricVal: { fontSize: 24, fontWeight: 600, margin: 0 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    rowLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
    rowVal: { fontSize: 14, fontWeight: 500 },
  }

  const TRIGGERS = [
    ['Heavy rainfall', '≥ 50mm in 3 hours'],
    ['Extreme heat', 'Feels-like ≥ 45°C for 4+ hrs'],
    ['Severe AQI', 'AQI ≥ 400 + GRAP Stage IV'],
    ['Curfew / bandh', 'Official curfew declared'],
    ['Platform outage', 'App down ≥ 2 hrs'],
  ]

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em', color: '#fff' }}>Welcome back, {firstName} 👋</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{platform} delivery partner{city ? ` · ${city}` : ''}</p>
      </div>

      {/* Coverage Overview */}
      <div style={{ ...s.card, background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(249,115,22,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ ...s.label, color: '#f97316', margin: 0 }}>Coverage Overview</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div style={s.metricBox}><p style={s.metricLabel}>Weekly premium</p><p style={{ ...s.metricVal, color: '#fff' }}>₹{premium}</p></div>
          <div style={s.metricBox}><p style={s.metricLabel}>Max payout</p><p style={{ ...s.metricVal, color: '#fff' }}>₹{maxPayout.toLocaleString('en-IN')}</p></div>
          <div style={s.metricBox}><p style={s.metricLabel}>Income tier</p><p style={{ ...s.metricVal, color: '#f97316', textTransform: 'capitalize' }}>{tier}</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 20, marginBottom: 20 }}>
        <div style={{ ...s.card, marginBottom: 0 }}>
          <p style={s.label}>Active Weather Alert</p>
          <div style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 24 }}>🌧️</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#fbbf24', margin: '0 0 4px' }}>Heavy Rain Warning</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Rainfall 48mm recorded in your active zone in the last 2 hours.</p>
              </div>
            </div>
          </div>
          
          {claimStatus === 'success' ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '16px', color: '#4ade80', fontSize: 14, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 24 }}>✅</div>
              {claimMsg}
            </div>
          ) : (
            <>
              <button 
                onClick={handleQuickClaim} 
                disabled={submitting} 
                style={{ 
                  width: '100%', padding: '14px', 
                  background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#f97316,#ea580c)', 
                  border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600, 
                  cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: submitting ? 'none' : '0 4px 14px rgba(249,115,22,0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { if(!submitting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseOut={(e) => { if(!submitting) e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <Zap size={18} />
                {submitting ? 'Submitting Claim...' : 'Quick Claim for Heavy Rain'}
              </button>
              {claimStatus === 'error' && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: 8 }}>❌ {claimMsg}</p>
              )}
            </>
          )}
        </div>

        <div style={{ ...s.card, marginBottom: 0 }}>
          <p style={s.label}>Your Activity</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              ['Avg daily earnings', `₹${daily.toLocaleString('en-IN')}`],
              ['Risk zone', risk],
              ['Payout method', payout],
              ['Platform', platform],
            ].map(([l, v], i, arr) => (
              <div key={l} style={{ ...s.row, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: i === 0 ? '0 0 12px' : i === arr.length - 1 ? '12px 0 0' : '12px 0' }}>
                <span style={s.rowLabel}>{l}</span>
                <span style={{ ...s.rowVal, color: '#fff', textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.card}>
        <p style={s.label}>Parametric triggers watching for you</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          {TRIGGERS.map(([name, threshold], i) => (
            <div key={name} style={{ ...s.row, borderBottom: i < TRIGGERS.length - (TRIGGERS.length % 2 === 0 ? 2 : 1) ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px', color: '#fff' }}>{name}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{threshold}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}