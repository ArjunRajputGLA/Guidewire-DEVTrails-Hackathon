"use client";
import { useAuth } from "@/context/AuthContext";
import { claims } from "@/data/mockData";
import { ClipboardList } from "lucide-react";

export default function MyClaimsPage() {
  const { user } = useAuth();
  const workerClaims = claims.filter(
    (c) => c.workerName === user?.name || c.workerId === "W001"
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">My Claims</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your submitted claims</p>
      </div>

      {workerClaims.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Claims Yet</h3>
          <p className="text-gray-500 text-sm">You haven&apos;t filed any claims yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workerClaims.map((claim, index) => (
            <div
              key={claim.id}
              className="glass-card p-5 animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{claim.triggerIcon}</span>
                  <div>
                    <p className="text-base font-semibold text-white">{claim.triggerType}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Claim {claim.id} · Filed on {claim.filedAt}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">₹{claim.amount}</p>
                  <span
                    className={`status-badge text-[10px] ${
                      claim.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : claim.status === "auto-approved"
                        ? "bg-blue-500/15 text-blue-400"
                        : claim.status === "pending-review"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {claim.status.replace("-", " ")}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-2">
                {["Filed", "Reviewed", "Approved", "Paid"].map((step, i) => {
                  const stepsCompleted =
                    claim.status === "paid" ? 4 :
                    claim.status === "auto-approved" ? 3 :
                    claim.status === "pending-review" ? 1 :
                    claim.status === "rejected" ? 2 : 1;
                  const isCompleted = i < stepsCompleted;
                  const isRejected = claim.status === "rejected" && i === 1;
                  return (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        isRejected ? "bg-red-400" :
                        isCompleted ? "bg-emerald-400" : "bg-gray-700"
                      }`} />
                      <span className={`text-[10px] ${
                        isRejected ? "text-red-400" :
                        isCompleted ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {isRejected ? "Rejected" : step}
                      </span>
                      {i < 3 && (
                        <div className={`flex-1 h-px ${isCompleted ? "bg-emerald-500/30" : "bg-gray-800"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
