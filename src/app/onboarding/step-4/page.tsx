// app/onboarding/step-4/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function Step4() {
  const router = useRouter()
  const [form, setForm] = useState({
    platform: '', worker_id_on_platform: '', tenure_months: '',
    vehicle_type: '', working_hours_start: '09:00', working_hours_end: '21:00',
    avg_orders_per_day: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleNext = async () => {
    setError('')
    if (!form.platform) { setError('Please select your delivery platform'); return }
    if (!form.vehicle_type) { setError('Please select your vehicle type'); return }
    if (!form.tenure_months) { setError('Please enter your tenure'); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: dbError } = await supabase.from('gig_profiles').upsert({
      id: user.id,
      platform: form.platform as any,
      worker_id_on_platform: form.worker_id_on_platform,
      tenure_months: parseInt(form.tenure_months),
      vehicle_type: form.vehicle_type as any,
      working_hours_start: form.working_hours_start,
      working_hours_end: form.working_hours_end,
      avg_orders_per_day: form.avg_orders_per_day ? parseInt(form.avg_orders_per_day) : null,
    })

    if (dbError) { setError(dbError.message); setLoading(false); return }
    await supabase.from('worker_profiles').update({ onboarding_step: 5 }).eq('id', user.id)
    router.push('/onboarding/step-5')
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

  // Platform selector
  const platforms = [
    { value: 'zomato', label: 'Zomato', emoji: '🔴', color: '#ef4444' },
    { value: 'swiggy', label: 'Swiggy', emoji: '🟠', color: '#f97316' },
    { value: 'blinkit', label: 'Blinkit', emoji: '🟡', color: '#facc15' },
    { value: 'both', label: 'Both', emoji: '⚡', color: '#eab308' },
  ]

  // Vehicle selector
  const vehicles = [
    { value: 'petrol_bike', label: 'Petrol', emoji: '🏍️' },
    { value: 'electric_bike', label: 'EV Bike', emoji: '⚡' },
    { value: 'bicycle', label: 'Bicycle', emoji: '🚲' },
    { value: 'other', label: 'Other', emoji: '🚗' },
  ]

  const tenureOptions = [
    { label: 'Under 3 mo', value: '1' },
    { label: '3–6 mo', value: '4' },
    { label: '6–12 mo', value: '9' },
    { label: '1–2 yrs', value: '18' },
    { label: '2+ yrs', value: '30' },
  ]

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .g1 { animation: fadeUp 0.4s ease 0.05s both; }
        .g2 { animation: fadeUp 0.4s ease 0.12s both; }
        .g3 { animation: fadeUp 0.4s ease 0.19s both; }
        .g4 { animation: fadeUp 0.4s ease 0.26s both; }
        .g5 { animation: fadeUp 0.4s ease 0.33s both; }
        .g6 { animation: fadeUp 0.4s ease 0.40s both; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 18,
        }}>🛵</div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>Gig platform details</h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Tell us about your delivery work
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

      {/* Platform */}
      <div className="g1" style={{ marginBottom: 22 }}>
        <label style={lbl}>Which platform do you work on?</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {platforms.map(p => (
            <button key={p.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, platform: p.value }))}
              style={{
                flex: 1, padding: '14px 10px',
                background: form.platform === p.value ? `${p.color}18` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${form.platform === p.value ? `${p.color}60` : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, cursor: 'pointer', color: '#fff',
                fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                boxShadow: form.platform === p.value ? `0 0 16px ${p.color}20` : 'none',
              }}
            >
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
              <span style={{ color: form.platform === p.value ? p.color : 'rgba(255,255,255,0.6)' }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Worker ID */}
      <div className="g2" style={{ marginBottom: 22 }}>
        <label style={lbl}>Delivery partner ID <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <input style={inp} placeholder="e.g. ZM123456789"
          value={form.worker_id_on_platform} onChange={set('worker_id_on_platform')} />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
          Found in your Zomato/Swiggy/Blinkit partner app → Profile
        </p>
      </div>

      {/* Tenure */}
      <div className="g3" style={{ marginBottom: 22 }}>
        <label style={lbl}>How long have you been delivering?</label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {tenureOptions.map(opt => (
            <button key={opt.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, tenure_months: opt.value }))}
              style={{
                padding: '9px 14px',
                background: form.tenure_months === opt.value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${form.tenure_months === opt.value ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 9, cursor: 'pointer', color: form.tenure_months === opt.value ? '#fb923c' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: form.tenure_months === opt.value ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div className="g4" style={{ marginBottom: 22 }}>
        <label style={lbl}>Vehicle type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {vehicles.map(v => (
            <button key={v.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, vehicle_type: v.value }))}
              style={{
                padding: '12px 8px',
                background: form.vehicle_type === v.value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${form.vehicle_type === v.value ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 12, cursor: 'pointer', color: '#fff',
                fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 500,
                transition: 'all 0.2s ease', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 20 }}>{v.emoji}</span>
              <span style={{ color: form.vehicle_type === v.value ? '#fb923c' : 'rgba(255,255,255,0.5)', fontSize: 11 }}>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Working hours */}
      <div className="g5" style={{ marginBottom: 18 }}>
        <label style={lbl}>Typical working hours</label>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: '4px 12px',
        }}>
          <input type="time"
            style={{ ...inp, border: 'none', background: 'transparent', padding: '10px 4px', flex: 1 }}
            value={form.working_hours_start} onChange={set('working_hours_start')} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600 }}>to</span>
          <input type="time"
            style={{ ...inp, border: 'none', background: 'transparent', padding: '10px 4px', flex: 1 }}
            value={form.working_hours_end} onChange={set('working_hours_end')} />
        </div>
      </div>

      {/* Avg orders */}
      <div className="g5" style={{ marginBottom: 28 }}>
        <label style={lbl}>Average orders per day <span style={{ color: 'rgba(255,255,255,0.25)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <input style={inp} type="number" placeholder="e.g. 18"
          value={form.avg_orders_per_day} onChange={set('avg_orders_per_day')} min="1" max="100" />
      </div>

      <div className="g6">
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
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}