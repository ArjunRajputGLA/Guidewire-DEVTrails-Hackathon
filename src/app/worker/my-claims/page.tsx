"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ClipboardList, Plus, AlertCircle, RefreshCw, CheckCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

// The schema has trigger_type, trigger_icon, amount, status, created_at, id
interface Claim {
  id: string;
  worker_id: string;
  trigger_type: string;
  trigger_icon: string;
  amount: number;
  fraud_score: number;
  status: string;
  created_at: string;
}

const TRIGGER_OPTIONS = [
  { type: "Heavy Rainfall", icon: "🌧️" },
  { type: "Extreme Heat", icon: "🌡️" },
  { type: "High AQI", icon: "🌫️" },
  { type: "Cyclone Alert", icon: "🌀" },
];

function formatRelativeTime(dateString: string) {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function MyClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [triggerType, setTriggerType] = useState(TRIGGER_OPTIONS[0].type);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchMyClaims = async () => {
    setLoading(true);
    
    // Use getSession() instead of getUser() to avoid "lock:sb-... stolen" 
    // warning caused by simultaneous token refresh checks
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user) {
      const { data: userClaims, error } = await supabase
        .from("claims")
        .select("*")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });
        
      if (!error && userClaims) {
        setClaims(userClaims as Claim[]);
      } else {
        setClaims([]);
      }
    }
    setLoading(false);
    router.refresh();
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setErrorMsg("You must be logged in.");
      return;
    }
    
    setSubmitting(true);

    const selectedTrigger = TRIGGER_OPTIONS.find(t => t.type === triggerType);

    const payload = {
      worker_id: user.id,
      trigger_type: selectedTrigger?.type || triggerType,
      trigger_icon: selectedTrigger?.icon || "⚠️",
      amount: parseFloat(amount) || 1000
    };

    try {
      const { data, error } = await supabase
        .from("claims")
        .insert([payload])
        .select();

      if (error) {
        setErrorMsg(error.message || "Failed to submit claim.");
        setSuccessMsg("");
      } else {
        setShowForm(false);
        setAmount("");
        setSuccessMsg("Claim submitted successfully!");
        fetchMyClaims();
        
        // Auto-hide success message
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="mc-wrap">
        {/* ── Header ── */}
        <div className="mc-header">
          <div>
            <h1 className="mc-title">My Claims</h1>
            <p className="mc-subtitle">Track all your submitted claims</p>
          </div>
          <div className="mc-header-actions">
            <button onClick={fetchMyClaims} className="mc-btn-ghost">
              <RefreshCw size={14} className={loading ? "mc-spin" : ""} style={{ color: loading ? "#818cf8" : "rgba(255,255,255,0.45)" }} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (successMsg) setSuccessMsg("");
                if (errorMsg) setErrorMsg("");
              }}
              className="mc-btn-primary"
            >
              <Plus size={15} />
              <span>New Claim</span>
            </button>
          </div>
        </div>

        {/* ── Success toast ── */}
        {successMsg && (
          <div className="mc-toast mc-toast--success">
            <CheckCircle size={15} style={{ flexShrink: 0 }} />
            <p>{successMsg}</p>
            <button onClick={() => setSuccessMsg("")} className="mc-toast-close"><X size={13} /></button>
          </div>
        )}

        {/* ── New claim form ── */}
        {showForm && (
          <div className="mc-form-card">
            <h2 className="mc-form-title">Submit a New Claim</h2>
            <form onSubmit={handleSubmitClaim}>
              {errorMsg && (
                <div className="mc-toast mc-toast--error" style={{ marginBottom: 16 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <p>{errorMsg}</p>
                </div>
              )}
              <div className="mc-form-grid">
                <div className="mc-field">
                  <label className="mc-label">Trigger Event</label>
                  <select
                    value={triggerType}
                    onChange={(e: any) => setTriggerType(e.target.value)}
                    className="mc-select"
                  >
                    {TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>{opt.icon} {opt.type}</option>
                    ))}
                  </select>
                </div>
                <div className="mc-field">
                  <label className="mc-label">Claim Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max="50000"
                    required
                    value={amount}
                    onChange={(e: any) => setAmount(e.target.value)}
                    className="mc-input"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>
              <div className="mc-form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="mc-btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="mc-btn-primary">
                  {submitting ? (
                    <><span className="mc-spinner" />Submitting…</>
                  ) : "Submit Claim"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="mc-empty-state">
            <RefreshCw size={26} className="mc-spin" style={{ color: "#818cf8", marginBottom: 12 }} />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Loading your claims…</p>
          </div>

        /* ── Empty ── */
        ) : (!claims || claims.length === 0) ? (
          <div className="mc-empty-state">
            <div className="mc-empty-icon">
              <ClipboardList size={26} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <p className="mc-empty-title">No Claims Yet</p>
            <p className="mc-empty-sub">You haven't filed any claims yet.</p>
          </div>

        /* ── Claims list ── */
        ) : (
          <div className="mc-list">
            {claims.map((claim, index) => {
              const stepsCompleted =
                claim.status === "paid" ? 4 :
                claim.status === "auto-approved" ? 3 :
                claim.status === "pending-review" ? 1 :
                claim.status === "rejected" ? 2 : 1;

              const statusCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
                "paid":           { label: "Paid",          color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.2)"  },
                "auto-approved":  { label: "Auto Approved", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)" },
                "pending-review": { label: "Under Review",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
                "rejected":       { label: "Rejected",      color: "#f87171", bg: "rgba(248,113,113,0.1)",border: "rgba(248,113,113,0.2)"},
              };
              const cfg = statusCfg[claim.status] || statusCfg["pending-review"];

              return (
                <div
                  key={claim.id}
                  className="mc-card"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Top row */}
                  <div className="mc-card-top">
                    <div className="mc-card-left">
                      <div className="mc-trigger-icon">{claim.trigger_icon || "⚠️"}</div>
                      <div>
                        <h3 className="mc-claim-type">{claim.trigger_type}</h3>
                        <p className="mc-claim-meta">
                          <span className="mc-mono">#{claim.id?.slice(0, 8)}</span>
                          <span className="mc-sep">·</span>
                          <span>Filed {formatRelativeTime(claim.created_at)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mc-card-right">
                      <p className="mc-amount">₹{claim.amount?.toLocaleString("en-IN")}</p>
                      <span
                        className="mc-status-chip"
                        style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="mc-stepper-row">
                    <div className="mc-stepper">
                      {["Filed", "Reviewed", "Approved", "Paid"].map((step, i) => {
                        const isCompleted = i < stepsCompleted;
                        const isRejected = claim.status === "rejected" && i === 1;
                        return (
                          <div key={step} className="mc-step">
                            <div
                              className="mc-step-dot"
                              style={{
                                background: isRejected ? "#f87171" : isCompleted ? "#4ade80" : "rgba(255,255,255,0.12)",
                                boxShadow: isRejected ? "0 0 8px rgba(248,113,113,0.5)" : isCompleted ? "0 0 8px rgba(74,222,128,0.45)" : "none",
                              }}
                            />
                            {i < 3 && (
                              <div
                                className="mc-step-line"
                                style={{ background: isCompleted && !isRejected ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)" }}
                              />
                            )}
                            <span
                              className="mc-step-label"
                              style={{
                                color: isRejected ? "#f87171" : isCompleted ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.22)",
                              }}
                            >
                              {isRejected && i === 1 ? "Rejected" : step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {claim.status === "pending-review" && (
                      <span className="mc-badge" style={{ color: "#fbbf24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>Under review</span>
                    )}
                    {claim.status === "rejected" && (
                      <span className="mc-badge" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>Declined</span>
                    )}
                    {(claim.status === "paid" || claim.status === "auto-approved") && (
                      <span className="mc-badge" style={{ color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>Paid out</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  .mc-wrap {
    font-family: 'Sora', sans-serif;
    max-width: 860px;
    margin: 0 auto;
    animation: mc-fadeUp 0.35s ease both;
  }
  @keyframes mc-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Header ── */
  .mc-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 14px; margin-bottom: 24px;
  }
  .mc-title  { margin: 0 0 4px; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -0.025em; }
  .mc-subtitle { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }
  .mc-header-actions { display: flex; gap: 10px; align-items: center; }

  /* ── Buttons ── */
  .mc-btn-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; background: #6366f1; border: none; border-radius: 10px;
    color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'Sora', sans-serif;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
    transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  }
  .mc-btn-primary:hover:not(:disabled) {
    background: #4f46e5; transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
  }
  .mc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .mc-btn-ghost {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 15px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; color: rgba(255,255,255,0.65); font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'Sora', sans-serif; transition: all 0.18s;
  }
  .mc-btn-ghost:hover { background: rgba(255,255,255,0.09); color: #fff; }

  .mc-btn-cancel {
    background: none; border: none; padding: 9px 14px;
    color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 500;
    cursor: pointer; font-family: 'Sora', sans-serif; transition: color 0.18s;
  }
  .mc-btn-cancel:hover { color: #fff; }

  /* ── Toasts ── */
  .mc-toast {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 12px; font-size: 13px;
    margin-bottom: 16px; border: 1px solid transparent;
  }
  .mc-toast p { margin: 0; flex: 1; }
  .mc-toast--success { background: rgba(74,222,128,0.08); border-color: rgba(74,222,128,0.22); color: #4ade80; }
  .mc-toast--error   { background: rgba(248,113,113,0.08); border-color: rgba(248,113,113,0.22); color: #f87171; }
  .mc-toast-close {
    background: none; border: none; cursor: pointer; color: inherit;
    opacity: 0.6; display: flex; padding: 0; margin-left: auto;
  }
  .mc-toast-close:hover { opacity: 1; }

  /* ── Form ── */
  .mc-form-card {
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 18px; padding: 24px; margin-bottom: 20px;
    animation: mc-slideDown 0.22s ease both;
  }
  @keyframes mc-slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: none; }
  }
  .mc-form-title { margin: 0 0 20px; font-size: 16px; font-weight: 600; color: #fff; }
  .mc-form-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
  .mc-field      { display: flex; flex-direction: column; gap: 7px; }
  .mc-label      { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.38); }
  .mc-input, .mc-select {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 14px;
    font-family: 'Sora', sans-serif; outline: none; transition: border-color 0.18s;
  }
  .mc-input::placeholder { color: rgba(255,255,255,0.22); }
  .mc-input:focus, .mc-select:focus { border-color: rgba(99,102,241,0.55); background: rgba(99,102,241,0.07); }
  .mc-select option { background: #1a1a2e; }
  .mc-form-actions { display: flex; justify-content: flex-end; gap: 8px; }
  .mc-spinner {
    display: inline-block; width: 13px; height: 13px; margin-right: 6px;
    border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
    border-radius: 50%; animation: mc-spin 0.7s linear infinite;
  }

  /* ── Empty / Loading ── */
  .mc-empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; padding: 60px 24px;
    background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 18px; text-align: center;
  }
  .mc-empty-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .mc-empty-title { margin: 0; font-size: 16px; font-weight: 600; color: #fff; }
  .mc-empty-sub   { margin: 0; font-size: 13px; color: rgba(255,255,255,0.35); }

  /* ── Claims list ── */
  .mc-list { display: flex; flex-direction: column; gap: 12px; }

  .mc-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 20px 22px;
    animation: mc-fadeUp 0.32s ease both;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mc-card:hover { border-color: rgba(255,255,255,0.12); box-shadow: 0 6px 28px rgba(0,0,0,0.22); }

  .mc-card-top {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
  }
  .mc-card-left  { display: flex; align-items: center; gap: 14px; }
  .mc-trigger-icon {
    width: 48px; height: 48px; flex-shrink: 0; font-size: 22px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; display: flex; align-items: center; justify-content: center;
  }
  .mc-claim-type { margin: 0 0 5px; font-size: 15px; font-weight: 600; color: #fff; }
  .mc-claim-meta {
    margin: 0; display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: rgba(255,255,255,0.35);
  }
  .mc-mono { font-family: 'SF Mono', 'Fira Code', monospace; color: rgba(255,255,255,0.5); }
  .mc-sep  { opacity: 0.4; }

  .mc-card-right { text-align: right; flex-shrink: 0; }
  .mc-amount { margin: 0 0 7px; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .mc-status-chip {
    display: inline-block; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 4px 10px; border-radius: 6px;
  }

  /* ── Stepper ── */
  .mc-stepper-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.055);
  }
  .mc-stepper {
    display: flex; align-items: center; flex: 1; gap: 0; position: relative;
    padding-bottom: 18px;
  }
  .mc-step { display: flex; align-items: center; flex: 1; position: relative; }
  .mc-step:last-child { flex: none; }
  .mc-step-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; z-index: 1;
    transition: box-shadow 0.2s;
  }
  .mc-step-line { flex: 1; height: 2px; }
  .mc-step-label {
    position: absolute; top: 18px; left: -12px;
    font-size: 10.5px; font-weight: 500; white-space: nowrap;
    pointer-events: none;
  }
  .mc-badge {
    font-size: 11px; font-weight: 600; padding: 4px 10px;
    border-radius: 7px; white-space: nowrap; flex-shrink: 0;
  }

  /* ── Utilities ── */
  .mc-spin { animation: mc-spin 0.8s linear infinite; }
  @keyframes mc-spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .mc-form-grid { grid-template-columns: 1fr; }
    .mc-card-top  { flex-direction: column; align-items: flex-start; }
    .mc-card-right { text-align: left; }
  }
`;