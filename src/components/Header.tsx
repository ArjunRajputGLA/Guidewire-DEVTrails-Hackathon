"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, Search, LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/workers": "Workers",
  "/admin/policies": "Policies",
  "/admin/claims": "Claims",
  "/admin/triggers": "Trigger Monitoring",
  "/admin/fraud": "Fraud Detection",
  "/admin/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = pageTitles[pathname] || "GigShield";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-white/5"
      style={{ background: "rgba(3, 7, 18, 0.8)", backdropFilter: "blur(12px)" }}>
      <h2 className="text-xl font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-56 pl-10 pr-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
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
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all"
          style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}>
          {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "AD"}
        </div>
      </div>
    </header>
  );
}
