"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";

export default function AIAnalytics() {
  const [stats, setStats] = useState({
    totalQueries: 0,
    todayQueries: 0,
    recentMessages: [] as any[],
    chartData: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_usage")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayQueries = data.filter((q: any) => new Date(q.created_at) >= today).length;

      // Group by day for chart
      const grouped = data.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.keys(grouped).map(date => ({
        date,
        queries: grouped[date]
      })).reverse().slice(-7);

      setStats({
        totalQueries: data.length,
        todayQueries,
        recentMessages: data.slice(0, 10),
        chartData
      });
    } catch (err) {
      console.error("Error fetching AI stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Bot size={28} />
            </div>
            AI Intelligence Report
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time performance and usage metrics for KBO AI.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <Clock size={18} />
          Refresh Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Interactions", value: stats.totalQueries, icon: MessageSquare, color: "blue", trend: "+12%" },
          { label: "Queries Today", value: stats.todayQueries, icon: TrendingUp, color: "emerald", trend: "+5%" },
          { label: "Avg. Daily Usage", value: Math.round(stats.totalQueries / Math.max(1, stats.chartData.length)), icon: Users, color: "purple", trend: "Stable" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl`}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{item.trend}</span>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{item.label}</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">{item.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Interaction Volume</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-black uppercase text-slate-400">Last 7 Days</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Live Query Stream</h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Realtime</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {stats.recentMessages.length > 0 ? (
              stats.recentMessages.map((msg, i) => (
                <div key={i} className="group p-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl transition-all border border-slate-100 hover:border-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageSquare size={12} className="group-hover:text-white text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase opacity-50 tracking-wider">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <p className="text-sm font-bold line-clamp-2 leading-relaxed">{msg.message}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <MessageSquare size={40} className="mb-4 opacity-20" />
                <p className="font-bold">No queries yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
