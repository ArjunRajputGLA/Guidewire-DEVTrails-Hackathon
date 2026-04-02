// // app/(auth)/login/page.tsx
// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase-browser'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async () => {
//   if (!email || !password) { setError('Please fill in all fields'); return }
//   setLoading(true)
//   setError('')

//   const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

//   if (authError) {
//     setError(authError.message === 'Invalid login credentials'
//       ? 'Incorrect email or password'
//       : authError.message)
//     setLoading(false)
//     return
//   }

//   const { data: { user } } = await supabase.auth.getUser()
//   if (!user) { setLoading(false); return }

//   const { data: profile, error: profileError } = await supabase
//     .from('worker_profiles')
//     .select('onboarding_complete, onboarding_step')
//     .eq('id', user.id)
//     .single()

//   console.log('USER ID:', user.id)
//   console.log('PROFILE:', profile)
//   console.log('PROFILE ERROR:', profileError)

//   if (!profile?.onboarding_complete) {
//     const step = (!profile?.onboarding_step || profile.onboarding_step < 1) ? 1 : profile.onboarding_step
//     router.push(`/onboarding/step-${step}`)
//   } else {
//     router.push('/worker/dashboard')
//   }
// }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       fontFamily: '"DM Sans", sans-serif',
//       color: '#fff',
//       padding: '24px',
//     }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
//         * { box-sizing: border-box; }
//         input { outline: none; }
//         input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
//         .login-btn:hover { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
//         .login-btn:active { transform: translateY(0); }
//         .login-btn { transition: all 0.2s ease; }
//         @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//         .card { animation: fadeUp 0.5s ease forwards; }
//       `}</style>

//       <div className="card" style={{ width: '100%', maxWidth: 420 }}>

//         {/* Logo */}
//         <div style={{ textAlign: 'center', marginBottom: 40 }}>
//           <div style={{
//             width: 56, height: 56, borderRadius: 16,
//             background: 'linear-gradient(135deg, #f97316, #ea580c)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 28, fontWeight: 800, margin: '0 auto 16px',
//           }}>G</div>
//           <h1 style={{
//             fontFamily: '"Syne", sans-serif', fontWeight: 800,
//             fontSize: 28, margin: 0, letterSpacing: '-0.5px',
//           }}>Welcome back</h1>
//           <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 15 }}>
//             Sign in to your GigShield account
//           </p>
//         </div>

//         {/* Card */}
//         <div style={{
//           background: 'rgba(255,255,255,0.04)',
//           border: '1px solid rgba(255,255,255,0.08)',
//           borderRadius: 20,
//           padding: '32px 28px',
//           backdropFilter: 'blur(10px)',
//         }}>

//           {/* Error */}
//           {error && (
//             <div style={{
//               background: 'rgba(239,68,68,0.12)',
//               border: '1px solid rgba(239,68,68,0.3)',
//               borderRadius: 10,
//               padding: '12px 16px',
//               marginBottom: 20,
//               color: '#fca5a5',
//               fontSize: 14,
//             }}>
//               {error}
//             </div>
//           )}

//           {/* Email */}
//           <div style={{ marginBottom: 16 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               Email address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && handleLogin()}
//               placeholder="rahul@example.com"
//               style={{
//                 width: '100%', padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.12)',
//                 borderRadius: 12, color: '#fff', fontSize: 15,
//                 transition: 'border-color 0.2s, box-shadow 0.2s',
//               }}
//             />
//           </div>

//           {/* Password */}
//           <div style={{ marginBottom: 24 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
//               <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
//                 Password
//               </label>
//               <Link href="/forgot-password" style={{ fontSize: 13, color: '#fb923c', textDecoration: 'none' }}>
//                 Forgot password?
//               </Link>
//             </div>
//             <input
//               type="password"
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && handleLogin()}
//               placeholder="Enter your password"
//               style={{
//                 width: '100%', padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.12)',
//                 borderRadius: 12, color: '#fff', fontSize: 15,
//                 transition: 'border-color 0.2s, box-shadow 0.2s',
//               }}
//             />
//           </div>

//           {/* Submit */}
//           <button
//             className="login-btn"
//             onClick={handleLogin}
//             disabled={loading}
//             style={{
//               width: '100%', padding: '15px',
//               background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea580c)',
//               border: 'none', borderRadius: 12,
//               color: '#fff', fontSize: 16, fontWeight: 600,
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontFamily: '"DM Sans", sans-serif',
//             }}
//           >
//             {loading ? 'Signing in...' : 'Sign in'}
//           </button>
//         </div>

//         {/* Sign up link */}
//         <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
//           New to GigShield?{' '}
//           <Link href="/signup" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
//             Create account
//           </Link>
//         </p>
//       </div>
//     </div>
//   )
// }


'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (role: 'admin' | 'worker' = 'worker') => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    
    // Admin login path
    if (role === 'admin' || (email === 'admin@gigshield.com' && password === '123456')) {
      const res = login(email, password)
      if (res.success) {
        router.push('/admin/dashboard')
      } else {
        setError(res.error || 'Failed to login as admin')
      }
      return
    }

    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Incorrect email or password'
        : authError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('onboarding_complete, onboarding_step')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_complete) {
      const step = (!profile?.onboarding_step || profile.onboarding_step < 1) ? 1 : profile.onboarding_step
      router.push(`/onboarding/step-${step}`)
    } else {
      router.push('/worker/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      fontFamily: '"DM Sans", sans-serif',
      color: '#fff',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .inp:focus { border-color: rgba(249,115,22,0.6) !important; background: rgba(249,115,22,0.04) !important; }
        .sign-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sign-btn { transition: all 0.2s; }
        .show-btn:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* Left panel */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #1a0a00 0%, #0f0a00 40%, #0a0a0f 100%)',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 16,
          }}>G</div>
          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>GigShield</span>
        </div>

        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Protecting 1,200+ gig workers</span>
          </div>

          <h2 style={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: 32, lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '-0.5px',
          }}>
            Income protection<br />when it matters most
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>
            Parametric insurance designed for delivery partners. Get paid within minutes when heavy rain, extreme heat, or platform outages stop your work.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['🌧️', 'Heavy rainfall triggers', 'Auto-payout on 50mm+ rainfall'],
            ['🌡️', 'Extreme heat coverage', 'Feels-like ≥ 45°C for 4+ hours'],
            ['📵', 'Platform outage', 'App down ≥ 2 hours'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '12px 14px',
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.3px',
            }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Sign in to your GigShield account
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '11px 14px',
              marginBottom: 20, color: '#fca5a5', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>⚠</span> {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.02em' }}>
              EMAIL ADDRESS
            </label>
            <input
              className="inp"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin('worker')}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 11, color: '#fff', fontSize: 14,
                transition: 'all 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}>
                PASSWORD
              </label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: '#fb923c', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="inp"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin('worker')}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '13px 44px 13px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 11, color: '#fff', fontSize: 14,
                  transition: 'all 0.2s',
                }}
              />
              <button
                className="show-btn"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'inherit',
                  transition: 'color 0.2s',
                }}
              >{showPass ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="sign-btn"
              onClick={() => handleLogin('admin')}
              disabled={loading}
              style={{
                flex: 1, padding: '14px',
                background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11,
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? '...' : 'Admin Login'}
            </button>

            <button
              className="sign-btn"
              onClick={() => handleLogin('worker')}
              disabled={loading}
              style={{
                flex: 2, padding: '14px',
                background: loading ? 'rgba(249,115,22,0.35)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                border: 'none', borderRadius: 11,
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Signing in...' : 'Worker Login →'}
            </button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            New to GigShield?{' '}
            <Link href="/signup" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}