'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/worker/dashboard')
      }
    }
  }, [user, authLoading, router])

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
//      const { error: profileError } = await supabase
//        .from('worker_profiles')
//        .insert({ id: data.user.id, onboarding_step: 1 })
//      if (profileError && profileError.code !== '23505') {
//        console.error('Profile creation error:', profileError)
//      }
      setSuccess(true)
    }
    setLoading(false)
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength]
  const strengthLabel = ['', 'Too weak', 'Weak', 'Good', 'Strong'][strength]

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: '#05050a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Outfit", sans-serif', color: '#fff', padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
          * { box-sizing: border-box; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .success-in { animation: fadeUp 0.6s ease forwards; }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .float-icon { animation: float 3s ease-in-out infinite; }
        `}</style>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />
        <div className="success-in" style={{ textAlign: 'center', maxWidth: 420, position: 'relative' }}>
          <div className="float-icon" style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 28px',
            boxShadow: '0 0 40px rgba(249,115,22,0.1)',
          }}>📬</div>
          <h2 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800, fontSize: 28, margin: '0 0 12px', letterSpacing: '-0.5px',
          }}>Check your inbox</h2>
          <p style={{
            color: 'rgba(255,255,255,0.42)', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px',
          }}>
            We sent a confirmation link to{' '}
            <strong style={{ color: '#fb923c', fontWeight: 600 }}>{email}</strong>.
            Click it to begin your onboarding.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, color: 'rgba(255,255,255,0.6)',
            fontSize: 14, textDecoration: 'none', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
          }}>← Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#05050a',
      display: 'flex', fontFamily: '"Outfit", sans-serif', color: '#fff',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.18); }

        .orb-1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%);
          top: -200px; left: -100px; pointer-events: none;
          animation: pulse 9s ease-in-out infinite;
        }
        .orb-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%);
          bottom: -100px; left: 35%; pointer-events: none;
          animation: pulse 11s ease-in-out infinite reverse;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.7; }
        }

        .inp-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; color: #fff; font-size: 14px;
          font-family: 'Outfit', sans-serif;
          transition: all 0.25s ease;
        }
        .inp-field:focus {
          border-color: rgba(251,115,22,0.5);
          background: rgba(251,115,22,0.05);
          box-shadow: 0 0 0 3px rgba(251,115,22,0.08);
        }
        .inp-field-pass { padding-right: 56px; }
        .inp-valid {
          border-color: rgba(34,197,94,0.4) !important;
          background: rgba(34,197,94,0.04) !important;
        }

        .btn-create {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          border: none; border-radius: 14px; color: #fff;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Outfit', sans-serif; letter-spacing: 0.02em;
          transition: all 0.25s ease; position: relative; overflow: hidden;
        }
        .btn-create::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .btn-create:hover:not(:disabled)::before { opacity: 1; }
        .btn-create:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(249,115,22,0.35);
        }
        .btn-create:active:not(:disabled) { transform: translateY(0); }
        .btn-create:disabled { cursor: not-allowed; opacity: 0.55; }

        .show-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); font-size: 11px;
          font-family: 'Outfit', sans-serif; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .show-toggle:hover { color: rgba(255,255,255,0.7); }

        .benefit-row {
          display: flex; align-items: center; gap: 12;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: all 0.2s;
        }
        .benefit-row:last-child { border-bottom: none; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: slideUp 0.5s ease forwards; }
        .d1 { animation-delay: 0.05s; opacity: 0; }
        .d2 { animation-delay: 0.15s; opacity: 0; }
        .d3 { animation-delay: 0.25s; opacity: 0; }
        .d4 { animation-delay: 0.35s; opacity: 0; }
        .d5 { animation-delay: 0.45s; opacity: 0; }
      `}</style>

      <div className="orb-1" />
      <div className="orb-2" />

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(170deg, rgba(0,20,8,0.95) 0%, rgba(0,12,4,0.9) 50%, rgba(5,5,10,0.95) 100%)',
        padding: '44px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Logo and Back Link */}
        <div style={{ position: 'relative', zIndex: 50 }}>
          <button suppressHydrationWarning onClick={() => window.location.href = '/'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.4)', fontSize: 13,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            marginBottom: 24,
            fontFamily: '"Outfit", sans-serif', fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <span>←</span> Back to home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, overflow: 'hidden',
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            }}>
              <img src="/favicon.ico" alt="GigShield Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
            }}>GigShield</span>
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 22,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }} />
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
              Setup takes under 2 minutes
            </span>
          </div>

          <h2 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800, fontSize: 34, lineHeight: 1.18,
            margin: '0 0 16px', letterSpacing: '-0.8px',
          }}>
            Start protecting<br />
            <span style={{
              background: 'linear-gradient(135deg, #22c55e, #86efac)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>your income today</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>
            Join thousands of delivery partners across India who get paid automatically when bad weather or platform issues affect their work.
          </p>
        </div>

        {/* Benefits list */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: '4px 16px',
          }}>
            {[
              ['No paperwork or claims process', '#22c55e'],
              ['Payouts in under 5 minutes', '#22c55e'],
              ['Starting from ₹29 per week', '#22c55e'],
              ['Works with Zomato & Swiggy', '#22c55e'],
            ].map(([text, color]) => (
              <div className="benefit-row" key={text}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: 'rgba(34,197,94,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color,
                }}>✓</div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 40px', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div className="animate-in d1" style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 14, padding: '4px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Free · No card required
              </span>
            </div>
            <h1 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800, fontSize: 30, letterSpacing: '-0.6px', marginBottom: 8,
            }}>Create your account 🚀</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
              One account. Full income protection, zero hassle.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="animate-in" style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.22)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 20,
              color: '#fca5a5', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div className="animate-in d2" style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Email Address</label>
            <input
              suppressHydrationWarning
              className="inp-field"
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="animate-in d3" style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                suppressHydrationWarning
                className="inp-field inp-field-pass"
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
              <button suppressHydrationWarning className="show-toggle" onClick={() => setShowPass(p => !p)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 6,
                      background: i <= strength ? strengthColor : 'rgba(255,255,255,0.07)',
                      transition: 'background 0.35s ease',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="animate-in d4" style={{ marginBottom: 28 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                suppressHydrationWarning
                className={`inp-field inp-field-pass${confirm && confirm === password ? ' inp-valid' : ''}`}
                type={showConfirm ? 'text' : 'password'}
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
                placeholder="Repeat your password"
              />
              <button suppressHydrationWarning className="show-toggle" onClick={() => setShowConfirm(p => !p)}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirm && confirm !== password && (
              <p style={{ fontSize: 11, color: '#f87171', marginTop: 6, fontWeight: 500 }}>
                Passwords don't match
              </p>
            )}
            {confirm && confirm === password && (
              <p style={{ fontSize: 11, color: '#22c55e', marginTop: 6, fontWeight: 500 }}>
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="animate-in d5">
            <button suppressHydrationWarning className="btn-create" onClick={handleSignup} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account →'}
            </button>

            <p style={{
              textAlign: 'center', marginTop: 12, fontSize: 11,
              color: 'rgba(255,255,255,0.2)', lineHeight: 1.6,
            }}>
              By signing up you agree to our Terms of Service and Privacy Policy
            </p>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, margin: '22px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap' }}>
                Already have an account?
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, color: 'rgba(255,255,255,0.65)',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'
              }}
              >
                Sign in instead
                <span style={{ color: '#fb923c' }}>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}