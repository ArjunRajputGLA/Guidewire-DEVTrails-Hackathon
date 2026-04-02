// 'use client'
// import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase-browser'
// import { useRouter } from 'next/navigation'

// interface WorkerData {
//   profile: Record<string, unknown> | null
//   income:  Record<string, unknown> | null
//   gig:     Record<string, unknown> | null
//   payment: Record<string, unknown> | null
// }

// const PREMIUM_MAP: Record<'starter' | 'standard' | 'pro', number> = {
//   starter: 29, standard: 49, pro: 79,
// }

// const PAYOUT_MAP: Record<'starter' | 'standard' | 'pro', number> = {
//   starter: 1500, standard: 2500, pro: 4000,
// }

// const TIER_COLORS: Record<'starter' | 'standard' | 'pro', string> = {
//   starter: '#3b82f6', standard: '#f97316', pro: '#a855f7',
// }

// type Tier = 'starter' | 'standard' | 'pro'

// function isTier(value: unknown): value is Tier {
//   return value === 'starter' || value === 'standard' || value === 'pro'
// }

// export default function WorkerDashboard() {
//   const router = useRouter()
//   const [data, setData] = useState<WorkerData | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) { router.push('/login'); return }

//       // const [profile, income, gig, payment] = await Promise.all([
//       //   supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
//       //   supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
//       //   supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
//       //   supabase.from('payment_info').select('*').eq('worker_id', user.id).maybeSingle(),
//       // ])

//       // if (!profile.data) { router.push('/login'); return }

//       const [profile, income, gig, payment] = await Promise.all([
//         supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
//         supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
//         supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
//         supabase.from('payment_info').select('*').eq('worker_id', user.id).maybeSingle(),
//       ])

//       console.log('DASHBOARD profile.data:', profile.data)
//       console.log('DASHBOARD profile.error:', profile.error)

//       if (!profile.data) { router.push('/login'); return }

//       setData({
//         profile: profile.data as Record<string, unknown> | null,
//         income:  income.data  as Record<string, unknown> | null,
//         gig:     gig.data     as Record<string, unknown> | null,
//         payment: payment.data as Record<string, unknown> | null,
//       })
//       setLoading(false)
//     }
//     fetchData()
//   }, [router])

//   const handleSignout = async () => {
//     await supabase.auth.signOut()
//     router.push('/login')
//   }

//   if (loading) {
//     return (
//       <div style={{
//         minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
//         background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
//         color: '#fff', fontFamily: '"DM Sans", sans-serif',
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
//           <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading your dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   const rawTier = data?.income?.income_tier
//   const tier: Tier = isTier(rawTier) ? rawTier : 'standard'

//   const premium   = PREMIUM_MAP[tier]
//   const maxPayout = PAYOUT_MAP[tier]

//   const firstName = typeof data?.profile?.full_name === 'string'
//     ? data.profile.full_name.split(' ')[0]
//     : 'Partner'

//   const platformRaw = data?.gig?.platform
//   const platformLabel = typeof platformRaw === 'string'
//     ? platformRaw.charAt(0).toUpperCase() + platformRaw.slice(1) + ' delivery partner'
//     : 'Delivery partner'

//   const city = typeof data?.profile?.city === 'string' ? data.profile.city : ''

//   const dailyEarnings = typeof data?.income?.avg_daily_earnings === 'number'
//     ? data.income.avg_daily_earnings : 0

//   const riskLevel = typeof data?.income?.zone_risk_level === 'string'
//     ? data.income.zone_risk_level : '-'

//   const payoutMethod = typeof data?.payment?.upi_id === 'string' && data.payment.upi_id
//     ? 'UPI' : 'Bank'

//   const gigPlatform = typeof data?.gig?.platform === 'string' ? data.gig.platform : '-'

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
//       fontFamily: '"DM Sans", sans-serif', color: '#fff',
//     }}>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

//       <header style={{
//         padding: '20px 24px', display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between',
//         borderBottom: '1px solid rgba(255,255,255,0.06)',
//         maxWidth: 640, margin: '0 auto', width: '100%',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 36, height: 36, borderRadius: 10,
//             background: 'linear-gradient(135deg, #f97316, #ea580c)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 18, fontWeight: 800,
//           }}>G</div>
//           <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 18 }}>GigShield</span>
//         </div>
//         <button
//           onClick={handleSignout}
//           style={{
//             background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
//             borderRadius: 8, padding: '8px 14px', color: 'rgba(255,255,255,0.5)',
//             cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: 13,
//           }}
//         >Sign out</button>
//       </header>

//       <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 24px' }}>

//         <div style={{ marginBottom: 28 }}>
//           <h1 style={{
//             fontFamily: '"Syne", sans-serif', fontWeight: 800,
//             fontSize: 26, margin: '0 0 6px',
//           }}>
//             Welcome, {firstName} 👋
//           </h1>
//           <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>
//             {platformLabel}{city ? ` · ${city}` : ''}
//           </p>
//         </div>

//         <div style={{
//           background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1))',
//           border: '1px solid rgba(249,115,22,0.3)',
//           borderRadius: 20, padding: 24, marginBottom: 16,
//         }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
//             <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
//               ACTIVE COVERAGE
//             </span>
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
//               borderRadius: 20, padding: '4px 10px',
//             }}>
//               <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
//               <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>Active</span>
//             </div>
//           </div>

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//             <div>
//               <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Weekly premium</p>
//               <p style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: '"Syne", sans-serif' }}>₹{premium}</p>
//             </div>
//             <div>
//               <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Max weekly payout</p>
//               <p style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: '"Syne", sans-serif' }}>₹{maxPayout.toLocaleString('en-IN')}</p>
//             </div>
//           </div>

//           <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Income tier</span>
//               <span style={{ fontSize: 13, fontWeight: 600, color: TIER_COLORS[tier], textTransform: 'capitalize' }}>{tier}</span>
//             </div>
//           </div>
//         </div>

//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
//           {[
//             { label: 'Avg daily earnings', value: `₹${dailyEarnings.toLocaleString('en-IN')}`, icon: '💵' },
//             { label: 'Risk zone',          value: riskLevel,                                    icon: '📍' },
//             { label: 'Payout method',      value: payoutMethod,                                 icon: '⚡' },
//             { label: 'Platform',           value: gigPlatform,                                  icon: '🛵' },
//           ].map(item => (
//             <div key={item.label} style={{
//               background: 'rgba(255,255,255,0.04)',
//               border: '1px solid rgba(255,255,255,0.08)',
//               borderRadius: 14, padding: '16px',
//             }}>
//               <span style={{ fontSize: 20 }}>{item.icon}</span>
//               <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '8px 0 4px' }}>{item.label}</p>
//               <p style={{ fontSize: 16, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{item.value}</p>
//             </div>
//           ))}
//         </div>

//         <div style={{
//           background: 'rgba(255,255,255,0.03)',
//           border: '1px solid rgba(255,255,255,0.08)',
//           borderRadius: 16, padding: '20px',
//         }}>
//           <p style={{
//             fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
//             marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em',
//           }}>
//             Parametric triggers watching for you
//           </p>
//           {[
//             { icon: '🌧️', name: 'Heavy rainfall',  threshold: '≥ 50mm in 3 hours' },
//             { icon: '🌡️', name: 'Extreme heat',    threshold: 'Feels-like ≥ 45°C for 4+ hrs' },
//             { icon: '😷', name: 'Severe AQI',      threshold: 'AQI ≥ 400 + GRAP Stage IV' },
//             { icon: '🚫', name: 'Curfew / bandh',  threshold: 'Official curfew declared' },
//             { icon: '📵', name: 'Platform outage', threshold: 'App down ≥ 2 hrs' },
//           ].map(trigger => (
//             <div key={trigger.name} style={{
//               display: 'flex', alignItems: 'center', gap: 12,
//               padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
//             }}>
//               <span style={{ fontSize: 20, width: 28 }}>{trigger.icon}</span>
//               <div style={{ flex: 1 }}>
//                 <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>{trigger.name}</p>
//                 <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{trigger.threshold}</p>
//               </div>
//               <div style={{
//                 width: 8, height: 8, borderRadius: '50%',
//                 background: '#22c55e', boxShadow: '0 0 6px #22c55e',
//               }} />
//             </div>
//           ))}
//         </div>
//       </main>
//     </div>
//   )
// }


'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [data, setData] = useState<WorkerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profile, income, gig, payment] = await Promise.all([
        supabase.from('worker_profiles').select('*').eq('id', user.id).single(),
        supabase.from('income_data').select('*').eq('worker_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('gig_profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('payment_info').select('*').eq('worker_id', user.id).maybeSingle(),
      ])

      if (!profile.data) { router.push('/login'); return }

      setData({
        profile: profile.data as Record<string, unknown>,
        income:  income.data  as Record<string, unknown> | null,
        gig:     gig.data     as Record<string, unknown> | null,
        payment: payment.data as Record<string, unknown> | null,
      })
      setLoading(false)
    }
    fetchData()
  }, [router])

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f1a', color: '#fff', fontFamily: 'sans-serif' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
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
    page:    { minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: '"DM Sans", sans-serif' },
    header:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: 680, margin: '0 auto' },
    main:    { maxWidth: 680, margin: '0 auto', padding: '24px' },
    card:    { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', marginBottom: 12 },
    label:   { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 12px' },
    metricBox: { background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 },
    metricLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' },
    metricVal: { fontSize: 22, fontWeight: 600, margin: 0 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    rowLabel: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
    rowVal: { fontSize: 13, fontWeight: 500 },
  }

  const TRIGGERS = [
    ['Heavy rainfall', '≥ 50mm in 3 hours'],
    ['Extreme heat', 'Feels-like ≥ 45°C for 4+ hrs'],
    ['Severe AQI', 'AQI ≥ 400 + GRAP Stage IV'],
    ['Curfew / bandh', 'Official curfew declared'],
    ['Platform outage', 'App down ≥ 2 hrs'],
  ]

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>G</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>GigShield</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Actively protected</span>
          </div>
          <button onClick={handleSignout} style={{ fontSize: 13, padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      </div>

      <div style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px' }}>Welcome back, {firstName}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{platform} delivery partner{city ? ` · ${city}` : ''}</p>
        </div>

        {/* Coverage */}
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={s.label}>Coverage status</p>
            <span style={{ fontSize: 12, background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', padding: '3px 10px', borderRadius: 20 }}>Active</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={s.metricBox}><p style={s.metricLabel}>Weekly premium</p><p style={s.metricVal}>₹{premium}</p></div>
            <div style={s.metricBox}><p style={s.metricLabel}>Max payout</p><p style={s.metricVal}>₹{maxPayout.toLocaleString('en-IN')}</p></div>
            <div style={s.metricBox}><p style={s.metricLabel}>Income tier</p><p style={{ ...s.metricVal, fontSize: 18, color: '#f97316', textTransform: 'capitalize' }}>{tier}</p></div>
          </div>
        </div>

        {/* Two column row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ ...s.card, marginBottom: 0 }}>
            <p style={s.label}>Active alert</p>
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', margin: '0 0 2px' }}>Heavy rain warning</p>
              <p style={{ fontSize: 12, color: 'rgba(251,191,36,0.7)', margin: 0 }}>Rainfall 48mm · your zone</p>
            </div>
            
            {claimStatus === 'success' ? (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', color: '#4ade80', fontSize: 12, textAlign: 'center' }}>
                ✅ {claimMsg}
              </div>
            ) : (
              <>
                <button 
                  onClick={handleQuickClaim} 
                  disabled={submitting} 
                  style={{ width: '100%', padding: '9px', background: submitting ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                >
                  {submitting ? 'Submitting...' : 'Submit claim'}
                </button>
                {claimStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8, textAlign: 'center' }}>❌ {claimMsg}</p>
                )}
              </>
            )}
          </div>

          <div style={{ ...s.card, marginBottom: 0 }}>
            <p style={s.label}>Your activity</p>
            {[
              ['Avg daily earnings', `₹${daily.toLocaleString('en-IN')}`],
              ['Risk zone', risk],
              ['Payout method', payout],
              ['Platform', platform],
            ].map(([l, v], i, arr) => (
              <div key={l} style={{ ...s.row, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={s.rowLabel}>{l}</span>
                <span style={{ ...s.rowVal, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div style={s.card}>
          <p style={s.label}>Parametric triggers watching for you</p>
          {TRIGGERS.map(([name, threshold], i) => (
            <div key={name} style={{ ...s.row, borderBottom: i < TRIGGERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 2px' }}>{name}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{threshold}</p>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}