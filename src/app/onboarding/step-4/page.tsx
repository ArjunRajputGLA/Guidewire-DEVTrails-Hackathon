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

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 15,
    fontFamily: '"DM Sans", sans-serif', outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 } as React.CSSProperties

  // Platform pill selector
  const PlatformPill = ({ value, label, emoji }: { value: string, label: string, emoji: string }) => (
    <button
      onClick={() => setForm(f => ({ ...f, platform: value }))}
      style={{
        flex: 1, padding: '14px 12px',
        background: form.platform === value ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
        border: `2px solid ${form.platform === value ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, cursor: 'pointer', color: '#fff',
        fontFamily: '"DM Sans", sans-serif', fontSize: 14, fontWeight: 500,
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{emoji}</span>
      {label}
    </button>
  )

  const VehiclePill = ({ value, label, emoji }: { value: string, label: string, emoji: string }) => (
    <button
      onClick={() => setForm(f => ({ ...f, vehicle_type: value }))}
      style={{
        flex: 1, padding: '10px 8px',
        background: form.vehicle_type === value ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
        border: `2px solid ${form.vehicle_type === value ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 10, cursor: 'pointer', color: '#fff',
        fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 500,
        transition: 'all 0.2s', textAlign: 'center',
      }}
    >
      <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>{emoji}</span>
      {label}
    </button>
  )

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        input:focus, select:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
        .btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(249,115,22,0.15)', marginBottom: 16, fontSize: 24,
        }}>🛵</div>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 24, margin: '0 0 8px' }}>
          Gig platform details
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          Tell us about your delivery work
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
        }}>{error}</div>
      )}

      {/* Platform */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Which platform do you work on?</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <PlatformPill value="zomato" label="Zomato" emoji="🔴" />
          <PlatformPill value="swiggy" label="Swiggy" emoji="🟠" />
          <PlatformPill value="both" label="Both" emoji="⚡" />
        </div>
      </div>

      {/* Worker ID */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Your delivery partner ID (optional)</label>
        <input style={inputStyle} placeholder="e.g. ZM123456789"
          value={form.worker_id_on_platform} onChange={set('worker_id_on_platform')} />
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
          Found in your Zomato/Swiggy partner app → Profile
        </p>
      </div>

      {/* Tenure */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>How long have you been delivering?</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Under 3 months', value: '1' },
            { label: '3–6 months', value: '4' },
            { label: '6–12 months', value: '9' },
            { label: '1–2 years', value: '18' },
            { label: '2+ years', value: '30' },
          ].map(opt => (
            <button key={opt.value}
              onClick={() => setForm(f => ({ ...f, tenure_months: opt.value }))}
              style={{
                padding: '8px 14px',
                background: form.tenure_months === opt.value ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${form.tenure_months === opt.value ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, cursor: 'pointer', color: '#fff',
                fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s',
              }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Vehicle type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <VehiclePill value="petrol_bike" label="Petrol bike" emoji="🏍️" />
          <VehiclePill value="electric_bike" label="EV bike" emoji="⚡" />
          <VehiclePill value="bicycle" label="Bicycle" emoji="🚲" />
          <VehiclePill value="other" label="Other" emoji="🚗" />
        </div>
      </div>

      {/* Working hours */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Typical working hours</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="time" style={{ ...inputStyle, width: 'auto', flex: 1 }}
            value={form.working_hours_start} onChange={set('working_hours_start')} />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>to</span>
          <input type="time" style={{ ...inputStyle, width: 'auto', flex: 1 }}
            value={form.working_hours_end} onChange={set('working_hours_end')} />
        </div>
      </div>

      {/* Avg orders */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Average orders per day (optional)</label>
        <input style={inputStyle} type="number" placeholder="e.g. 18"
          value={form.avg_orders_per_day} onChange={set('avg_orders_per_day')} min="1" max="100" />
      </div>

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