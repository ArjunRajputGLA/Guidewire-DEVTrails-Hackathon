// // app/onboarding/step-1/page.tsx
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

//     // In production: call your backend which sends OTP via SMS (Twilio/MSG91)
//     // For dev/demo: Supabase phone auth OR a mock OTP
//     // Using Supabase phone auth (requires phone provider configured in Supabase):
//     const { error: otpError } = await supabase.auth.signInWithOtp({
//       phone: `+91${cleaned}`
//     })

//     if (otpError) {
//       // Fallback: If phone auth not configured, mock it
//       console.warn('Phone OTP not configured, using mock flow:', otpError.message)
//       // In production, replace with actual SMS service
//     }

//     setStep('verify_otp')
//     startResendTimer()
//     setLoading(false)
//   }

//   const verifyOtp = async () => {
//     setError('')
//     if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
//     setLoading(true)

//     // For demo without phone auth configured, use a mock OTP (123456)
//     // In production, use supabase.auth.verifyOtp
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

//     // Save mobile + mark verified
//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) { setError('Session expired. Please sign up again.'); setLoading(false); return }

//     await supabase
//       .from('worker_profiles')
//       .update({ mobile: `+91${mobile.replace(/\D/g, '')}`, mobile_verified: true, onboarding_step: 2 })
//       .eq('id', user.id)

//     router.push('/onboarding/step-2')
//   }

//   return (
//     <div>
//       <style>{`
//         input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
//         input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
//         .otp-input { text-align: center; font-size: 28px; letter-spacing: 8px; font-weight: 600; }
//         .btn-primary { transition: all 0.2s ease; }
//         .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
//       `}</style>

//       {/* Step header */}
//       <div style={{ marginBottom: 32 }}>
//         <div style={{
//           display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
//           width: 48, height: 48, borderRadius: 14,
//           background: 'rgba(249,115,22,0.15)', marginBottom: 16,
//           fontSize: 24,
//         }}>📱</div>
//         <h2 style={{
//           fontFamily: '"Syne", sans-serif', fontWeight: 800,
//           fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.3px',
//         }}>
//           {step === 'enter_mobile' ? 'Verify your mobile' : 'Enter OTP'}
//         </h2>
//         <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
//           {step === 'enter_mobile'
//             ? 'We\'ll send a one-time password to confirm your number'
//             : `OTP sent to +91 ${mobile}. Enter it below`
//           }
//         </p>
//       </div>

//       {error && (
//         <div style={{
//           background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
//           borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
//         }}>{error}</div>
//       )}

//       {step === 'enter_mobile' ? (
//         <>
//           <div style={{ marginBottom: 24 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               Mobile number
//             </label>
//             <div style={{ display: 'flex', gap: 0 }}>
//               <div style={{
//                 padding: '14px 16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: '1px solid rgba(255,255,255,0.12)',
//                 borderRight: 'none',
//                 borderRadius: '12px 0 0 12px',
//                 color: 'rgba(255,255,255,0.5)', fontSize: 15,
//                 whiteSpace: 'nowrap',
//               }}>+91</div>
//               <input
//                 type="tel" value={mobile} maxLength={10}
//                 onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
//                 onKeyDown={e => e.key === 'Enter' && sendOtp()}
//                 placeholder="98765 43210"
//                 style={{
//                   flex: 1, padding: '14px 16px',
//                   background: 'rgba(255,255,255,0.06)',
//                   border: '1px solid rgba(255,255,255,0.12)',
//                   borderRadius: '0 12px 12px 0',
//                   color: '#fff', fontSize: 15,
//                 }}
//               />
//             </div>
//           </div>

//           <button
//             className="btn-primary"
//             onClick={sendOtp} disabled={loading || mobile.length < 10}
//             style={{
//               width: '100%', padding: '15px',
//               background: mobile.length < 10 ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ea580c)',
//               border: 'none', borderRadius: 12,
//               color: '#fff', fontSize: 16, fontWeight: 600,
//               cursor: mobile.length < 10 ? 'not-allowed' : 'pointer',
//               fontFamily: '"DM Sans", sans-serif',
//             }}
//           >
//             {loading ? 'Sending OTP...' : 'Send OTP'}
//           </button>

//           {/* Demo hint */}
//           <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
//             Demo mode: use any number, then enter 123456 as OTP
//           </p>
//         </>
//       ) : (
//         <>
//           <div style={{ marginBottom: 8 }}>
//             <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
//               6-digit OTP
//             </label>
//             <input
//               className="otp-input"
//               type="tel" value={otp} maxLength={6}
//               onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//               onKeyDown={e => e.key === 'Enter' && verifyOtp()}
//               placeholder="------"
//               style={{
//                 width: '100%', padding: '16px',
//                 background: 'rgba(255,255,255,0.06)',
//                 border: `1px solid ${otp.length === 6 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
//                 borderRadius: 12, color: '#fff',
//               }}
//             />
//           </div>

//           <p style={{ textAlign: 'right', marginBottom: 24, fontSize: 13 }}>
//             {resendTimer > 0 ? (
//               <span style={{ color: 'rgba(255,255,255,0.35)' }}>Resend in {resendTimer}s</span>
//             ) : (
//               <button onClick={() => { setStep('enter_mobile'); setOtp('') }}
//                 style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
//                 Change number
//               </button>
//             )}
//           </p>

//           <button
//             className="btn-primary"
//             onClick={verifyOtp} disabled={loading || otp.length < 6}
//             style={{
//               width: '100%', padding: '15px',
//               background: otp.length < 6 ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ea580c)',
//               border: 'none', borderRadius: 12,
//               color: '#fff', fontSize: 16, fontWeight: 600,
//               cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
//               fontFamily: '"DM Sans", sans-serif',
//             }}
//           >
//             {loading ? 'Verifying...' : 'Verify OTP →'}
//           </button>
//         </>
//       )}
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
    await new Promise(r => setTimeout(r, 800))
    setStep('verify_otp')
    startResendTimer()
    setLoading(false)
  }

  const verifyOtp = async () => {
    setError('')
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)

    const isDemoOtp = otp === '123456'

    if (!isDemoOtp) {
      const cleaned = mobile.replace(/\D/g, '')
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${cleaned}`,
        token: otp,
        type: 'sms'
      })
      if (verifyError) {
        setError('Invalid OTP. Please try again.')
        setLoading(false)
        return
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please sign up again.'); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('worker_profiles')
      .update({ mobile: `+91${mobile.replace(/\D/g, '')}`, mobile_verified: true, onboarding_step: 2 })
      .eq('id', user.id)

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
        input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        input:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.15); }
        .otp-input { text-align: center; font-size: 28px; letter-spacing: 8px; font-weight: 600; }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #ea580c, #c2410c) !important; transform: translateY(-1px); }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(249,115,22,0.15)', marginBottom: 16, fontSize: 24,
        }}>📱</div>
        <h2 style={{
          fontFamily: '"Syne", sans-serif', fontWeight: 800,
          fontSize: 24, margin: '0 0 8px', letterSpacing: '-0.3px',
        }}>
          {step === 'enter_mobile' ? 'Verify your mobile' : 'Enter OTP'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: 0, fontSize: 15 }}>
          {step === 'enter_mobile'
            ? "We'll send a one-time password to confirm your number"
            : `OTP sent to +91 ${mobile}. Enter it below`
          }
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#fca5a5', fontSize: 14,
        }}>{error}</div>
      )}

      {step === 'enter_mobile' ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Mobile number
            </label>
            <div style={{ display: 'flex', gap: 0 }}>
              <div style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRight: 'none',
                borderRadius: '12px 0 0 12px',
                color: 'rgba(255,255,255,0.5)', fontSize: 15,
                whiteSpace: 'nowrap',
              }}>+91</div>
              <input
                type="tel" value={mobile} maxLength={10}
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
                placeholder="98765 43210"
                style={{
                  flex: 1, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0 12px 12px 0',
                  color: '#fff', fontSize: 15,
                }}
              />
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={sendOtp} disabled={loading || mobile.length < 10}
            style={{
              width: '100%', padding: '15px',
              background: mobile.length < 10 ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: mobile.length < 10 ? 'not-allowed' : 'pointer',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            Demo mode: use any number, then enter 123456 as OTP
          </p>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              6-digit OTP
            </label>
            <input
              className="otp-input"
              type="tel" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verifyOtp()}
              placeholder="------"
              style={{
                width: '100%', padding: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${otp.length === 6 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 12, color: '#fff',
              }}
            />
          </div>

          <p style={{ textAlign: 'right', marginBottom: 24, fontSize: 13 }}>
            {resendTimer > 0 ? (
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>Resend in {resendTimer}s</span>
            ) : (
              <button onClick={() => { setStep('enter_mobile'); setOtp('') }}
                style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Change number
              </button>
            )}
          </p>

          <button
            className="btn-primary"
            onClick={verifyOtp} disabled={loading || otp.length < 6}
            style={{
              width: '100%', padding: '15px',
              background: otp.length < 6 ? 'rgba(249,115,22,0.3)' : 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 16, fontWeight: 600,
              cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {loading ? 'Verifying...' : 'Verify OTP →'}
          </button>
        </>
      )}
    </div>
  )
}