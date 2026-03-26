"use client";
import { workers } from "@/data/mockData";
import { Search, Filter, UserPlus } from "lucide-react";
import { useState } from "react";

export default function WorkersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = workers.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === "active") return "bg-emerald-500/15 text-emerald-400";
    if (s === "inactive") return "bg-gray-500/15 text-gray-400";
    return "bg-red-500/15 text-red-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Partners</h2>
          <p className="text-sm text-gray-400 mt-1">{workers.length} registered workers across 4 cities</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          <UserPlus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search by name or city..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "active", "inactive", "suspended"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Worker", "Platform", "City / Zone", "Tenure", "Avg. Earnings", "Status", "Last Active"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((w, i) => (
              <tr key={w.id} className="border-b border-white/3 hover:bg-white/3 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>
                      {w.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{w.name}</p>
                      <p className="text-xs text-gray-500">{w.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{w.platform}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-white">{w.city}</p>
                  <p className="text-xs text-gray-500">{w.zone}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{w.tenure} months</td>
                <td className="px-6 py-4 text-sm font-medium text-white">₹{w.dailyAvgEarnings}/day</td>
                <td className="px-6 py-4">
                  <span className={`status-badge ${statusColor(w.status)}`}>{w.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{w.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
