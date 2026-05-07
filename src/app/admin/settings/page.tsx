"use client";

import { motion } from "framer-motion";
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Database,
  ArrowRight,
  ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const sections = [
    {
      title: "Account",
      items: [
        { name: "Profile Information", icon: User, desc: "Update your name and photo" },
        { name: "Security & Access", icon: Shield, desc: "Change password and manage access code" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { name: "Notifications", icon: Bell, desc: "Configure admin alerts" },
        { name: "Appearance", icon: Palette, desc: "Dark mode and theme colors" },
        { name: "Language & Region", icon: Globe, desc: "Set your local preferences" },
      ]
    },
    {
      title: "System",
      items: [
        { name: "Database & Sync", icon: Database, desc: "Manage Supabase connection" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure your control center and preferences.</p>
      </div>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">
              {section.title}
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
              {section.items.map((item, j) => (
                <button 
                  key={item.name}
                  className={`w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all group ${
                    j !== section.items.length - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-12">
        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Developer Mode</h3>
            <p className="text-white/60 text-sm font-medium">Access advanced debugging and API logs.</p>
          </div>
          <button className="relative z-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
            <ArrowRight size={20} />
          </button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-32 -translate-y-32"></div>
        </div>
      </div>
    </div>
  );
}
