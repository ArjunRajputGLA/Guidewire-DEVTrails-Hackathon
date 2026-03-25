"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  Activity,
  ShieldAlert,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workers", label: "Workers", icon: Users },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
  { href: "/claims", label: "Claims", icon: ClipboardList },
  { href: "/triggers", label: "Triggers", icon: Activity },
  { href: "/fraud", label: "Fraud Detection", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 z-40 h-screen w-64 flex flex-col"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold gradient-text">GigShield</h1>
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">Admin Panel</p>
        </div>
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-400 shadow-lg shadow-indigo-500/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #ec4899)" }}
          >
            JM
          </div>
          <div>
            <p className="text-xs font-medium text-gray-300">Jatin M.</p>
            <p className="text-[10px] text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
