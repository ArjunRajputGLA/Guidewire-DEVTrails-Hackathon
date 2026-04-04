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
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Claims</h1>
          <p className="text-gray-500 text-sm mt-1">Track all your submitted claims</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchMyClaims}
            className="px-4 py-2 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
            <span className="text-sm font-medium hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              if (successMsg) setSuccessMsg("");
              if (errorMsg) setErrorMsg("");
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors border border-indigo-400/50"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">New Claim</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-start justify-between gap-3 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-500/80 hover:text-emerald-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="p-6 border border-indigo-500/30 bg-indigo-500/5 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">Submit a New Claim</h2>
          <form onSubmit={handleSubmitClaim} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Trigger Event</label>
                <select 
                  value={triggerType}
                  onChange={(e: any) => setTriggerType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {TRIGGER_OPTIONS.map((opt) => (
                    <option key={opt.type} value={opt.type}>{opt.icon} {opt.type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Claim Amount (₹)</label>
                <input 
                  type="number"
                  min="1"
                  max="50000"
                  required
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors border border-indigo-400/50"
              >
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your claims...</p>
        </div>
      ) : (!claims || claims.length === 0) ? (
        <div className="p-12 text-center bg-white/5 border border-white/5 rounded-2xl">
          <div className="w-16 h-16 bg-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
            <ClipboardList className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Claims Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You haven't filed any claims yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim, index) => (
            <div
              key={claim.id}
              className="p-5 bg-white/5 animate-fade-in border border-white/5 rounded-2xl"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-2xl shadow-inner">
                    {claim.trigger_icon || '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{claim.trigger_type}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                       <span>ID: <span className="font-mono text-gray-400">{claim.id?.slice(0,8)}</span></span>
                       <span>·</span>
                       <span>Filed {formatRelativeTime(claim.created_at)}</span>
                    </p>
                  </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="text-lg font-bold text-white mb-1">₹{claim.amount}</p>
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold border ${
                      claim.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                        : claim.status === "auto-approved"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                        : claim.status === "pending-review"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        : "bg-red-500/15 text-red-400 border-red-500/20"
                    }`}
                  >
                    {claim.status?.replace("-", " ") || "PENDING"}
                  </span>
                </div>
              </div>

               <div className="mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-3/4 overflow-x-auto pb-2 md:pb-0">
                  {["Filed", "Reviewed", "Approved", "Paid"].map((step, i) => {
                    const stepsCompleted =
                      claim.status === "paid" ? 4 :
                      claim.status === "auto-approved" ? 3 :
                      claim.status === "pending-review" ? 1 :
                      claim.status === "rejected" ? 2 : 1;
                    const isCompleted = i < stepsCompleted;
                    const isRejected = claim.status === "rejected" && i === 1;
                    
                    return (
                      <div key={step} className="flex items-center gap-2 min-w-16 flex-1 last:flex-none">
                        <div className={`w-2 h-2 rounded-full z-10 relative ring-4 ring-gray-950 ${
                          isRejected ? "bg-red-500" :
                          isCompleted ? "bg-emerald-500" : "bg-gray-800"
                        }`} />
                        <span className={`text-[10px] font-medium absolute mt-8 whitespace-nowrap -ml-2 ${
                          isRejected ? "text-red-400" :
                          isCompleted ? "text-gray-300" : "text-gray-600"
                        }`}>
                          {isRejected && i === 1 ? "Rejected" : step}
                        </span>
                        {i < 3 && (
                          <div className={`flex-1 h-px w-full -ml-3 -mr-3 ${
                            isCompleted && !isRejected ? "bg-emerald-500/30" : "bg-gray-800"
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {claim.status === "pending-review" && (
                   <p className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Under review</p>
                )}
                {claim.status === "rejected" && (
                   <p className="text-xs text-red-400/80 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Declined</p>
                )}
                {(claim.status === "paid" || claim.status === "auto-approved") && (
                   <p className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Paid out</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
