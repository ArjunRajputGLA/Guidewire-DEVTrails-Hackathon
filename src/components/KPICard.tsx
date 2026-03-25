import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: string;
}

export default function KPICard({ title, value, change, changeType = "neutral", icon: Icon, gradient }: KPICardProps) {
  const changeColors = {
    positive: "text-emerald-400",
    negative: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <div className="glass-card shimmer-border p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: gradient }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
