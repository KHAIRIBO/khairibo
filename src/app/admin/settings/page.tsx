"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Key,
  HardDrive,
  Moon,
  Sun,
  LogOut,
  Laptop,
  Check,
  AlertCircle,
  Save,
  Trash2,
  Lock,
  RefreshCw,
  Mail,
  Sliders,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SaaSSettings {
  id: string;
  theme: "dark" | "light";
  maxStorageBytes: number;
  userName: string;
  userEmail: string;
  userRole: string;
  allowPublicUploads: boolean;
  notifyOnUpload: boolean;
  updatedAt: string;
}

interface ActiveSession {
  token: string;
  isCurrent: boolean;
  ip: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

export default function SettingsPage() {
  const router = useRouter();

  const [settings, setSettings] = useState<SaaSSettings | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Theme
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light">("dark");

  // Storage Stats
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [storageUsedStr, setStorageUsedStr] = useState("0 MB");
  const [totalFiles, setTotalFiles] = useState(0);

  // ── Fetch Settings & Stats ─────────────────────────────────────────────────
  const fetchSettings = async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch("/api/saas/settings"),
        fetch("/api/saas/stats"),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
        setActiveSessions(data.activeSessions || []);
        setProfileName(data.settings.userName || "Khairi Bouzakher");
        setProfileEmail(data.settings.userEmail || "khairibo32@gmail.com");
        setProfileRole(data.settings.userRole || "Super Admin");
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setStorageUsedBytes(stats.totalStorageBytes || 0);
        setStorageUsedStr(stats.totalStorageUsed || "0 MB");
        setTotalFiles(stats.totalFiles || 0);
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const savedTheme = (localStorage.getItem("saas_theme") as "dark" | "light") || "dark";
    setCurrentTheme(savedTheme);
  }, []);

  // ── Save Profile Info ─────────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/saas/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: profileName,
          userEmail: profileEmail,
          userRole: profileRole,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Error saving profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/saas/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Network error changing password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ── Revoke Other Sessions ──────────────────────────────────────────────────
  const handleRevokeOtherSessions = async () => {
    try {
      const res = await fetch("/api/saas/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_sessions" }),
      });

      if (res.ok) {
        toast.success("Revoked all other active sessions");
        fetchSettings();
      } else {
        toast.error("Failed to revoke sessions");
      }
    } catch {
      toast.error("Error revoking sessions");
    }
  };

  // ── Toggle Theme ───────────────────────────────────────────────────────────
  const handleThemeToggle = (newTheme: "dark" | "light") => {
    setCurrentTheme(newTheme);
    localStorage.setItem("saas_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.info(`Theme set to ${newTheme} mode`);
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_token");
    }
    toast.success("Logged out");
    router.push("/");
  };

  // Storage percentage calculation
  const maxStorageBytes = settings?.maxStorageBytes || 5 * 1024 * 1024 * 1024; // 5 GB default
  const storagePercent = Math.min(100, Math.round((storageUsedBytes / maxStorageBytes) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-7 h-7 text-[#b8ff4d]" />
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your administrator profile, access credentials, storage quotas, and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Summary & Actions */}
        <div className="space-y-6">
          {/* Admin Badge Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-[#b8ff4d]/10 border border-[#b8ff4d]/30 text-[#b8ff4d] flex items-center justify-center font-black text-2xl mx-auto shadow-inner">
              {profileName.charAt(0) || "K"}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{profileName}</h3>
              <p className="text-xs text-slate-400">{profileEmail}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#b8ff4d]/15 text-[#b8ff4d]">
                {profileRole}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Dashboard</span>
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Appearance</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleThemeToggle("dark")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  currentTheme === "dark"
                    ? "bg-[#b8ff4d]/10 border-[#b8ff4d] text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Moon className="w-4 h-4 text-[#b8ff4d]" />
                <span>Dark Mode</span>
              </button>

              <button
                onClick={() => handleThemeToggle("light")}
                className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  currentTheme === "light"
                    ? "bg-[#b8ff4d]/10 border-[#b8ff4d] text-slate-900 dark:text-white"
                    : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900"
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* Storage Quota Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#b8ff4d]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage Usage</h4>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{storagePercent}%</span>
            </div>

            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#b8ff4d] to-emerald-400 transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{storageUsedStr} used</span>
              <span>5.0 GB limit</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {totalFiles} files actively stored across your folders.
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Forms & Security Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Information</h3>
                <p className="text-xs text-slate-400">Update your account name and email address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-xl bg-[#b8ff4d] hover:bg-[#a6ec3c] text-black text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Lock className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Master Password</h3>
                <p className="text-xs text-slate-400">
                  Secure your 5-click header access code with a new strong password
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password (6cc4aca9df)"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#b8ff4d]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>

          {/* Active Sessions & Security */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Security & Sessions</h3>
                  <p className="text-xs text-slate-400">
                    Active authenticated tokens and brute-force protection
                  </p>
                </div>
              </div>

              {activeSessions.length > 1 && (
                <button
                  onClick={handleRevokeOtherSessions}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Other Sessions</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {activeSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          Session {session.token}
                        </span>
                        {session.isCurrent && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#b8ff4d]/20 text-[#b8ff4d]">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        IP: {session.ip || "127.0.0.1"} • Created: {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-400">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
