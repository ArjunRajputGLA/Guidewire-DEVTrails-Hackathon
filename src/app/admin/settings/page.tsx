"use client";
import { Bell, Globe, Server, User } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const sections = [
    {
      icon: User, title: "Profile", description: "Manage your admin profile and preferences",
      fields: [
        { label: "Full Name", value: "Jatin M.", type: "text" },
        { label: "Email", value: "jatin@gigshield.in", type: "email" },
        { label: "Role", value: "Super Admin", type: "text" },
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
      className="space-y-6 max-w-4xl"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your GigShield admin configuration</p>
      </motion.div>

      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <motion.div 
            key={section.title} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
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

            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.label} className="flex items-center justify-between">
                  <label className="text-sm text-gray-400">{field.label}</label>
                  {field.type === "toggle" ? (
                    <button 
                      type="button"
                      aria-label={`Toggle ${field.label}`}
                      className={`w-11 h-6 rounded-full relative transition-colors ${
                      field.value ? "bg-indigo-500" : "bg-gray-700"
                    }`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        field.value ? "left-6" : "left-1"
                      }`} />
                    </button>
                  ) : (
                    <input
                      type="text"
                      aria-label={field.label}
                      defaultValue={String(field.value)}
                      className="w-72 px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Save */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-end">
        <button type="button" className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>  
          Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
}
