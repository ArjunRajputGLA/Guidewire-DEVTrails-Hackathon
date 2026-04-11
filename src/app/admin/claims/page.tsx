"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, TrendingUp, Zap, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteClaimAction } from "./actions";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [claimToDelete, setClaimToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchClaims = async () => {
    setLoading(true);
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

  const updateClaimStatus = async (claim: any, status: string) => {
    const { error, data } = await supabase
      .from("claims")
      .update({ status })
      .eq("id", claim.id);

    if (error) {
      console.error(`Error updating claim to ${status}:`, error);
      alert("Failed to update status. Check permissions or network. " + error.message);
    } else {
      // Admin update notification insert
      if (claim.worker_id) {
        if (status === "paid") {
          await supabase.from("notifications").insert([{
            user_id: claim.worker_id,
            title: "Claim Approved",
            message: `Your claim of ₹${claim.amount || 100} has been approved.`,
            type: "success"
          }]);
        } else if (status === "rejected") {
          await supabase.from("notifications").insert([{
            user_id: claim.worker_id,
            title: "Claim Rejected",
            message: "Your claim was reviewed and rejected by the admin.",
            type: "error"
          }]);
        }
      }
      fetchClaims();
    }
  };

  const confirmDeleteClaim = async () => {
    if (!claimToDelete) return;
    setIsDeleting(true);
    
    try {
      const result = await deleteClaimAction(claimToDelete);
      
      if (!result.success) {
        alert("Failed to delete claim: " + result.error);
      } else {
        await fetchClaims();
      }
    } catch (err: any) {
      alert("Error deleting claim: " + err.message);
    }
    
    setClaimToDelete(null);
    setIsDeleting(false);
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    paid: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border border-emerald-500/20",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: "Paid",
    },
    "auto-approved": {
      color: "text-blue-400",
      bg: "bg-blue-500/10 border border-blue-500/20",
      icon: <Zap className="w-3.5 h-3.5" />,
      label: "Auto-Approved",
    },
    "pending-review": {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border border-amber-500/20",
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Pending Review",
    },
    rejected: {
      color: "text-red-400",
      bg: "bg-red-500/10 border border-red-500/20",
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: "Rejected",
    },
      withdrawn: {
        color: "text-gray-400",
        bg: "bg-gray-500/10 border border-gray-500/20",
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Withdrawn",
      },
  };

  const stats = [
    {
      label: "Total Claims",
      value: claims.length,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-indigo-400",
      bg: "from-indigo-500/15 to-indigo-500/5 border-indigo-500/20",
      accent: "#6366f1",
    },
    {
      label: "Paid Out",
      value: claims.filter((c) => c.status === "paid" || c.status === "auto-approved").length,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-emerald-400",
      bg: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20",
      accent: "#22c55e",
    },
    {
      label: "Pending Review",
      value: claims.filter((c) => c.status === "pending-review").length,
      icon: <Clock className="w-5 h-5" />,
      color: "text-amber-400",
      bg: "from-amber-500/15 to-amber-500/5 border-amber-500/20",
      accent: "#f59e0b",
    },
    {
      label: "Rejected",
      value: claims.filter((c) => c.status === "rejected").length,
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-400",
      bg: "from-red-500/15 to-red-500/5 border-red-500/20",
      accent: "#ef4444",
    },
      {
        label: "Withdrawn",
        value: claims.filter((c) => c.status === "withdrawn").length,
        icon: <XCircle className="w-5 h-5" />,
        color: "text-gray-400",
        bg: "from-gray-500/15 to-gray-500/5 border-gray-500/20",
        accent: "#9ca3af",
      },
  ];

  const fraudScoreColor = (score: number) => {
    if (score < 30) return { text: "text-emerald-400", bar: "from-emerald-500 to-emerald-400" };
    if (score < 60) return { text: "text-amber-400", bar: "from-amber-500 to-amber-400" };
    return { text: "text-red-400", bar: "from-red-500 to-red-400" };
  };

  const filteredClaims = claims.filter((claim) => {
    const term = searchQuery.toLowerCase();
    const workerName = (claim.worker_profiles?.full_name || "").toLowerCase();
    const claimType = (claim.trigger_type || "").toLowerCase();
    const claimId = (claim.id || "").toLowerCase();
    return workerName.includes(term) || claimType.includes(term) || claimId.includes(term);
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Claims Pipeline</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">Zero-touch parametric claims processing engine</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[250px]"
          />
          <button
            onClick={fetchClaims}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-indigo-500/40 transition-all duration-200"
          >
            <RefreshCw
              className={`w-4 h-4 transition-all duration-700 ${
                loading ? "animate-spin text-indigo-400" : "text-gray-400 group-hover:text-indigo-400 group-hover:rotate-180"
              }`}
            />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bg} border p-5 group hover:scale-[1.02] transition-all duration-200`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={s.color}>{s.icon}</span>
              <div
                className="w-2 h-2 rounded-full opacity-60 animate-pulse"
                style={{ backgroundColor: s.accent }}
              />
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            <div
              className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
              style={{ background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)` }}
            />
          </div>
        ))}
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {loading && claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
            <p className="text-sm">Fetching claims data...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl text-gray-500">
            <AlertCircle className="w-10 h-10 text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-400">No matching claims found</p>
            <p className="text-xs text-gray-600 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          filteredClaims.map((claim, i) => {
            const cfg = statusConfig[claim.status] || statusConfig["pending-review"];
            const fraud = fraudScoreColor(claim.fraud_score || 0);
            return (
              <div
                key={claim.id}
                className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.055] hover:border-white/[0.12] transition-all duration-200 overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Left accent bar based on status */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl ${
                    claim.status === "paid" || claim.status === "auto-approved"
                      ? "bg-emerald-500"
                      : claim.status === "pending-review"
                      ? "bg-amber-500"                        : claim.status === "withdrawn"
                        ? "bg-gray-500"                      : "bg-red-500"
                  } opacity-60`}
                />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 pl-6">
                  {/* Left: Worker info */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-xl flex-shrink-0">
                      {claim.trigger_icon || "⚠️"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {claim.worker_profiles?.full_name || "Unknown Worker"}
                        </p>
                        <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-md">
                          #{claim.id?.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-gray-400">{claim.trigger_type}</span>
                        {" · "}Filed {formatRelativeTime(claim.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Metrics + Status */}
                  <div className="flex items-center gap-6 ml-auto flex-wrap">
                    {/* Fraud Score */}
                    <div className="text-center">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Fraud Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${fraud.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${claim.fraud_score || 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${fraud.text}`}>
                          {claim.fraud_score || 0}
                        </span>
                      </div>
                    </div>

                    {/* Payout */}
                    <div className="text-center">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Payout</p>
                      <p className="text-lg font-bold text-white tabular-nums">₹{claim.amount}</p>
                    </div>

                    {/* Status badge + actions */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      {claim.status === "pending-review" && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateClaimStatus(claim, "paid")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => updateClaimStatus(claim, "rejected")}
                            className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold border border-red-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setClaimToDelete(claim.id)}
                        className="p-1.5 ml-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500/80 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
                        title="Delete Claim"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {claimToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-red-500/20 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_40px_rgba(239,68,68,0.15)] overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-5 mx-auto border border-red-500/20">
              <TriangleAlert className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-3">Delete Claim Record?</h3>
            <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
              This action <span className="text-red-400 font-semibold">cannot be undone</span>. The claim record will be permanently removed from the system and database.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setClaimToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-semibold border border-white/10 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteClaim}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}