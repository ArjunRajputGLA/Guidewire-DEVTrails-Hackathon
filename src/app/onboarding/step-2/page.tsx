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

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#fff', fontSize: 15,
    fontFamily: '"DM Sans", sans-serif',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 500,
    color: 'rgba(255,255,255,0.6)', marginBottom: 8
  } as React.CSSProperties

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');
        input:focus, select:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        select option { background: #1a1a2e; color: #fff; }
        .btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
        .btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(249,115,22,0.15)', marginBottom: 16, fontSize: 24,
        }}>👤</div>
        <h2 style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.3px',
        }}>Personal details</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          Basic info to create your worker profile
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
        }}>{error}</div>
      )}

      {/* Full name */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Full name (as per ID)</label>
        <input style={inputStyle} placeholder="Rahul Kumar Sharma"
          value={form.full_name} onChange={set('full_name')} />
      </div>

      {/* DOB + Gender row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Date of birth</label>
          <input type="date" style={inputStyle}
            value={form.date_of_birth} onChange={set('date_of_birth')}
            max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label style={labelStyle}>Gender</label>
          <select style={inputStyle} value={form.gender} onChange={set('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* City + State row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>City</label>
          <input style={inputStyle} placeholder="Mumbai"
            value={form.city} onChange={set('city')} />
        </div>
        <div>
          <label style={labelStyle}>City Zone</label>
          <input style={inputStyle} placeholder="Andheri West"
            value={form.city_zone} onChange={set('city_zone')} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>State</label>
        <select style={inputStyle} value={form.state} onChange={set('state')}>
          <option value="">Select state</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Address */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Address (optional)</label>
        <input style={inputStyle} placeholder="Flat 203, Shiv Nagar, Andheri West"
          value={form.address} onChange={set('address')} />
      </div>

      {/* Pincode */}
      <div style={{ marginBottom: 32 }}>
        <label style={labelStyle}>Pincode (optional)</label>
        <input style={inputStyle} placeholder="400058" maxLength={6}
          value={form.pincode}
          onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} />
      </div>

      <button
        className="btn"
        onClick={handleNext} disabled={loading}
        style={{
          width: '100%', padding: '15px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          border: 'none', borderRadius: 12,
          color: '#fff', fontSize: 16, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '"DM Sans", sans-serif',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Saving...' : 'Continue →'}
      </button>
    </div>
  )
}