"use client";
import { useState, useRef } from "react";
import { Bell, Globe, Lock, Palette, Server, User, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, updateProfilePic } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const sections = [
    {
      icon: User, title: "Profile", description: "Manage your admin profile and preferences",
      fields: [
        { label: "Email", value: user?.email || "jatin@gigshield.in", type: "email", readonly: true },
        { label: "Role", value: user?.role === "admin" ? "Super Admin" : "Worker", type: "text", readonly: true },
      ],
    },
    {
      icon: Bell, title: "Notifications", description: "Configure alert and notification preferences",
      fields: [
        { label: "Email Notifications", value: true, type: "toggle" },
        { label: "Push Notifications", value: true, type: "toggle" },
        { label: "Fraud Alert SMS", value: false, type: "toggle" },
      ],
    },
    {
      icon: Globe, title: "API Integrations", description: "Manage external service connections",
      fields: [
        { label: "OpenWeatherMap API Key", value: "owm_••••••••k9x2", type: "password" },
        { label: "CPCB AQI Endpoint", value: "https://api.cpcb.gov.in/v2", type: "url" },
        { label: "Razorpay Test Key", value: "rzp_test_••••••••", type: "password" },
      ],
    },
    {
      icon: Server, title: "System", description: "Application and platform settings",
      fields: [
        { label: "Trigger Check Interval", value: "30 minutes", type: "text" },
        { label: "Auto-Approve Threshold", value: "Score < 60", type: "text" },
        { label: "Max Weekly Payout Cap", value: "₹4,000", type: "text" },
      ],
    },
  ];

  return (
    <div className="flex justify-center">
      <div className="space-y-6 animate-fade-in w-full max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your GigShield admin configuration</p>
        </div>

        {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="glass-card p-6"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-gray-500">{section.description}</p>
              </div>
            </div>

            {section.title === "Profile" && (
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/30 bg-white/5 flex items-center justify-center">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white/50">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-medium text-white mb-2">Profile Picture</p>
                  <p className="text-xs text-gray-400 max-w-sm mb-3">Upload a new avatar. Larger images will be resized automatically. Maximum upload size is 2MB.</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                    >
                      Update
                    </button>
                    {user?.profilePic && (
                      <button 
                        onClick={() => updateProfilePic('')}
                        className="text-xs font-medium px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">{field.label}</label>
                  {field.type === "toggle" ? (
                    <button className={`w-11 h-6 rounded-full relative transition-colors ${
                      field.value ? "bg-indigo-500" : "bg-gray-700"
                    }`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        field.value ? "left-6" : "left-1"
                      }`} />
                    </button>
                  ) : (
                    <input
                      type={field.type === "password" ? "password" : "text"}
                      defaultValue={String(field.value)}
                      readOnly={(field as any).readonly}
                      className={`w-72 px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all ${(field as any).readonly ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Save */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
          Save Changes
        </button>
      </div>
    </div>
    </div>
  );
}
