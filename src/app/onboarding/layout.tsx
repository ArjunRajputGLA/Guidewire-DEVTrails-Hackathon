// app/onboarding/layout.tsx
'use client'
import { usePathname } from 'next/navigation'

const STEPS = [
  { num: 1, label: 'Mobile', icon: '📱' },
  { num: 2, label: 'Personal', icon: '👤' },
  { num: 3, label: 'ID & KYC', icon: '🪪' },
  { num: 4, label: 'Platform', icon: '🛵' },
  { num: 5, label: 'Income', icon: '💰' },
]

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const match = pathname.match(/step-(\d)/)
  const currentStep = match ? parseInt(match[1]) : 1

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050a',
      fontFamily: '"Outfit", sans-serif',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@700;800&display=swap');
        * { box-sizing: border-box; }

        /* Ambient orbs */
        .layout-orb-1 {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%);
          top: -300px; right: -200px; pointer-events: none; z-index: 0;
          animation: orbPulse 10s ease-in-out infinite;
        }
        .layout-orb-2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(234,88,12,0.05) 0%, transparent 70%);
          bottom: -200px; left: -100px; pointer-events: none; z-index: 0;
          animation: orbPulse 13s ease-in-out infinite reverse;
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }

        /* Grid texture */
        .layout-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* Step pill */
        .step-pill {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          cursor: default; position: relative;
        }
        .step-dot {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all 0.35s ease;
          position: relative; z-index: 1;
        }
        .step-dot.done {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
        }
        .step-dot.active {
          background: rgba(249,115,22,0.2);
          border: 1px solid rgba(249,115,22,0.5);
          box-shadow: 0 0 16px rgba(249,115,22,0.2);
        }
        .step-dot.inactive {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .step-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; transition: color 0.3s;
        }

        /* Connector line */
        .step-connector {
          flex: 1; height: 1px; margin-top: -14px;
          transition: background 0.5s ease;
        }

        /* Main card */
        .onboarding-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(12px);
          animation: cardIn 0.4s ease forwards;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Global input styles for child steps */
        input[type="text"], input[type="tel"], input[type="email"],
        input[type="number"], input[type="date"], input[type="time"],
        input[type="password"], select, textarea {
          outline: none !important;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s !important;
        }
        input:focus, select:focus {
          border-color: rgba(249,115,22,0.55) !important;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important;
          background: rgba(249,115,22,0.04) !important;
        }
        select option { background: #111118; color: #fff; }

        .step-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          border: none; border-radius: 14px;
          color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          letter-spacing: 0.02em; transition: all 0.25s ease;
          position: relative; overflow: hidden;
        }
        .step-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.2s;
        }
        .step-btn:hover:not(:disabled)::before { opacity: 1; }
        .step-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(249,115,22,0.3);
        }
        .step-btn:active:not(:disabled) { transform: translateY(0); }
        .step-btn:disabled { cursor: not-allowed; opacity: 0.5; }
      `}</style>

      <div className="layout-orb-1" />
      <div className="layout-orb-2" />
      <div className="layout-grid" />

      {/* ── Header ── */}
      <header style={{
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 10,
        backdropFilter: 'blur(10px)',
        background: 'rgba(5,5,10,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #f97316, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 18,
            boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
          }}>G</div>
          <span style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px',
          }}>GigShield</span>
        </div>

        {/* Step counter badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 100, padding: '6px 14px',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800,
          }}>{currentStep}</div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            of {STEPS.length} steps
          </span>
        </div>
      </header>

      {/* ── Step Progress ── */}
      <div style={{
        padding: '28px 32px 0',
        position: 'relative', zIndex: 10,
        maxWidth: 600, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {STEPS.map((step, idx) => (
            <>
              <div className="step-pill" key={step.num}>
                <div className={`step-dot ${step.num < currentStep ? 'done' : step.num === currentStep ? 'active' : 'inactive'}`}>
                  {step.num < currentStep ? (
                    <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 700 }}>✓</span>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span className="step-label" style={{
                  color: step.num === currentStep
                    ? '#fb923c'
                    : step.num < currentStep
                      ? 'rgba(255,255,255,0.45)'
                      : 'rgba(255,255,255,0.18)',
                }}>{step.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="step-connector" key={`conn-${idx}`} style={{
                  background: idx < currentStep - 1
                    ? 'rgba(34,197,94,0.3)'
                    : idx === currentStep - 1
                      ? 'linear-gradient(90deg, rgba(34,197,94,0.3), rgba(255,255,255,0.08))'
                      : 'rgba(255,255,255,0.07)',
                }} />
              )}
            </>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 18, height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #22c55e, #f97316)',
            borderRadius: 4,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }} />
        </div>
      </div>

      {/* ── Page content ── */}
      <main style={{
        maxWidth: 560, margin: '0 auto',
        padding: '32px 24px 80px',
        position: 'relative', zIndex: 10,
      }}>
        <div className="onboarding-card">
          {children}
        </div>
      </main>
    </div>
  )
}
