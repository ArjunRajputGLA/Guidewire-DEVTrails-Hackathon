"use client";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, CloudRain } from "lucide-react";
import { getClaims, addClaim, Claim } from "@/services/claimService";

export default function ClaimsPage() {
  const [claimsList, setClaimsList] = useState<Claim[]>([]);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [newClaimData, setNewClaimData] = useState({ userId: "", reason: "", amount: "" });

  const loadClaims = () => {
    setClaimsList(getClaims());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClaims();
  }, []);

  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimData.userId || !newClaimData.reason || !newClaimData.amount) return;

    addClaim({
      userId: newClaimData.userId,
      reason: newClaimData.reason,
      amount: Number(newClaimData.amount),
    });

    setNewClaimData({ userId: "", reason: "", amount: "" });
    setIsManualFormOpen(false);
    loadClaims();
  };

  const handleTriggerHeavyRain = () => {
    // Auto-generate claims from triggers
    addClaim({
      userId: "W" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      reason: "Weather Disruption",
      amount: 500,
      status: "Auto-Generated"
    });
    loadClaims();
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    "Paid": { color: "bg-emerald-500/15 text-emerald-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Paid" },
    "Auto-Generated": { color: "bg-blue-500/15 text-blue-400", icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Auto-Generated" },
    "Pending": { color: "bg-amber-500/15 text-amber-400", icon: <Clock className="w-3.5 h-3.5" />, label: "Pending" },
    "Rejected": { color: "bg-red-500/15 text-red-400", icon: <XCircle className="w-3.5 h-3.5" />, label: "Rejected" },
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig["Pending"];
  };

  const stats = [
    { label: "Total Claims", value: claimsList.length, icon: <AlertCircle className="w-5 h-5 text-indigo-400" /> },
    { label: "Paid Out", value: claimsList.filter(c => c.status === "Paid").length, icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
    { label: "Pending", value: claimsList.filter(c => c.status === "Pending").length, icon: <Clock className="w-5 h-5 text-amber-400" /> },
    { label: "Auto-Gen", value: claimsList.filter(c => c.status === "Auto-Generated").length, icon: <XCircle className="w-5 h-5 text-blue-400" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Claims Pipeline</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor worker claims</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleTriggerHeavyRain}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
          >
            <CloudRain className="w-4 h-4" />
            Trigger: Heavy Rain
          </button>
          <button 
            onClick={() => setIsManualFormOpen(!isManualFormOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Manual Claim
          </button>
        </div>
      </div>

      {isManualFormOpen && (
        <div className="glass-card p-5 animate-fade-in border border-indigo-500/30">
          <h3 className="text-lg font-medium text-white mb-4">Create New Claim</h3>
          <form onSubmit={handleAddClaim} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">User ID</label>
              <input 
                type="text" 
                value={newClaimData.userId}
                onChange={(e) => setNewClaimData({...newClaimData, userId: e.target.value})}
                placeholder="e.g. W001"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Reason</label>
              <input 
                type="text" 
                value={newClaimData.reason}
                onChange={(e) => setNewClaimData({...newClaimData, reason: e.target.value})}
                placeholder="e.g. Accident"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                value={newClaimData.amount}
                onChange={(e) => setNewClaimData({...newClaimData, amount: e.target.value})}
                placeholder="0"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors h-[38px]"
            >
              Submit Claim
            </button>
          </form>
        </div>
      )}

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
        {claimsList.map((claim, i) => (
          <div key={claim.id} className="glass-card p-5 flex items-center justify-between"
            style={{ animationDelay: `${(i % 10) * 80}ms` }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl overflow-hidden shrink-0">
                {claim.reason.toLowerCase().includes('rain') || claim.reason.toLowerCase().includes('weather') ? '🌧️' : '📝'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">User: {claim.userId}</p>
                  <span className="text-xs font-mono text-gray-500">ID: {claim.id}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{claim.reason} · Filed {new Date(claim.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500">Payout</p>
                <p className="text-lg font-bold text-white">₹{claim.amount}</p>
              </div>
              <span className={`status-badge flex items-center gap-1.5 ${getStatusConfig(claim.status).color}`}>
                {getStatusConfig(claim.status).icon}
                {getStatusConfig(claim.status).label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
