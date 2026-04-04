"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/worker/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="auth-page">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080810]">
      {/* Ambient background elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full bg-blue-600/5 blur-[120px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? "ml-64" : "ml-16"
        } flex flex-col relative z-10`}
      >
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}