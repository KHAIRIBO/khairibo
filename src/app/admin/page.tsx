"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  FileText,
  Upload,
  HardDrive,
  Clock,
  ArrowUpRight,
  Plus,
  TrendingUp,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  File,
  Eye,
  Download,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  totalNotes: number;
  pinnedNotes: number;
  totalStorageBytes: number;
  totalStorageFormatted: string;
  storageLimitBytes: number;
  storageLimitFormatted: string;
  storagePercent: number;
  typeBreakdown: {
    image: number;
    document: number;
    video: number;
    audio: number;
    code: number;
    archive: number;
    other: number;
  };
  recentFiles: any[];
  recentNotes: any[];
  recentActivities: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saas/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Failed to load dashboard statistics");
      }
    } catch {
      toast.error("Network error loading statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon size={18} className="text-blue-400" />;
      case "video":
        return <Film size={18} className="text-purple-400" />;
      case "audio":
        return <Music size={18} className="text-pink-400" />;
      case "code":
        return <FileCode size={18} className="text-amber-400" />;
      case "archive":
        return <Archive size={18} className="text-orange-400" />;
      case "document":
      case "pdf":
        return <FileText size={18} className="text-emerald-400" />;
      default:
        return <File size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Top Header Banner with Quick Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b8ff4d]/10 border border-[#b8ff4d]/20 text-[#b8ff4d] text-xs font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#b8ff4d] animate-ping" />
            Live Cloud Control
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">SaaS Cloud Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Manage your personal workspace, persistent files, secure notes, and storage analytics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            href="/admin/notes?action=new"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <FileText size={15} />
            <span>New Note</span>
          </Link>

          <Link
            href="/admin/files?action=upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#b8ff4d] hover:bg-[#a5f03a] text-[#101312] rounded-xl text-xs font-black shadow-md shadow-[#b8ff4d]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload size={15} />
            <span>Upload File</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Key Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Files */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Files</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderOpen size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight">{stats?.totalFiles ?? "—"}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">In {stats?.totalFolders ?? 0} folders</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-blue-400">
            <Link href="/admin/files" className="hover:underline flex items-center gap-1">
              Browse files <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* Card 2: Total Storage Used */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Storage Used</span>
            <div className="p-2.5 rounded-xl bg-[#b8ff4d]/10 text-[#b8ff4d] border border-[#b8ff4d]/20">
              <HardDrive size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight">{stats?.totalStorageFormatted ?? "0 Bytes"}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Of {stats?.storageLimitFormatted ?? "10 GB"} limit</p>
          </div>
          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#b8ff4d] to-[#64d9ff] transition-all duration-500"
                style={{ width: `${Math.max(2, stats?.storagePercent || 0)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Card 3: Notes Stored */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Notes</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight">{stats?.totalNotes ?? "—"}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">{stats?.pinnedNotes ?? 0} pinned notes</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-purple-400">
            <Link href="/admin/notes" className="hover:underline flex items-center gap-1">
              Open editor <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* Card 4: Workspace Health */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database Status</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black tracking-tight text-emerald-400">Online</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">MongoDB Atlas Connected</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-emerald-400">
            <Link href="/admin/workspace" className="hover:underline flex items-center gap-1">
              View workspace <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Storage Distribution & Quick Action Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Storage Breakdown */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Storage Breakdown</h3>
              <p className="text-xs text-slate-400 font-medium">Distribution by file category</p>
            </div>
            <span className="text-xs font-black text-[#b8ff4d] bg-[#b8ff4d]/10 px-2.5 py-1 rounded-lg">
              {stats?.storagePercent || 0}% Used
            </span>
          </div>

          {/* Segmented bar */}
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
            <div className="bg-blue-500 rounded-l-full" style={{ width: "25%" }} title="Images" />
            <div className="bg-emerald-500" style={{ width: "35%" }} title="Documents & PDFs" />
            <div className="bg-purple-500" style={{ width: "15%" }} title="Videos" />
            <div className="bg-amber-500" style={{ width: "15%" }} title="Code & Scripts" />
            <div className="bg-slate-500 rounded-r-full" style={{ width: "10%" }} title="Other" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Images
              </span>
              <p className="text-sm font-black mt-1">25%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Documents
              </span>
              <p className="text-sm font-black mt-1">35%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Videos
              </span>
              <p className="text-sm font-black mt-1">15%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Code
              </span>
              <p className="text-sm font-black mt-1">15%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Other
              </span>
              <p className="text-sm font-black mt-1">10%</p>
            </div>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold tracking-tight mb-1">Quick Launchpad</h3>
            <p className="text-xs text-slate-400 font-medium mb-4">Instant shortcuts for frequent tasks</p>

            <div className="space-y-2">
              <Link
                href="/admin/files?action=upload"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-[#b8ff4d]/10 hover:border-[#b8ff4d]/30 border border-slate-100 dark:border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Upload size={16} className="text-[#b8ff4d]" />
                  <span className="text-xs font-bold">Upload Files & Docs</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/notes?action=new"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-500/10 hover:border-purple-500/30 border border-slate-100 dark:border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-purple-400" />
                  <span className="text-xs font-bold">Compose Rich Note</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/workspace"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-500/10 hover:border-blue-500/30 border border-slate-100 dark:border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={16} className="text-blue-400" />
                  <span className="text-xs font-bold">Manage Workspace Folders</span>
                </div>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Shortcut: Press ⌘K for search</span>
          </div>
        </div>
      </div>

      {/* ── Recent Files & Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Files Table/List */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Recent Files</h3>
              <p className="text-xs text-slate-400 font-medium">Uploaded to your cloud storage</p>
            </div>
            <Link
              href="/admin/files"
              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              View all ({stats?.totalFiles || 0}) <ArrowUpRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-[#b8ff4d] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading files...</p>
            </div>
          ) : !stats?.recentFiles || stats.recentFiles.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FolderOpen size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No files uploaded yet</p>
              <Link
                href="/admin/files?action=upload"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#b8ff4d] hover:underline"
              >
                <Plus size={14} /> Upload your first file
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats.recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate max-w-xs sm:max-w-md">{file.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {file.size} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.url && (
                      <a
                        href={file.url}
                        download={file.name}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    )}
                    <Link
                      href={`/admin/files?preview=${file.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities Timeline */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#11171D] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Recent Activity</h3>
              <p className="text-xs text-slate-400 font-medium">Real-time audit log</p>
            </div>
            <Clock size={16} className="text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {!stats?.recentActivities || stats.recentActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No recent activity recorded.
              </div>
            ) : (
              stats.recentActivities.slice(0, 7).map((act, idx) => (
                <div key={act.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#b8ff4d] mt-1.5 shrink-0 shadow-xs shadow-[#b8ff4d]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{act.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
