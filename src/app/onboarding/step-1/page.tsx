// 'use client'
// import { useState } from 'react'
// import { supabase } from '@/lib/supabase-browser'
// import { useRouter } from 'next/navigation'

// export default function Step1() {
//   const router = useRouter()
//   const [mobile, setMobile] = useState('')
//   const [otp, setOtp] = useState('')
//   const [step, setStep] = useState<'enter_mobile' | 'verify_otp'>('enter_mobile')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [resendTimer, setResendTimer] = useState(0)

//   const startResendTimer = () => {
//     setResendTimer(30)
//     const interval = setInterval(() => {
//       setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
//     }, 1000)
//   }

//   const sendOtp = async () => {
//     setError('')
//     const cleaned = mobile.replace(/\D/g, '')
//     if (cleaned.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
//     setLoading(true)
//     await new Promise(r => setTimeout(r, 800))
//     setStep('verify_otp')
//     startResendTimer()
//     setLoading(false)
//   }

//   const verifyOtp = async () => {
//     setError('')
//     if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
//     setLoading(true)

//     const isDemoOtp = otp === '123456'

//     if (!isDemoOtp) {
//       const cleaned = mobile.replace(/\D/g, '')
//       const { error: verifyError } = await supabase.auth.verifyOtp({
//         phone: `+91${cleaned}`,
//         token: otp,
//         type: 'sms'
//       })
//       if (verifyError) {
//         setError('Invalid OTP. Please try again.')
//         setLoading(false)
//         return
//       }
//     }

//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) { setError('Session expired. Please sign up again.'); setLoading(false); return }

//     const { error: updateError } = await supabase
//       .from('worker_profiles')
//       .upsert({ id: user.id, mobile: `+91${mobile.replace(/\D/g, '')}`, mobile_verified: true, onboarding_step: 2 })

//     if (updateError) {
//       setError(updateError.message)
//       setLoading(false)
//       return
//     }

//     router.push('/onboarding/step-2')
//   }

//   return (
//     <div>
//       <style>{`
//         .otp-input {
//           text-align: center;
//           font-size: 32px !important;
//           letter-spacing: 14px !important;
//           font-weight: 700 !important;
//           font-family: 'Bricolage Grotesque', sans-serif !important;
//         }
//         .otp-input::placeholder { letter-spacing: 10px; color: rgba(255,255,255,0.1) !important; }

//         .mobile-input { font-size: 18px !important; font-weight: 600 !important; letter-spacing: 2px; }

//         @keyframes shakeX {
//           0%, 100% { transform: translateX(0); }
//           20%, 60% { transform: translateX(-6px); }
//           40%, 80% { transform: translateX(6px); }
//         }
//         .shake { animation: shakeX 0.4s ease; }

//         @keyframes stepSlide {
//           from { opacity: 0; transform: translateX(20px); }
//           to { opacity: 1; transform: translateX(0); }
//         }
//         .step-slide { animation: stepSlide 0.35s ease forwards; }

//         .resend-circle {
//           width: 44px; height: 44px; border-radius: 50%;
//           background: conic-gradient(
//             rgba(249,115,22,0.6) calc(var(--progress, 0) * 1%),
//             rgba(255,255,255,0.08) calc(var(--progress, 0) * 1%)
//           );
//           display: flex; align-items: center; justify-content: center;
//           position: relative;
//         }
//         .resend-inner {
//           width: 34px; height: 34px; border-radius: 50%;
//           background: #05050a;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 11px; font-weight: 700; color: #fb923c;
//         }
//       `}</style>

//       {/* Step header */}
//       <div style={{ marginBottom: 32 }}>
//         <div style={{
//           width: 52, height: 52, borderRadius: 15,
//           background: 'rgba(249,115,22,0.1)',
//           border: '1px solid rgba(249,115,22,0.2)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           fontSize: 26, marginBottom: 18,
//           boxShadow: '0 0 20px rgba(249,115,22,0.08)',
//         }}>📱</div>
//         <h2 style={{
//           fontFamily: '"Bricolage Grotesque", sans-serif',
//           fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
//         }}>
//           {step === 'enter_mobile' ? 'Verify your mobile' : 'Enter OTP'}
//         </h2>
//         <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
//           {step === 'enter_mobile'
//             ? "We'll send a one-time password to confirm your number"
//             : <>OTP sent to <strong style={{ color: '#fb923c' }}>+91 {mobile}</strong>. Enter it below.</>
//           }
//         </p>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="shake" style={{
//           background: 'rgba(239,68,68,0.07)',
//           border: '1px solid rgba(239,68,68,0.22)',
//           borderRadius: 12, padding: '12px 16px', marginBottom: 20,
//           color: '#fca5a5', fontSize: 13,
//           display: 'flex', alignItems: 'center', gap: 10,
//         }}>
//           <span>⚠️</span> {error}
//         </div>
//       )}

//       {step === 'enter_mobile' ? (
//         <div className="step-slide">
//           <div style={{ marginBottom: 24 }}>
//             <label style={{
//               display: 'block', fontSize: 11, fontWeight: 600,
//               color: 'rgba(255,255,255,0.4)', marginBottom: 8,
//               letterSpacing: '0.08em', textTransform: 'uppercase',
//             }}>Mobile number</label>

//             <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden' }}>
//               {/* Country code */}
//               <div style={{
//                 padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.04)',
//                 border: '1px solid rgba(255,255,255,0.08)',
//                 borderRight: 'none',
//                 borderRadius: '14px 0 0 14px',
//                 color: 'rgba(255,255,255,0.5)',
//                 fontSize: 15, fontWeight: 600,
//                 whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
//               }}>
//                 <span style={{ fontSize: 18 }}>🇮🇳</span>
//                 <span>+91</span>
//               </div>
//               <input
//                 className="mobile-input"
//                 type="tel" value={mobile} maxLength={10}
//                 onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                 onKeyDown={e => e.key === 'Enter' && sendOtp()}
//                 placeholder="98765 43210"
//                 style={{
//                   flex: 1, padding: '14px 16px',
//                   background: 'rgba(255,255,255,0.04)',
//                   border: '1px solid rgba(255,255,255,0.08)',
//                   borderLeft: 'none',
//                   borderRadius: '0 14px 14px 0',
//                   color: '#fff', fontFamily: 'Outfit, sans-serif',
//                 }}
//               />
//             </div>

//             {/* Progress indicator under input */}
//             <div style={{ marginTop: 8, display: 'flex', gap: 3 }}>
//               {[...Array(10)].map((_, i) => (
//                 <div key={i} style={{
//                   flex: 1, height: 2, borderRadius: 2,
//                   background: i < mobile.length ? '#f97316' : 'rgba(255,255,255,0.07)',
//                   transition: 'background 0.15s ease',
//                 }} />
//               ))}
//             </div>
//             <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 6 }}>
//               Demo mode: use any number, then enter 123456 as OTP
//             </p>
//           </div>

//           <button
//             className="step-btn"
//             onClick={sendOtp} disabled={loading || mobile.length < 10}
//             style={{
//               width: '100%', padding: '15px',
//               background: mobile.length < 10
//                 ? 'rgba(249,115,22,0.2)'
//                 : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
//               border: mobile.length < 10 ? '1px solid rgba(249,115,22,0.2)' : 'none',
//               borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
//               cursor: mobile.length < 10 ? 'not-allowed' : 'pointer',
//               fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
//               transition: 'all 0.25s ease',
//             }}
//           >
//             {loading ? (
//               <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
//                 <span style={{
//                   width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
//                   borderTopColor: '#fff', borderRadius: '50%',
//                   animation: 'spin 0.7s linear infinite', display: 'inline-block',
//                 }} />
//                 Sending OTP…
//               </span>
//             ) : 'Send OTP →'}
//           </button>
//         </div>
//       ) : (
//         <div className="step-slide">
//           <div style={{ marginBottom: 8 }}>
//             <label style={{
//               display: 'block', fontSize: 11, fontWeight: 600,
//               color: 'rgba(255,255,255,0.4)', marginBottom: 8,
//               letterSpacing: '0.08em', textTransform: 'uppercase',
//             }}>6-digit OTP</label>

//             <input
//               className="otp-input"
//               type="tel" value={otp} maxLength={6}
//               onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//               onKeyDown={e => e.key === 'Enter' && verifyOtp()}
//               placeholder="······"
//               style={{
//                 width: '100%', padding: '18px 20px',
//                 background: otp.length === 6
//                   ? 'rgba(34,197,94,0.05)'
//                   : 'rgba(255,255,255,0.04)',
//                 border: `1px solid ${otp.length === 6 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
//                 borderRadius: 14, color: '#fff',
//                 fontFamily: 'Bricolage Grotesque, sans-serif',
//               }}
//             />

//             {/* OTP dot indicators */}
//             <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
//               {[...Array(6)].map((_, i) => (
//                 <div key={i} style={{
//                   width: 8, height: 8, borderRadius: '50%',
//                   background: i < otp.length
//                     ? otp.length === 6 ? '#22c55e' : '#f97316'
//                     : 'rgba(255,255,255,0.1)',
//                   transition: 'background 0.2s ease',
//                   transform: i < otp.length ? 'scale(1.2)' : 'scale(1)',
//                 }} />
//               ))}
//             </div>
//           </div>

//           {/* Resend / change number */}
//           <div style={{
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             marginBottom: 24, marginTop: 16,
//           }}>
//             {resendTimer > 0 ? (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                 <div className="resend-circle" style={{ '--progress': `${((30 - resendTimer) / 30) * 100}` } as React.CSSProperties}>
//                   <div className="resend-inner">{resendTimer}</div>
//                 </div>
//                 <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Resend OTP in {resendTimer}s</span>
//               </div>
//             ) : (
//               <button onClick={() => { setStep('enter_mobile'); setOtp('') }}
//                 style={{
//                   background: 'none', border: 'none', cursor: 'pointer',
//                   color: '#fb923c', fontSize: 13, fontWeight: 600,
//                   fontFamily: 'Outfit, sans-serif', padding: 0,
//                   display: 'flex', alignItems: 'center', gap: 6,
//                 }}>
//                 ← Change number
//               </button>
//             )}
//             <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
//               +91 {mobile}
//             </span>
//           </div>

//           <button
//             className="step-btn"
//             onClick={verifyOtp} disabled={loading || otp.length < 6}
//             style={{
//               width: '100%', padding: '15px',
//               background: otp.length < 6
//                 ? 'rgba(249,115,22,0.2)'
//                 : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
//               border: otp.length < 6 ? '1px solid rgba(249,115,22,0.2)' : 'none',
//               borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
//               cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
//               fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
//               transition: 'all 0.25s ease',
//             }}
//           >
//             {loading ? 'Verifying…' : 'Verify OTP →'}
//           </button>
//         </div>
//       )}

//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//       `}</style>
//     </div>
//   )
// }

'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function Step1() {
  const router = useRouter()
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'enter_mobile' | 'verify_otp'>('enter_mobile')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const startResendTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
    }, 1000)
  }

  const sendOtp = async () => {
    setError('')
    const cleaned = mobile.replace(/\D/g, '')
    if (cleaned.length !== 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)

    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleaned })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to send OTP. Please try again.')
      setLoading(false)
      return
    }

    setStep('verify_otp')
    startResendTimer()
    setLoading(false)
  }

  const verifyOtp = async () => {
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)

    const cleaned = mobile.replace(/\D/g, '')

    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleaned, otp })
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Invalid OTP. Please try again.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please sign up again.'); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('worker_profiles')
      .upsert({ id: user.id, mobile: `+91${cleaned}`, mobile_verified: true, onboarding_step: 2 })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding/step-2')
  }

  return (
    <div>
      <style>{`
        .otp-input {
          text-align: center;
          font-size: 32px !important;
          letter-spacing: 14px !important;
          font-weight: 700 !important;
          font-family: 'Bricolage Grotesque', sans-serif !important;
        }
        .otp-input::placeholder { letter-spacing: 10px; color: rgba(255,255,255,0.1) !important; }
        .mobile-input { font-size: 18px !important; font-weight: 600 !important; letter-spacing: 2px; }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake { animation: shakeX 0.4s ease; }
        @keyframes stepSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .step-slide { animation: stepSlide 0.35s ease forwards; }
        .resend-circle {
          width: 44px; height: 44px; border-radius: 50%;
          background: conic-gradient(
            rgba(249,115,22,0.6) calc(var(--progress, 0) * 1%),
            rgba(255,255,255,0.08) calc(var(--progress, 0) * 1%)
          );
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .resend-inner {
          width: 34px; height: 34px; border-radius: 50%;
          background: #05050a;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fb923c;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Step header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 15,
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid rgba(249,115,22,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 18,
          boxShadow: '0 0 20px rgba(249,115,22,0.08)',
        }}>📱</div>
        <h2 style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontWeight: 800, fontSize: 26, margin: '0 0 8px', letterSpacing: '-0.5px',
        }}>
          {step === 'enter_mobile' ? 'Verify your mobile' : 'Enter OTP'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {step === 'enter_mobile'
            ? "We'll send a one-time password to confirm your number"
            : <>OTP sent to <strong style={{ color: '#fb923c' }}>+91 {mobile}</strong>. Enter it below.</>
          }
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="shake" style={{
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          color: '#fca5a5', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {step === 'enter_mobile' ? (
        <div className="step-slide">
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Mobile number</label>

            <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRight: 'none',
                borderRadius: '14px 0 0 14px',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 15, fontWeight: 600,
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 18 }}>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                className="mobile-input"
                type="tel" value={mobile} maxLength={10}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="98765 43210"
                suppressHydrationWarning
                style={{
                  flex: 1, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: 'none',
                  borderRadius: '0 14px 14px 0',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 3 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 2, borderRadius: 2,
                  background: i < mobile.length ? '#f97316' : 'rgba(255,255,255,0.07)',
                  transition: 'background 0.15s ease',
                }} />
              ))}
            </div>
          </div>

          <button
            onClick={sendOtp} disabled={loading || mobile.length < 10}
            style={{
              width: '100%', padding: '15px',
              background: mobile.length < 10
                ? 'rgba(249,115,22,0.2)'
                : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              border: mobile.length < 10 ? '1px solid rgba(249,115,22,0.2)' : 'none',
              borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: mobile.length < 10 ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
              transition: 'all 0.25s ease',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Sending OTP…
              </span>
            ) : 'Send OTP →'}
          </button>
        </div>
      ) : (
        <div className="step-slide">
          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: 8,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>6-digit OTP</label>

            <input
              className="otp-input"
              type="tel" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              placeholder="······"
              suppressHydrationWarning
              style={{
                width: '100%', padding: '18px 20px',
                background: otp.length === 6 ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${otp.length === 6 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14, color: '#fff',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < otp.length
                    ? otp.length === 6 ? '#22c55e' : '#f97316'
                    : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.2s ease',
                  transform: i < otp.length ? 'scale(1.2)' : 'scale(1)',
                }} />
              ))}
            </div>
            
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(249,115,22,0.1)', border: '1px dashed rgba(249,115,22,0.3)', borderRadius: '10px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                <span style={{ color: '#fb923c', fontWeight: 600 }}>Note:</span> If the OTP takes too long or fails, you can safely use <strong style={{ color: '#fff' }}>123456</strong> to proceed.
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24, marginTop: 16,
          }}>
            {resendTimer > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="resend-circle" style={{ '--progress': `${((30 - resendTimer) / 30) * 100}` } as React.CSSProperties}>
                  <div className="resend-inner">{resendTimer}</div>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Resend OTP in {resendTimer}s</span>
              </div>
            ) : (
              <button
                onClick={() => { sendOtp() }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#fb923c', fontSize: 13, fontWeight: 600,
                  fontFamily: 'Outfit, sans-serif', padding: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                🔄 Resend OTP
              </button>
            )}
            <button
              onClick={() => { setStep('enter_mobile'); setOtp('') }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)', fontSize: 12,
                fontFamily: 'Outfit, sans-serif', padding: 0,
              }}>
              ← Change number
            </button>
          </div>

          <button
            onClick={verifyOtp} disabled={loading || otp.length < 6}
            style={{
              width: '100%', padding: '15px',
              background: otp.length < 6
                ? 'rgba(249,115,22,0.2)'
                : 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
              border: otp.length < 6 ? '1px solid rgba(249,115,22,0.2)' : 'none',
              borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif', letterSpacing: '0.02em',
              transition: 'all 0.25s ease',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Verifying…
              </span>
            ) : 'Verify OTP →'}
          </button>
        </div>
      )}
    </div>
  )
}