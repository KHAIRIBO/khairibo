"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Eye, 
  ArrowUpRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  X,
  User as UserIcon,
  Circle,
  FileText,
  MousePointer2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    visits: 0,
    notes: 0,
    files: 0,
    recentVisits: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const [visits, notes, files, recent] = await Promise.all([
        supabase.from('page_visits').select('*', { count: 'exact', head: true }),
        supabase.from('notes').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }),
        supabase.from('page_visits').select('*').order('created_at', { ascending: false }).limit(4)
      ]);

      setStats({
        visits: visits.count || 0,
        notes: notes.count || 0,
        files: files.count || 0,
        recentVisits: recent.data || []
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Top Grid: Files and Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* File Management Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">File Management</h3>
            <button onClick={fetchRealData} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <MoreVertical size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Segmented Progress Bar - Mocking distribution if files > 0 */}
          <div className="mb-12">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span>PDF (0%)</span>
              <span>Images (0%)</span>
              <span className="ml-auto">Other (0%)</span>
            </div>
            <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-100">
              <div className="h-full bg-blue-400 w-[0%]" />
              <div className="h-full bg-indigo-400 w-[0%] border-l-2 border-white" />
              <div className="h-full bg-slate-400 w-[0%] border-l-2 border-white" />
            </div>
          </div>

          {/* Status Boxes */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-2xl font-bold text-slate-900">{stats.files}</span>
              </div>
              <span className="text-xs font-medium text-slate-400">Total Files</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-2xl font-bold text-slate-900">0</span>
              </div>
              <span className="text-xs font-medium text-slate-400">Recent Uploads</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-2xl font-bold text-slate-900">0</span>
              </div>
              <span className="text-xs font-medium text-slate-400">Flagged</span>
            </div>
          </div>

          <div className="flex gap-12 pt-4 border-t border-slate-50">
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.files}</p>
              <p className="text-sm font-medium text-slate-400">Synchronized</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">0</p>
              <p className="text-sm font-medium text-slate-400">Pending Sync</p>
            </div>
          </div>
        </motion.div>

        {/* Status Cards Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Site Traffic */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl">
                <MousePointer2 size={24} />
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ArrowUpRight size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-bold text-slate-900 mb-1">Site Traffic</h4>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stats.visits.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">Total page visits</p>
            </div>
          </motion.div>

          {/* Notes Overview */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-purple-50 text-purple-500 rounded-xl">
                <FileText size={24} />
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <ArrowUpRight size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="mt-8">
              <h4 className="text-lg font-bold text-slate-900 mb-1">Notes Stored</h4>
              <p className="text-4xl font-black text-slate-900 tracking-tight">{stats.notes}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">Active database notes</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Middle Grid: Storage and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Storage Usage Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-xl font-bold">Cloud Storage</h3>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <MoreVertical size={20} className="text-white/60" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-between gap-8 relative z-10">
            {/* Circular Gauge */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-white/10"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={502.4}
                  strokeDashoffset={502.4 * 0.98} // 2% used
                  strokeLinecap="round"
                  className="text-white"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">2%</span>
                <span className="text-[10px] uppercase font-black tracking-widest opacity-60">0 MB / 5 GB</span>
              </div>
            </div>

            {/* Storage Details */}
            <div className="space-y-4 flex-1">
              {[
                { name: "Database Rows", percent: "1%", size: "Active" },
                { name: "Uploaded Files", percent: "0%", size: "0 GB" },
                { name: "System Logs", percent: "1%", size: "Stable" },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Circle size={8} fill="white" className="text-white" />
                    <span className="text-sm font-bold">{item.percent} • {item.size}</span>
                  </div>
                  <p className="text-xs text-white/60">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Activity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ArrowUpRight size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 space-y-6">
            {stats.recentVisits.map((visit, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                    {visit.page_path.charAt(1).toUpperCase() || "H"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Visitor on {visit.page_path}</p>
                    <p className="text-xs text-slate-400">{new Date(visit.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="hidden md:block text-right">
                  <p className="font-bold text-slate-900">Public Access</p>
                  <p className="text-xs text-slate-400">Success</p>
                </div>

                <div className="px-4 py-2 bg-slate-50 rounded-xl text-slate-600 text-xs font-bold border border-slate-100">
                  Guest
                </div>
              </div>
            ))}
            
            {stats.recentVisits.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <UserIcon size={32} />
                </div>
                <p className="font-medium">No recent activity found</p>
              </div>
            )}
          </div>

          {/* Possible Clients Banner */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Real-time monitoring active</p>
                <p className="text-xs text-slate-400">Activity is recorded as users browse your site.</p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
