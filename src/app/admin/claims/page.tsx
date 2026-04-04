"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchClaims = async () => {
    setLoading(true);
    // Add timestamp to bypass any browser/Next.js caching of the Supabase fetch request
    const dummyTimestamp = new Date().getTime(); 
    const { data, error } = await supabase
      .from("claims")
      .select("*, worker_profiles(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching claims:", error);
    } else if (data) {
      setClaims(data);
    }
    setLoading(false);
    router.refresh();
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const updateClaimStatus = async (id: string, status: string) => {
    const { error, data } = await supabase
      .from("claims")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      console.error(`Error updating claim to ${status}:`, error);
      alert("Failed to update status. Check permissions or network. " + error.message);
    } else {
      fetchClaims();
    }
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    "paid": { color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Paid" },
    "auto-approved": { color: "bg-blue-500/15 text-blue-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Auto-Approved" },
    "pending-review": { color: "bg-amber-500/15 text-amber-400", icon: <Clock className="w-3.5 h-3.5" />, label: "Pending Review" },
    "rejected": { color: "bg-red-500/15 text-red-400", icon: <XCircle className="w-3.5 h-3.5" />, label: "Rejected" },
  };

  const fraudScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-400";
    if (score < 60) return "text-amber-400";
    return "text-red-400";
  };

  const stats = [
    { label: "Total Claims", value: claims.length, icon: <AlertCircle className="w-5 h-5 text-indigo-400" /> },
    { label: "Paid Out", value: claims.filter(c => c.status === "paid" || c.status === "auto-approved").length, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
    { label: "Pending", value: claims.filter(c => c.status === "pending-review").length, icon: <Clock className="w-5 h-5 text-amber-400" /> },
    { label: "Rejected", value: claims.filter(c => c.status === "rejected").length, icon: <XCircle className="w-5 h-5 text-red-400" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Claims Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1">Zero-touch parametric claims processing</p>
        </div>
        <button onClick={fetchClaims} className="glass-button px-4 py-2 flex items-center justify-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-white">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            {s.icon}
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Claims Cards */}
      <div className="space-y-4">
        {loading && claims.length === 0 ? (
           <p className="text-gray-400 text-sm py-4">Loading claims...</p>
        ) : claims.length === 0 ? (
           <p className="text-gray-400 text-sm py-4">No claims found.</p>
        ) : (
          claims.map((claim, i) => (
            <div key={claim.id} className="glass-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center gap-4">
                <span className="text-2xl">{claim.trigger_icon || '⚠️'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{claim.worker_profiles?.full_name || "Unknown Worker"}</p>
                    <span className="text-xs font-mono text-gray-500">{claim.id?.slice(0,8)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {claim.trigger_type} · Filed {formatRelativeTime(claim.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto overflow-x-auto">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Fraud Score</p>
                  <p className={`text-lg font-bold ${fraudScoreColor(claim.fraud_score || 0)}`}>{claim.fraud_score || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Payout</p>
                  <p className="text-lg font-bold text-white">₹{claim.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge flex items-center gap-1.5 ${statusConfig[claim.status]?.color || statusConfig['pending-review'].color}`}>
                    {statusConfig[claim.status]?.icon || statusConfig['pending-review'].icon}
                    {statusConfig[claim.status]?.label || "Unknown"}
                  </span>
                  {claim.status === "pending-review" && (
                    <div className="flex gap-2 ml-2">
                      <button 
                        onClick={() => updateClaimStatus(claim.id, "paid")}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-md text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateClaimStatus(claim.id, "rejected")}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-xs font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
