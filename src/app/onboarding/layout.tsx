// app/onboarding/layout.tsx
'use client'
import { usePathname } from 'next/navigation'

const STEPS = [
  { num: 1, label: 'Verify mobile' },
  { num: 2, label: 'Personal info' },
  { num: 3, label: 'ID & photos' },
  { num: 4, label: 'Gig platform' },
  { num: 5, label: 'Income & zone' },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const match = pathname.match(/step-(\d)/)
  const currentStep = match ? parseInt(match[1]) : 1

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '"DM Sans", sans-serif',
      color: '#fff',
    }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Header */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800,
          }}>G</div>
          <span style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
            GigShield
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Step {currentStep} of {STEPS.length}
        </span>
      </header>

      {/* Progress bar */}
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{
          display: 'flex',
          gap: 6,
          marginBottom: 8,
        }}>
          {STEPS.map(step => (
            <div
              key={step.num}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: step.num <= currentStep
                  ? 'linear-gradient(90deg, #f97316, #fb923c)'
                  : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* Step labels — show only on wider screens */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map(step => (
            <div
              key={step.num}
              style={{
                flex: 1,
                fontSize: 11,
                textAlign: 'center',
                color: step.num === currentStep
                  ? '#fb923c'
                  : step.num < currentStep
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.2)',
                fontWeight: step.num === currentStep ? 600 : 400,
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Page content */}
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px 80px' }}>
        {children}
      </main>
    </div>
  )
}