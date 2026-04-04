"use client";
import { useState, useRef } from "react";
import { Bell, Globe, Lock, Palette, Server, User, Camera, Save, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, updateProfilePic } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateProfilePic(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your admin profile and preferences",
      accentColor: "#6366f1",
      fields: [
        { label: "Email", value: user?.email || "jatin@gigshield.in", type: "email", readonly: true },
        { label: "Role", value: user?.role === "admin" ? "Super Admin" : "Worker", type: "text", readonly: true },
      ],
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alert and notification preferences",
      accentColor: "#f59e0b",
      fields: [
        { label: "Email Notifications", value: true, type: "toggle" },
        { label: "Push Notifications", value: true, type: "toggle" },
        { label: "Fraud Alert SMS", value: false, type: "toggle" },
      ],
    },
    {
      icon: Globe,
      title: "API Integrations",
      description: "Manage external service connections",
      accentColor: "#22c55e",
      fields: [
        { label: "OpenWeatherMap API Key", value: "owm_••••••••k9x2", type: "password" },
        { label: "CPCB AQI Endpoint", value: "https://api.cpcb.gov.in/v2", type: "url" },
        { label: "Razorpay Test Key", value: "rzp_test_••••••••", type: "password" },
      ],
    },
    {
      icon: Server,
      title: "System",
      description: "Application and platform settings",
      accentColor: "#8b5cf6",
      fields: [
        { label: "Trigger Check Interval", value: "30 minutes", type: "text" },
        { label: "Auto-Approve Threshold", value: "Score < 60", type: "text" },
        { label: "Max Weekly Payout Cap", value: "₹4,000", type: "text" },
      ],
    },
  ];

  return (
    <div className="flex justify-center">
      <div className="space-y-6 w-full max-w-3xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          </div>
          <p className="text-sm text-gray-500 ml-11">Manage your GigShield admin configuration</p>
        </div>

        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.11] transition-all duration-200 overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.05]">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{
                    background: `${section.accentColor}15`,
                    borderColor: `${section.accentColor}30`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: section.accentColor }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                  <p className="text-xs text-gray-600">{section.description}</p>
                </div>
              </div>

              <div className="p-6">
                {/* Profile Avatar Upload */}
                {section.title === "Profile" && (
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/[0.05]">
                    <div
                      className="relative group cursor-pointer flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500/25 bg-indigo-500/10 flex items-center justify-center transition-all duration-200 group-hover:border-indigo-500/50">
                        {user?.profilePic ? (
                          <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-indigo-400/60">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mb-1">Profile Picture</p>
                      <p className="text-xs text-gray-600 max-w-xs mb-4 leading-relaxed">
                        Upload a new avatar. Max 2MB. Larger images are resized automatically.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all duration-200 border border-indigo-500/20 hover:border-indigo-500/35"
                        >
                          Update Photo
                        </button>
                        {user?.profilePic && (
                          <button
                            onClick={() => updateProfilePic("")}
                            className="text-xs font-semibold px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 border border-red-500/20"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fields */}
                <div className="space-y-5">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-sm text-gray-300 font-medium">{field.label}</label>
                        {(field as any).readonly && (
                          <span className="ml-2 text-[10px] text-gray-700 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                            readonly
                          </span>
                        )}
                      </div>
                      {field.type === "toggle" ? (
                        <button
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                            field.value ? "bg-indigo-500" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
                              field.value ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <input
                          type={field.type === "password" ? "password" : "text"}
                          defaultValue={String(field.value)}
                          readOnly={(field as any).readonly}
                          className={`w-72 px-4 py-2.5 rounded-xl text-sm bg-white/[0.04] border border-white/[0.08] text-gray-300 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all duration-200 ${
                            (field as any).readonly ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Save Button */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
              saved ? "bg-emerald-500 shadow-emerald-500/20" : "shadow-indigo-500/20"
            }`}
            style={!saved ? { background: "linear-gradient(135deg, #6366f1, #818cf8)" } : {}}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}