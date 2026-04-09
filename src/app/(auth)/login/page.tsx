'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/worker/dashboard')
      }
    }
  }, [user, authLoading, router])

  const handleLogin = async (role: 'admin' | 'worker' = 'worker') => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    
    if (role === 'admin' || (email === 'admin@gigshield.com' && password === '123456')) {
      const res = await login(email, password)
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
      window.location.href = `/onboarding/step-${step}`
    } else {
      window.location.href = '/worker/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050a',
      display: 'flex',
      fontFamily: '"Outfit", sans-serif',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Clash+Display:wght@600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.18); }

        /* Noise grain overlay */
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 1000; opacity: 0.5;
        }

        /* Glowing orbs */
        .orb-1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(251,115,22,0.12) 0%, transparent 70%);
          top: -200px; left: -100px; pointer-events: none;
          animation: pulse 8s ease-in-out infinite;
        }
        .orb-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%);
          bottom: -100px; left: 30%; pointer-events: none;
          animation: pulse 10s ease-in-out infinite reverse;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
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
        .inp-field-pass {
          padding-right: 52px;
        }

        .btn-admin {
          flex: 1; padding: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; color: rgba(255,255,255,0.7);
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.2s ease; letter-spacing: 0.01em;
        }
        .btn-admin:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.18);
          color: #fff; transform: translateY(-1px);
        }
        .btn-admin:disabled { cursor: not-allowed; opacity: 0.5; }

        .btn-worker {
          flex: 2; padding: 14px;
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          border: none; border-radius: 14px; color: #fff;
          font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          transition: all 0.25s ease; letter-spacing: 0.02em;
          position: relative; overflow: hidden;
        }
        .btn-worker::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .btn-worker:hover:not(:disabled)::before { opacity: 1; }
        .btn-worker:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(249,115,22,0.35); }
        .btn-worker:active:not(:disabled) { transform: translateY(0); }
        .btn-worker:disabled { cursor: not-allowed; opacity: 0.6; }

        .show-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3); font-size: 11px;
          font-family: 'Outfit', sans-serif; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .show-toggle:hover { color: rgba(255,255,255,0.7); }

        .feature-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 14px 16px;
          transition: all 0.2s ease;
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(251,115,22,0.15);
          transform: translateX(3px);
        }

        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: slideUp 0.5s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.2s; opacity: 0; }
        .delay-3 { animation-delay: 0.3s; opacity: 0; }
        .delay-4 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="orb-1" />
      <div className="orb-2" />

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '44%',
        background: 'linear-gradient(170deg, rgba(30,12,0,0.95) 0%, rgba(15,8,0,0.9) 50%, rgba(5,5,10,0.95) 100%)',
        padding: '44px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Logo and Back Link */}
        <div style={{ position: 'relative', zIndex: 50 }}>
          <button onClick={() => window.location.href = '/'} style={{
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
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.18)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 22,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }} />
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
              1,200+ gig workers protected
            </span>
          </div>

          <h2 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800, fontSize: 34, lineHeight: 1.18,
            margin: '0 0 16px', letterSpacing: '-0.8px',
          }}>
            Income protection<br />
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>when it matters most</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>
            Parametric insurance for delivery partners. Get paid within minutes when heavy rain, extreme heat, or platform outages stop your work.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
          {[
            { icon: '🌧️', title: 'Heavy Rainfall', desc: 'Auto-payout on 50mm+ rainfall', color: '#60a5fa' },
            { icon: '🌡️', title: 'Extreme Heat', desc: 'Feels-like ≥ 45°C for 4+ hours', color: '#f87171' },
            { icon: '📵', title: 'Platform Outage', desc: 'App down ≥ 2 hours', color: '#a78bfa' },
          ].map(({ icon, title, desc, color }) => (
            <div className="feature-card" key={title}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 19,
              }}>{icon}</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color }}>{title}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>{desc}</p>
              </div>
              <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.12)', fontSize: 16 }}>›</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '48px 40px', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div className="animate-in" style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 14, padding: '4px 10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Secure Login</span>
            </div>
            <h1 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800, fontSize: 30, letterSpacing: '-0.6px', marginBottom: 8,
            }}>Welcome back 👋</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
              Sign in to access your GigShield dashboard
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

          {/* Email field */}
          <div className="animate-in delay-1" style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Email Address</label>
            <input
              className="inp-field"
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin('worker')}
              placeholder="you@example.com"
            />
          </div>

          {/* Password field */}
          <div className="animate-in delay-2" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Password</label>
              <Link href="/forgot-password" style={{
                fontSize: 12, color: '#fb923c',
                textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                className="inp-field inp-field-pass"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin('worker')}
                placeholder="Enter your password"
              />
              <button className="show-toggle" onClick={() => setShowPass(p => !p)}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="animate-in delay-3" style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-admin"
              onClick={() => handleLogin('admin')}
              disabled={loading}
            >
              {loading ? '...' : 'Admin'}
            </button>
            <button
              className="btn-worker"
              onClick={() => handleLogin('worker')}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </div>

          {/* Divider */}
          <div className="animate-in delay-4" style={{
            display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0',
          }}>
            <div className="divider-line" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
              New to GigShield?
            </span>
            <div className="divider-line" />
          </div>

          <div className="animate-in delay-4" style={{ textAlign: 'center' }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, color: 'rgba(255,255,255,0.65)',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'Outfit, sans-serif',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.14)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = '#fff'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'
              ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'
            }}
            >
              Create free account
              <span style={{ color: '#fb923c' }}>→</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}