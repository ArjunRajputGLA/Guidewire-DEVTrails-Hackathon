"use client";
import { useAuth } from "@/context/AuthContext";
import { workers } from "@/data/mockData";
import { User, Phone, MapPin, Briefcase, Calendar, IndianRupee } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const workerData = workers.find(
    (w) => w.name === user?.name || w.id === "W001"
  );

  const profileItems = workerData
    ? [
        { icon: Phone, label: "Phone", value: workerData.phone },
        { icon: Briefcase, label: "Platform", value: workerData.platform },
        { icon: MapPin, label: "City", value: `${workerData.city} — ${workerData.zone}` },
        { icon: Calendar, label: "Tenure", value: `${workerData.tenure} months` },
        { icon: IndianRupee, label: "Avg Daily Earnings", value: `₹${workerData.dailyAvgEarnings}` },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card p-8 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
        >
          {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GW"}
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name || "Worker"}</h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <span className="mt-2 status-badge bg-emerald-500/15 text-emerald-400 text-[10px]">
          {workerData?.status || "active"}
        </span>
      </div>

      {/* Profile Details */}
      {workerData && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Details
          </h3>
          <div className="space-y-3">
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-400 w-36">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
