const fs = require("fs");

const newContent = `"use client";
import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion, Cpu, Loader2, AlertTriangle, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";

interface FraudCluster {
  mobile: string;
  workers: string[];
  workerIds: string[];
  maxScore: number;
  alerts: any[];
}

export default function FraudPage() {
  const [fraudClusters, setFraudClusters] = useState<FraudCluster[]>([]);
  const [loading, setLoading] = useState(true);

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    confirmed: {
      color: "text-red-400",
      bg: "bg-red-500/10 border border-red-500/20",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      label: "Confirmed Fraud",
    },
    investigating: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border border-amber-500/20",
      icon: <ShieldQuestion className="w-3.5 h-3.5" />,
      label: "Investigating",
    },
    cleared: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border border-emerald-500/20",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      label: "Cleared",
    },
  };

  const detectionLayers = [
    { layer: "L1", name: "GPS Validation", desc: "Geofence + movement", color: "#6366f1" },
    { layer: "L2", name: "Platform Cross-check", desc: "Order count verify", color: "#8b5cf6" },
    { layer: "L3", name: "Claim Frequency", desc: "Isolation Forest", color: "#a855f7" },
    { layer: "L4", name: "Time Anomaly", desc: "Z-score analysis", color: "#d946ef" },
    { layer: "L5", name: "Network Clustering", desc: "Fraud ring detection", color: "#ec4899" },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 80) return { stroke: "#ef4444", glow: "rgba(239,68,68,0.3)", text: "text-red-400", label: "HIGH" };
    if (score >= 50) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.3)", text: "text-amber-400", label: "MED" };
    return { stroke: "#22c55e", glow: "rgba(34,197,94,0.3)", text: "text-emerald-400", label: "LOW" };
  };

  const mapStatus = (dbStatus: string) => {
    if (dbStatus === "rejected") return "confirmed";
    if (dbStatus === "paid") return "cleared";
    return "investigating";
  };

  const getDetectionLayer = (score: number) => {
    if (score >= 80) return "L1: GPS Validation";
    if (score >= 50) return "L3: Isolation Forest";
    return "L4: Time Anomaly";
  };

  useEffect(() => {
    const fetchFraudAlerts = async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("*, worker_profiles(id, full_name, mobile)")
        .order("fraud_score", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error fetching fraud alerts:", error);
      } else if (data) {
        const grouped = data.reduce((acc: any, claim: any) => {
          const mobile = claim.worker_profiles?.mobile || "Unknown Phone";
          if (!acc[mobile]) {
            acc[mobile] = {
              mobile,
              workers: new Set<string>(),
              workerIds: new Set<string>(),
              maxScore: 0,
              alerts: []
            };
          }
          
          acc[mobile].workers.add(claim.worker_profiles?.full_name || "Unknown Worker");
          acc[mobile].workerIds.add(claim.worker_profiles?.id || claim.worker_id);
          acc[mobile].maxScore = Math.max(acc[mobile].maxScore, claim.fraud_score || 0);
          
          acc[mobile].alerts.push({
            id: claim.id,
            workerId: claim.worker_id,
            workerName: claim.worker_profiles?.full_name || "Unknown Worker",
            type: claim.trigger_type || "Unknown Type",
            riskScore: typeof claim.fraud_score === "number" ? claim.fraud_score : 0,
            detectionLayer: getDetectionLayer(claim.fraud_score),
            description: claim.explanation || "System flagged for anomalous pattern.",
            status: mapStatus(claim.status),
            detectedAt: claim.created_at,
          });
          
          return acc;
        }, {});

        const clusters: FraudCluster[] = Object.values(grouped)
          .map((c: any) => ({
            ...c,
            workers: Array.from(c.workers),
            workerIds: Array.from(c.workerIds),
          }))
          .filter((c: any) => c.maxScore > 0)
          .sort((a: any, b: any) => b.maxScore - a.maxScore);

        setFraudClusters(clusters);
      }
      setLoading(false);
    };

    fetchFraudAlerts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Fraud Detection</h2>
        </div>
        <p className="text-sm text-gray-500 ml-11">5-layer AI-powered fraud prevention system, clustered by device signals.</p>
      </div>

      {/* Detection Layers */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {detectionLayers.map((l, i) => (
          <div
            key={l.layer}
            className="relative group rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 text-center hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {i < detectionLayers.length - 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-px bg-gradient-to-r from-white/10 to-transparent hidden md:block" />
            )}
            <div
              className="w-9 h-9 rounded-xl mx-auto mb-3 flex items-center justify-center text-xs font-bold text-white border"
              style={{ background: `${l.color}20`, borderColor: `${l.color}35`, color: l.color }}
            >
              {l.layer}
            </div>
            <div
              className="w-1 h-1 rounded-full mx-auto mb-2 animate-pulse"
              style={{ backgroundColor: l.color }}
            />
            <p className="text-xs font-semibold text-white leading-tight">{l.name}</p>
            <p className="text-[10px] text-gray-600 mt-1">{l.desc}</p>
          </div>
        ))}
      </div>

      {/* Clustered Alert Cards */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="ml-3 text-gray-400">Loading device clusters...</span>
          </div>
        ) : fraudClusters.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No active fraud alerts</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Our AI systems have not detected any anomalous clusters recently.
            </p>
          </div>
        ) : (
          fraudClusters.map((cluster, clusterIndex) => (
            <div key={cluster.mobile} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden">
              {/* Cluster Header */}
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-5 mb-5 relative z-10">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Phone className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                        {cluster.mobile}
                        {cluster.workers.length > 1 && (
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Ring Detected ({cluster.workers.length})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                        <span className="font-medium text-gray-300">Targeting:</span> {cluster.workers.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/admin/workers?search=${cluster.mobile === "Unknown Phone" ? encodeURIComponent(cluster.workers[0]) : encodeURIComponent(cluster.mobile)}`}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  View Network
                </Link>
              </div>

              {/* Alert List */}
              <div className="space-y-3 relative z-10">
                {cluster.alerts.map((alert, i) => {
                  const risk = getRiskColor(alert.riskScore);
                  const cfg = statusConfig[alert.status];
                  const circumference = 2 * Math.PI * 26;
                  const strokeDash = (alert.riskScore / 100) * circumference;

                  return (
                    <div
                      key={alert.id}
                      className="group relative rounded-xl bg-black/20 border border-white/[0.04] p-5 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                              <circle cx="32" cy="32" r="26" fill="none" stroke="#ffffff05" strokeWidth="5" />
                              <circle
                                cx="32" cy="32" r="26" fill="none"
                                stroke={risk.stroke}
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                style={{ filter: `drop-shadow(0 0 4px ${risk.glow})` }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-sm font-bold tabular-nums leading-none ${risk.text}`}>{alert.riskScore}</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <h3 className="text-sm font-semibold text-white">{alert.type}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                                {cfg.icon}
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1.5">
                              <span className="text-gray-400 font-medium">{alert.workerName}</span>
                              {" \u00B7 "}
                              <span className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5 font-mono text-gray-400">
                                {alert.detectionLayer}
                              </span>
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">{alert.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0">
                          <Link 
                            href={`/admin/workers?search=${encodeURIComponent(alert.workerName)}`}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 transition-all duration-200"
                          >
                            View Worker
                          </Link>
                          {alert.status === "investigating" && (
                            <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200">
                              Confirm Fraud
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`

fs.writeFileSync("src/app/admin/fraud/page.tsx", newContent, "utf8");
console.log("File written.");
