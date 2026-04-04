// app/onboarding/step-2/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
]

export default function Step2() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', city: '', city_zone: '', state: '', address: '', pincode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required'
    if (!form.date_of_birth) return 'Date of birth is required'
    if (!form.gender) return 'Please select gender'
    if (!form.city.trim()) return 'City is required'
    if (!form.city_zone.trim()) return 'City zone is required'
    if (!form.state) return 'Please select state'
    const age = (Date.now() - new Date(form.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365)
    if (age < 18) return 'You must be at least 18 years old'
    if (age > 70) return 'Please enter a valid date of birth'
    return null
  }

  const handleNext = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: dbError } = await supabase
      .from('worker_profiles')
      .update({ ...form, onboarding_step: 3 })
      .eq('id', user.id)

    if (dbError) { setError(dbError.message); setLoading(false); return }
    router.push('/onboarding/step-3')
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

  const GenderBtn = ({ value, label, emoji }: { value: string; label: string; emoji: string }) => (
    <button
      type="button"
      onClick={() => setForm(f => ({ ...f, gender: value }))}
      style={{
        flex: 1, padding: '12px 8px',
        background: form.gender === value ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${form.gender === value ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 12, cursor: 'pointer', color: '#fff',
        fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: 600,
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <span style={{ color: form.gender === value ? '#fb923c' : 'rgba(255,255,255,0.55)' }}>{label}</span>
    </button>
  )

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .f1 { animation-delay: 0.05s; opacity: 0; }
        .f2 { animation-delay: 0.12s; opacity: 0; }
        .f3 { animation-delay: 0.18s; opacity: 0; }
        .f4 { animation-delay: 0.24s; opacity: 0; }
        .f5 { animation-delay: 0.30s; opacity: 0; }

        .section-divider {
          display: flex; align-items: center; gap: 10; margin: 20px 0 18px;
        }
        .section-divider span {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(255,255,255,0.25);
          white-space: nowrap;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06);
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
        }}>👤</div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>Personal details</h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Basic info to create your worker profile
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

      {/* Full name */}
      <div className="fade-up f1" style={{ marginBottom: 16 }}>
        <label style={lbl}>Full name (as per ID)</label>
        <input style={inp} placeholder="Rahul Kumar Sharma"
          value={form.full_name} onChange={set('full_name')} />
      </div>

      {/* DOB + Gender */}
      <div className="fade-up f2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={lbl}>Date of birth</label>
          <input type="date" style={{ ...inp, colorScheme: 'dark' }}
            value={form.date_of_birth} onChange={set('date_of_birth')}
            max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label style={lbl}>Gender</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <GenderBtn value="male" label="Male" emoji="👨" />
            <GenderBtn value="female" label="Female" emoji="👩" />
            <GenderBtn value="other" label="Other" emoji="🧑" />
          </div>
        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider fade-up f2">
        <span>Location</span>
      </div>

      {/* City + Zone */}
      <div className="fade-up f3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={lbl}>City</label>
          <input style={inp} placeholder="Mumbai"
            value={form.city} onChange={set('city')} />
        </div>
        <div>
          <label style={lbl}>City Zone</label>
          <input style={inp} placeholder="Andheri West"
            value={form.city_zone} onChange={set('city_zone')} />
        </div>
      </div>

      {/* State */}
      <div className="fade-up f3" style={{ marginBottom: 16 }}>
        <label style={lbl}>State</label>
        <select style={inp} value={form.state} onChange={set('state')}>
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Section divider */}
      <div className="section-divider fade-up f4">
        <span>Optional details</span>
      </div>

      {/* Address */}
      <div className="fade-up f4" style={{ marginBottom: 16 }}>
        <label style={lbl}>Address</label>
        <input style={inp} placeholder="Flat 203, Shiv Nagar, Andheri West"
          value={form.address} onChange={set('address')} />
      </div>

      {/* Pincode */}
      <div className="fade-up f4" style={{ marginBottom: 28 }}>
        <label style={lbl}>Pincode</label>
        <input style={inp} placeholder="400058" maxLength={6}
          value={form.pincode}
          onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />
      </div>

      {/* CTA */}
      <div className="fade-up f5">
        <button
          className="step-btn"
          onClick={handleNext} disabled={loading}
          style={{
            width: '100%', padding: '15px',
            background: loading ? 'rgba(249,115,22,0.35)' : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
            border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 15, fontWeight: 700,
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