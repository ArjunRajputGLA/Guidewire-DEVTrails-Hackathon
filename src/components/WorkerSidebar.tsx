"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  User,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worker/my-policy", label: "My Policy", icon: ShieldCheck },
  { href: "/worker/my-claims", label: "My Claims", icon: ClipboardList },
  { href: "/worker/profile", label: "Profile", icon: User },
];

interface WorkerSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function WorkerSidebar({ isCollapsed, setIsCollapsed }: WorkerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #020617 100%)" }}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-6 py-6 border-b border-white/5 relative ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold" style={{ background: "linear-gradient(135deg, #10b981, #34d399, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>GigShield</h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">Worker Portal</p>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-slate-800 text-white rounded-full p-1 shadow-lg border border-slate-700 z-50 hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isCollapsed ? 'justify-center px-0' : ''} ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center flex-col px-0' : 'px-3'}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
          >
            {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GW"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{user?.name || "Worker"}</p>
              <p className="text-[10px] text-gray-500">Gig Worker</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
