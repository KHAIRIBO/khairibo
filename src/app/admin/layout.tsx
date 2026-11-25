"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Mail,
  Bot,
  Sun,
  Moon,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Toaster, toast } from "sonner";

interface SearchResultItem {
  id: string;
  type: "file" | "note" | "folder";
  title: string;
  subtitle?: string;
  href: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginCode, setLoginCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: "Khairi Bouzakher", role: "Super Admin", email: "khairibo32@gmail.com" });

  const router = useRouter();
  const pathname = usePathname();

  // â”€â”€ Authentication Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (res.ok && data.authenticated) {
          setIsAuthorized(true);
          if (data.user) setAdminUser(data.user);
          return;
        }
        const localToken = typeof window !== "undefined"
          ? localStorage.getItem("admin_token")
          : null;
        if (localToken) {
          const checkRes = await fetch("/api/auth/session", {
            headers: { Authorization: "Bearer " + localToken },
          });
          const checkData = await checkRes.json();
          if (checkRes.ok && checkData.authenticated) {
            setIsAuthorized(true);
            if (checkData.user) setAdminUser(checkData.user);
            return;
          }
        }
      } catch {
        setIsAuthorized(false);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    void verifyAuth();
  }, [router]);

  // â”€â”€ Theme Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const savedTheme = localStorage.getItem("saas_theme") as "dark" | "light" | null;
    const initial = savedTheme || "dark";
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("saas_theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.info(`Theme changed to ${next} mode`);
  };

  // â”€â”€ Keyboard Shortcut for Global Search (Cmd/Ctrl + K) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // â”€â”€ Global Search Execution â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const runGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/saas/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const items: SearchResultItem[] = [];

        data.files?.forEach((f: any) => {
          items.push({
            id: f.id,
            type: "file",
            title: f.name,
            subtitle: `${f.type.toUpperCase()} â€¢ ${f.size}`,
            href: `/admin/files?search=${encodeURIComponent(f.name)}`,
          });
        });

        data.notes?.forEach((n: any) => {
          items.push({
            id: n.id,
            type: "note",
            title: n.title,
            subtitle: `Note in ${n.category}`,
            href: `/admin/notes?id=${encodeURIComponent(n.id)}`,
          });
        });

        data.folders?.forEach((fld: any) => {
          items.push({
            id: fld.id,
            type: "folder",
            title: fld.name,
            subtitle: "Folder",
            href: `/admin/files?folderId=${encodeURIComponent(fld.id)}`,
          });
        });

        setSearchResults(items);
      }
    } catch {
      /* ignore */
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) runGlobalSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, runGlobalSearch]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_session");
      localStorage.removeItem("admin_token");
    }
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginCode.trim() || isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || "Authentication failed");
        return;
      }

      localStorage.setItem("admin_session", "active");
      localStorage.setItem("admin_token", data.token);
      setIsAuthorized(true);
      setLoginCode("");
    } catch {
      setLoginError("Unable to connect to the authentication server");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin", badge: null },
    { name: "Files", icon: FolderOpen, href: "/admin/files", badge: null },
    { name: "Notes", icon: FileText, href: "/admin/notes", badge: null },
    { name: "Workspace", icon: Briefcase, href: "/admin/workspace", badge: "Pro" },
    { name: "Inbox", icon: Mail, href: "/admin/inbox", badge: null },
    { name: "AI Reports", icon: Bot, href: "/admin/ai", badge: null },
    { name: "Settings", icon: Settings, href: "/admin/settings", badge: null },
  ];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0F12] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#101312] border border-[#b8ff4d]/30 flex items-center justify-center text-[#b8ff4d] animate-pulse">
            <span className="font-black text-xl">K</span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Securing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#090D10] px-4 font-sans text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#11171D] p-7 shadow-2xl"
        >
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-400">Admin access</p>
            <h1 className="mt-2 text-2xl font-black">Sign in to Live</h1>
          </div>
          <input
            type="password"
            value={loginCode}
            onChange={(event) => setLoginCode(event.target.value)}
            placeholder="Enter access code"
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-violet-500"
          />
          {loginError && <p className="mt-3 text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-black disabled:opacity-60"
          >
            {isLoggingIn ? "Signing in..." : "Open admin dashboard"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans ${theme === "dark" ? "bg-[#090D10] text-[#E6EDF3]" : "bg-[#F8FAFC] text-slate-900"}`}>
      <Toaster richColors position="top-right" theme={theme} />

      {/* â”€â”€ Global Search Command Palette Modal (Cmd + K) â”€â”€ */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden ${
                theme === "dark" ? "bg-[#11171D] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search files, notes, folders... (ESC to close)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"
                />
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-[#b8ff4d] rounded-full animate-spin" />
                ) : (
                  <kbd className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-400 border border-slate-200 dark:border-slate-700">
                    ESC
                  </kbd>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">
                    {searchQuery ? "No matching files, notes or folders found." : "Start typing to search your SaaS workspace..."}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-[#b8ff4d]">
                            {item.type === "file" ? <FolderOpen size={16} /> : item.type === "note" ? <FileText size={16} /> : <Briefcase size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold truncate">{item.title}</p>
                            <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Desktop & Tablet Sidebar â”€â”€ */}
      <aside
        className={`hidden lg:flex flex-col border-r transition-all duration-300 z-30 select-none ${
          isSidebarOpen ? "w-64" : "w-20"
        } ${theme === "dark" ? "bg-[#0E1318] border-slate-800/80" : "bg-white border-slate-200"}`}
      >
        {/* Brand header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/60">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#161D22] border border-slate-700/60 rounded-xl flex items-center justify-center text-[#b8ff4d] font-black text-lg shadow-md group-hover:border-[#b8ff4d]/40 transition-colors">
              K
            </div>
            {isSidebarOpen && (
              <div>
                <span className="font-extrabold text-sm tracking-tight block">KBO SaaS</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Control Center</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition-all group ${
                  isActive
                    ? "bg-[#b8ff4d] text-[#101312] shadow-sm shadow-[#b8ff4d]/20"
                    : theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <item.icon size={19} className={isActive ? "text-[#101312]" : "text-slate-400 group-hover:text-inherit"} />
                {isSidebarOpen && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}
                {isSidebarOpen && item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                      isActive ? "bg-black/20 text-black" : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions & user badge */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/60 space-y-2">
          {/* Quick theme toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              theme === "dark" ? "text-slate-400 hover:text-white hover:bg-slate-800/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-blue-500" />}
            {isSidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-[#b8ff4d] text-[#101312] font-black flex items-center justify-center text-xs shrink-0">
              KB
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{adminUser.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser.email}</p>
              </div>
            )}
            {isSidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* â”€â”€ Mobile Drawer Sidebar â”€â”€ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25 }}
              className={`relative w-72 h-full z-10 flex flex-col ${
                theme === "dark" ? "bg-[#0E1318] border-r border-slate-800" : "bg-white border-r border-slate-200"
              }`}
            >
              <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#161D22] border border-slate-700/60 rounded-xl flex items-center justify-center text-[#b8ff4d] font-black">
                    K
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block">KBO SaaS</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Control Center</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#b8ff4d] text-[#101312]"
                          : theme === "dark"
                          ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <item.icon size={19} />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/60 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    {theme === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-500" />}
                    Theme
                  </span>
                  <span className="uppercase text-[10px] font-black">{theme}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Main SaaS Content Shell â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header
          className={`h-16 px-4 sm:px-8 border-b flex items-center justify-between sticky top-0 z-20 backdrop-blur-md ${
            theme === "dark" ? "bg-[#090D10]/80 border-slate-800/80" : "bg-white/80 border-slate-200"
          }`}
        >
          {/* Left: Mobile hamburger & search button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-inherit rounded-xl"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 text-slate-400 hover:text-inherit rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Quick search input trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search files, notes, folders...</span>
              <kbd className="hidden md:inline-flex px-1.5 py-0.5 text-[9px] bg-slate-200 dark:bg-slate-800 rounded font-mono text-slate-400">
                âŒ˜K
              </kbd>
            </button>
          </div>

          {/* Right: Quick actions, notifications, user */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/files?action=upload"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#b8ff4d] text-[#101312] rounded-xl text-xs font-black shadow-xs hover:bg-[#a6ee3f] transition-all"
            >
              <Plus size={14} />
              <span>Upload</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-inherit rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-blue-500" />}
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Link href="/" target="_blank" className="text-xs font-bold text-[#b8ff4d] hover:underline hidden md:block">
              View Website â†—
            </Link>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b8ff4d] to-[#64d9ff] p-0.5">
                <div className="w-full h-full bg-[#101312] rounded-[10px] flex items-center justify-center font-black text-xs text-[#b8ff4d]">
                  KB
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
