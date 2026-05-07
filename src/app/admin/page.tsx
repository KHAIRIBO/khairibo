"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Users, 
  Eye, 
  ArrowUpRight,
  CloudSun,
  ListTodo,
  ExternalLink,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState([
    { name: "Total Views", value: "0", icon: Eye, trend: "+0%", color: "blue" },
    { name: "Notes", value: "0", icon: FileText, trend: "+0%", color: "purple" },
    { name: "Cloud Files", value: "0", icon: TrendingUp, trend: "+0%", color: "emerald" },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchStats();
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    const [visits, notes, files] = await Promise.all([
      supabase.from('page_visits').select('*', { count: 'exact', head: true }),
      supabase.from('notes').select('*', { count: 'exact', head: true }),
      supabase.from('files').select('*', { count: 'exact', head: true }),
    ]);

    setStats([
      { name: "Total Views", value: (visits.count || 0).toLocaleString(), icon: Eye, trend: "+100%", color: "blue" },
      { name: "Notes", value: (notes.count || 0).toLocaleString(), icon: FileText, trend: "Live", color: "purple" },
      { name: "Cloud Files", value: (files.count || 0).toLocaleString(), icon: TrendingUp, trend: "Sync", color: "emerald" },
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Time Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 relative p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group"
        >
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-1000"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">KBO.</span>
            </h1>
            <p className="text-slate-500 font-medium mb-8">System status: Optimal. You have 4 pending tasks today.</p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 text-sm font-bold border border-slate-100">
                <Calendar size={16} className="text-blue-500" />
                {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 text-sm font-bold border border-slate-100">
                <Clock size={16} className="text-purple-500" />
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10 flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
              <CloudSun size={24} />
            </div>
            <span className="text-sm font-bold opacity-60 tracking-widest uppercase">Weather</span>
          </div>
          
          <div className="relative z-10 mt-8">
            <p className="text-5xl font-black mb-2 tracking-tighter">24°C</p>
            <p className="font-bold opacity-80">Partly Cloudy · Tunis, TN</p>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover-lift group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">
                {stat.trend}
                <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{stat.name}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Grid for Tasks & Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Quick Tasks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <ListTodo size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Task Overview</h3>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {[
              { title: "Update portfolio projects", time: "2h left", status: "high" },
              { title: "Review file upload logic", time: "Tomorrow", status: "med" },
              { title: "Design mesh gradients", time: "3 days", status: "low" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === "high" ? "bg-red-400" : task.status === "med" ? "bg-amber-400" : "bg-emerald-400"
                  }`} />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{task.title}</span>
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{task.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <ExternalLink size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Quick Links</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Live Site", url: "/", color: "blue" },
              { name: "Supabase", url: "https://supabase.com", color: "emerald" },
              { name: "Analytics", url: "https://analytics.google.com", color: "orange" },
              { name: "GitHub", url: "https://github.com", color: "slate" },
            ].map((link, i) => (
              <a 
                key={i} 
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all group shadow-sm"
              >
                <span className="font-black text-sm uppercase tracking-widest">{link.name}</span>
                <ArrowUpRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
