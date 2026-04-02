// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase-browser'
// import Link from 'next/link'

// export default function SignupPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirm, setConfirm] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [success, setSuccess] = useState(false)

//   const handleSignup = async () => {
//     setError('')
//     if (!email || !password || !confirm) { setError('Please fill in all fields'); return }
//     if (password.length < 8) { setError('Password must be at least 8 characters'); return }
//     if (password !== confirm) { setError('Passwords do not match'); return }

//     setLoading(true)

//     const { data, error: authError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         emailRedirectTo: `${window.location.origin}/auth/callback`
//       }
//     })

//     if (authError) {
//       setError(authError.message)
//       setLoading(false)
//       return
//     }

//     if (data.user) {
//       const { error: profileError } = await supabase
//         .from('worker_profiles')
//         .insert({ id: data.user.id, onboarding_step: 1 })

//       if (profileError && profileError.code !== '23505') {
//         console.error('Profile creation error:', profileError)
//       }

//       setSuccess(true)
//     }

//     setLoading(false)
//   }

//   if (success) {
//     return (
//       <div style={{
//         minHeight: '100vh',
//         background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontFamily: '"DM Sans", sans-serif', color: '#fff', padding: '24px',
//         textAlign: 'center',
//       }}>
//         <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
//         <div>
//           <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
//           <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>
//             Check your inbox
//           </h2>
//           <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 320, margin: '0 auto' }}>
//             We sent a confirmation link to <strong style={{ color: '#fb923c' }}>{email}</strong>. Click it to start your onboarding.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       fontFamily: '"DM Sans", sans-serif', color: '#fff', padding: '24px',
//     }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
//         * { box-sizing: border-box; }
//         input { outline: none; }
//         input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
//         .btn:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
//         .btn { transition: all 0.2s ease; }
//         @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
//         .card { animation: fadeUp 0.5s ease forwards; }
//         .strength-bar { height: 4px; border-radius: 4px; transition: all 0.3s; }
//       `}</style>

//       <div className="card" style={{ width: '100%', maxWidth: 420 }}>
//         <div style={{ textAlign: 'center', marginBottom: 40 }}>
//           <div style={{
//             width: 56, height: 56, borderRadius: 16,
//             background: 'linear-gradient(135deg, #f97316, #ea580c)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 28, fontWeight: 800, margin: '0 auto 16px',
//           }}>G</div>
//           <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-0.5px' }}>
//             Join GigShield
//           </h1>
//           <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 15 }}>
//             Protect your gig income in 2 minutes
//           </p>
//         </div>

//         <div style={{
//           background: 'rgba(255,255,255,0.04)',
//           border: '1px solid rgba(255,255,255,0.08)',
//           borderRadius: 20, padding: '32px 28px',
//           backdropFilter: 'blur(10px)',
//         }}>
//           {error && (
//             <div style={{
//               background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
//               borderRadius: 10, padding: '12px 16px', marginBottom: 20,
//               color: '#fca5a5', fontSize: 14,
//             }}>{error}</div>
//           )}

//           <div style={{ marginBottom: 16 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               Email address
//             </label>
//             <input
//               type="email" value={email} onChange={e => setEmail(e.target.value)}
//               placeholder="your@email.com"
//               style={{
//                 width: '100%', padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.12)',
//                 borderRadius: 12, color: '#fff', fontSize: 15,
//                 transition: 'border-color 0.2s, box-shadow 0.2s',
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: 16 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               Password
//             </label>
//             <input
//               type="password" value={password} onChange={e => setPassword(e.target.value)}
//               placeholder="Min. 8 characters"
//               style={{
//                 width: '100%', padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.12)',
//                 borderRadius: 12, color: '#fff', fontSize: 15,
//                 transition: 'border-color 0.2s, box-shadow 0.2s',
//               }}
//             />
//             {password.length > 0 && (
//               <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
//                 {[1,2,3,4].map(i => (
//                   <div key={i} className="strength-bar" style={{
//                     flex: 1,
//                     background: password.length >= i * 3
//                       ? password.length >= 12 ? '#22c55e'
//                         : password.length >= 8 ? '#f97316'
//                         : '#ef4444'
//                       : 'rgba(255,255,255,0.1)',
//                   }} />
//                 ))}
//               </div>
//             )}
//           </div>

//           <div style={{ marginBottom: 24 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               Confirm password
//             </label>
//             <input
//               type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && handleSignup()}
//               placeholder="Repeat your password"
//               style={{
//                 width: '100%', padding: '14px 16px',
//                 background: confirm && confirm === password ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.06)',
//                 border: `1px solid ${confirm && confirm === password ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
//                 borderRadius: 12, color: '#fff', fontSize: 15, transition: 'all 0.2s',
//               }}
//             />
//           </div>

//           <button
//             className="btn"
//             onClick={handleSignup}
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
//             {loading ? 'Creating account...' : 'Create account'}
//           </button>

//           <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
//             By signing up you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>

//         <p style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
//           Already have an account?{' '}
//           <Link href="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSignup = async () => {
    setError('')
    if (!email || !password || !confirm) { setError('Please fill in all fields'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('worker_profiles')
        .insert({ id: data.user.id, onboarding_step: 1 })
      if (profileError && profileError.code !== '23505') {
        console.error('Profile creation error:', profileError)
      }
      setSuccess(true)
    }
    setLoading(false)
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4
  const strengthColor = ['', '#ef4444', '#f97316', '#f97316', '#22c55e'][strength]
  const strengthLabel = ['', 'Too weak', 'Weak', 'Good', 'Strong'][strength]

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"DM Sans", sans-serif', color: '#fff', padding: '24px',
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 24px',
          }}>📬</div>
          <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 26, margin: '0 0 12px', letterSpacing: '-0.3px' }}>
            Check your inbox
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            We sent a confirmation link to{' '}
            <strong style={{ color: '#fb923c', fontWeight: 600 }}>{email}</strong>.
            Click it to start your onboarding.
          </p>
          <Link href="/login" style={{
            display: 'inline-block', padding: '11px 24px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 14,
            textDecoration: 'none',
          }}>Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', fontFamily: '"DM Sans", sans-serif', color: '#fff',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .inp:focus { border-color: rgba(249,115,22,0.6) !important; background: rgba(249,115,22,0.04) !important; }
        .sub-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .sub-btn { transition: all 0.2s; }
        .show-btn:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* Left panel */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #1a0a00 0%, #0f0a00 40%, #0a0a0f 100%)',
        padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
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
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 24,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Setup takes under 2 minutes</span>
          </div>

          <h2 style={{
            fontFamily: '"Syne", sans-serif', fontWeight: 800,
            fontSize: 32, lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '-0.5px',
          }}>
            Start protecting<br />your income today
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: 0 }}>
            Join thousands of delivery partners across India who get paid automatically when bad weather or platform issues affect their work.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['✓', 'No paperwork or claims process'],
            ['✓', 'Payouts in under 5 minutes'],
            ['✓', 'Starting from ₹29 per week'],
            ['✓', 'Works with Zomato & Swiggy'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: '"Syne", sans-serif', fontWeight: 800,
              fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.3px',
            }}>Create your account</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Free to join · No credit card required
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '11px 14px', marginBottom: 20,
              color: '#fca5a5', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.02em' }}>
              EMAIL ADDRESS
            </label>
            <input
              className="inp" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '13px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 11, color: '#fff', fontSize: 14, transition: 'all 0.2s',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.02em' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="inp"
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={{
                  width: '100%', padding: '13px 44px 13px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 11, color: '#fff', fontSize: 14, transition: 'all 0.2s',
                }}
              />
              <button className="show-btn" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'inherit', transition: 'color 0.2s',
              }}>{showPass ? 'Hide' : 'Show'}</button>
            </div>
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 4,
                      background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.02em' }}>
              CONFIRM PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="inp"
                type={showConfirm ? 'text' : 'password'}
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                placeholder="Repeat your password"
                style={{
                  width: '100%', padding: '13px 44px 13px 16px',
                  background: confirm && confirm === password ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${confirm && confirm === password ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 11, color: '#fff', fontSize: 14, transition: 'all 0.2s',
                }}
              />
              <button className="show-btn" onClick={() => setShowConfirm(p => !p)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'inherit', transition: 'color 0.2s',
              }}>{showConfirm ? 'Hide' : 'Show'}</button>
            </div>
          </div>

          <button
            className="sub-btn" onClick={handleSignup} disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(249,115,22,0.35)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none', borderRadius: 11,
              color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            By signing up you agree to our Terms of Service and Privacy Policy
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#fb923c', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}