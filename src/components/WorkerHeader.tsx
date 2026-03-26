"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/worker/dashboard": "Dashboard",
  "/worker/my-policy": "My Policy",
  "/worker/my-claims": "My Claims",
  "/worker/profile": "Profile",
};

export default function WorkerHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = pageTitles[pathname] || "GigShield";

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-white/5"
      style={{ background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(12px)" }}
    >
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500">Welcome back, {user?.name?.split(" ")[0] || "Worker"}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* User */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
        >
          {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GW"}
        </div>
      </div>
    </header>
  );
}
