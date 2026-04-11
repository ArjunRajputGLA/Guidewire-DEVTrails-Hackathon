"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  User,
  LogOut,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worker/my-policy", label: "My Policy", icon: ShieldCheck },
  { href: "/worker/my-claims", label: "My Claims", icon: ClipboardList },
  { href: "/worker/weekly-payout", label: "Weekly Payout", icon: IndianRupee },
  { href: "/worker/profile", label: "Profile", icon: User },
];

export default function WorkerSidebar({ isExpanded = true, setIsExpanded }: { isExpanded?: boolean, setIsExpanded?: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col ${isExpanded ? "w-64" : "w-16"}`}
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #020617 100%)" }}
    >
      {/* Brand */}
      <div className={`relative flex items-center px-4 py-6 border-b border-white/5 ${isExpanded ? "gap-3" : "justify-center"}`}>
        <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center overflow-hidden bg-white">
          <img src="/favicon.ico" alt="GigShield Logo" className="w-full h-full object-cover" />
        </div>
        {isExpanded && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold" style={{ background: "linear-gradient(135deg, #10b981, #34d399, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>GigShield</h1>
            <p className="text-[10px] text-gray-500 tracking-widest uppercase">Worker Portal</p>
          </div>
        )}
        {setIsExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-3 top-8 bg-[#0f172a] border border-white/10 rounded-full p-1 text-gray-400 hover:text-white z-50 hover:bg-gray-800 transition-colors"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isExpanded ? item.label : undefined}
              className={`flex items-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isExpanded ? "px-4" : "justify-center px-0"
              } ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/5 relative"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              {isActive && isExpanded && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              )}
              {isActive && !isExpanded && (
                <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        <div className={`flex items-center ${isExpanded ? "gap-3 px-3" : "justify-center"}`}>
          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-8 h-8 shrink-0 rounded-full object-cover border border-white/10"
              title={!isExpanded ? user?.name || "Worker" : undefined}
            />
          ) : (
            <div
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
              title={!isExpanded ? user?.name || "Worker" : undefined}
            >
              {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "GW"}
            </div>
          )}
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{user?.name || "Worker"}</p>
              <p className="text-[10px] text-gray-500">Gig Worker</p>
            </div>
          )}
          <button
            onClick={logout}
            className={`p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400 transition-colors ${!isExpanded && "hidden"}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
          </button>
        </div>
        {!isExpanded && (
          <div className="flex justify-center mt-2">
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-red-400" title="Logout">
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
