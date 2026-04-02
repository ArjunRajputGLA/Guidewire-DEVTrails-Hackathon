"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, Plus, AlertCircle, RefreshCw, CheckCircle, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

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
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [triggerType, setTriggerType] = useState(TRIGGER_OPTIONS[0].type);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchMyClaims = async () => {
    if (!user?.name) return;
    setLoading(true);
    
    // Auto-map current user's full_name to their worker profile
    let { data: workers } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("full_name", user.name)
      .limit(1);

    if (workers && workers.length > 0) {
      const workerId = workers[0].id;
      const { data: userClaims } = await supabase
        .from("claims")
        .select("*")
        .eq("worker_id", workerId)
        .order("created_at", { ascending: false });
      
      setClaims(userClaims || []);
    } else {
      setClaims([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyClaims();
  }, [user]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user?.name) {
      setErrorMsg("You must be logged in.");
      return;
    }
    
    setSubmitting(true);
    
    let { data: workers } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("full_name", user.name)
      .limit(1);

    // Fallback if matching name isn't found
    if (!workers || workers.length === 0) {
      const { data: anyWorker } = await supabase.from("worker_profiles").select("id").limit(1);
      if (anyWorker && anyWorker.length > 0) workers = anyWorker;
      else {
         setErrorMsg("No worker profile found. Please complete onboarding first.");
         setSubmitting(false);
         return;
      }
    }

    const workerId = workers[0].id;
    const selectedTrigger = TRIGGER_OPTIONS.find(t => t.type === triggerType);

    const payload = {
      worker_id: workerId,
      trigger_type: selectedTrigger?.type || triggerType,
      trigger_icon: selectedTrigger?.icon || "⚠️",
      amount: parseFloat(amount) || 1000,
      fraud_score: Math.floor(Math.random() * 40), // Random medium/low score for demo
      status: "pending-review"
    };

    const { error } = await supabase.from("claims").insert([payload]);

    if (error) {
      setErrorMsg("Failed to submit claim: " + error.message);
      setSuccessMsg("");
    } else {
      setShowForm(false);
      setAmount("");
      setSuccessMsg("Your claim has been submitted successfully and is pending review.");
      fetchMyClaims();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    }
    setSubmitting(false);
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
            className="glass-button px-4 py-2 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
            <span className="text-sm font-medium text-white hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              if (successMsg) setSuccessMsg("");
              if (errorMsg) setErrorMsg("");
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">New Claim</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-xl flex items-start justify-between gap-3 animate-fade-in shadow-lg shadow-emerald-500/5">
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
        <div className="glass-card p-6 border border-indigo-500/30">
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
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-gray-600"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Claim"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="glass-card p-8 text-center border border-gray-800/50">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your claims...</p>
        </div>
      ) : (!claims || claims.length === 0) ? (
        <div className="glass-card p-12 text-center border-t border-gray-800/50">
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
              className="glass-card p-5 animate-fade-in border border-gray-800/50"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-900/80 rounded-xl border border-gray-800 flex items-center justify-center text-2xl shadow-inner">
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
                    className={`status-badge text-[10px] px-2 py-1 rounded-full ${
                      claim.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : claim.status === "auto-approved"
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                        : claim.status === "pending-review"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {claim.status?.replace("-", " ").toUpperCase() || "PENDING"}
                  </span>
                </div>
              </div>

               <div className="mt-6 pt-4 border-t border-gray-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                   <p className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded">Under review</p>
                )}
                {claim.status === "rejected" && (
                   <p className="text-xs text-red-400/80 bg-red-500/10 px-2 py-1 rounded">Declined</p>
                )}
                {(claim.status === "paid" || claim.status === "auto-approved") && (
                   <p className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded">Paid out</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
