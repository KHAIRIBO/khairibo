import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
// Removed framer-motion and lucide-react to avoid runtime ESM incompatibilities in CDN imports.
// Replaced with native elements and simple emoji/SVG fallbacks.

const html = htm.bind(React.createElement);

// --- Typewriter Component ---
const Typewriter = ({ texts = [], speed = 100, pause = 2000 }) => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentFullText = texts[index];

    if (!isDeleting && text === currentFullText) {
      timer = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
    } else {
      timer = setTimeout(() => {
        setText(currentFullText.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? speed / 2 : speed);
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, index, texts, speed, pause]);

  return html`<span className="inline-block border-r-2 border-accentBlue pr-1 animate-pulse">${text || "\u00A0"}</span>`;
};

// --- Main App Component ---
function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [repos, setRepos] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const googleButtonDesktopRef = useRef(null);
  const googleButtonMobileRef = useRef(null);
  const showGoogleSignIn = true;
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch GitHub Repos
    fetch("https://api.github.com/users/KHAIRIBO/repos?sort=updated&per_page=6")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data.filter(r => r.name !== "khairibo" && r.name !== "-"));
        }
      })
      .catch(e => console.error("GitHub fetch failed", e));
  }, []);

  useEffect(() => {
    fetch("/api/config", { credentials: "include" })
      .then((res) => res.json())
      .then((config) => {
        if (config?.googleClientId) {
          setGoogleClientId(config.googleClientId);
        }
      })
      .catch((err) => console.error("Config fetch failed", err));
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch("/api/user", { credentials: "include" });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const payload = await response.json();
      setUser(payload.user || null);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadCurrentUser().finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!googleClientId || user) {
      return;
    }

    const onCredential = async (response) => {
      setAuthError("");
      try {
        const authResponse = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken: response.credential }),
        });

        if (!authResponse.ok) {
          throw new Error("Google login failed");
        }

        await loadCurrentUser();
        scrollTo("dashboard");
      } catch (err) {
        setAuthError("Google login failed. Please try again.");
      }
    };

    const renderTargetRefs = [googleButtonDesktopRef, googleButtonMobileRef];

    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: onCredential,
      });
      renderTargetRefs.forEach((targetRef) => {
        if (!targetRef.current) return;
        targetRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(targetRef.current, {
          theme: darkMode ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: "signin_with",
        });
      });
    }
  }, [googleClientId, user, darkMode]);

  // Handle Loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
      document.getElementById('loading-screen')?.remove();
    }, 1500);
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      setUser(null);
      setAuthError("");
      scrollTo("home");
    } catch (err) {
      setAuthError("Logout failed. Please refresh the page.");
    }
  };

  // Admin access via logo triple-click: require 3 clicks within timeframe, then prompt once for password
  const logoClickRef = useRef({ count: 0, timer: null });
  const handleLogoClick = (e) => {
    e.preventDefault();
    const state = logoClickRef.current;
    state.count += 1;
    if (state.timer) clearTimeout(state.timer);
    state.timer = setTimeout(() => {
      state.count = 0;
    }, 1500); // resets after 1.5s of inactivity

    if (state.count >= 3) {
      state.count = 0;
      if (state.timer) { clearTimeout(state.timer); state.timer = null; }
      const ADMIN_PASSWORD = "6cc4aca9df";
      const val = window.prompt("Admin access required: Enter password");
      if (val === null) return; // cancelled
      if (val === ADMIN_PASSWORD) {
        window.location.href = "/admin.html";
        return;
      }
      window.alert("Access denied: invalid password.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "File upload failed");
      }

      const result = await response.json();
      setUploadedFiles((prev) => [result.file, ...prev]);
      setUploadMessage(`✅ ${file.name} uploaded successfully to Google Drive!`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadMessage(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    // Try to click the built-in rendered button if present
    try {
      const desktopContainer = googleButtonDesktopRef.current;
      if (desktopContainer) {
        const btn = desktopContainer.querySelector && desktopContainer.querySelector('button');
        if (btn) {
          btn.click();
          return;
        }
      }
      // Fallback: prompt the One Tap / credential flow
      if (window.google && window.google.accounts && window.google.accounts.id && window.google.accounts.id.prompt) {
        window.google.accounts.id.prompt();
        return;
      }
    } catch (err) {
      console.warn('Google Sign-In trigger failed', err);
    }
    // Last resort: open Google login page (not ideal)
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&response_type=token&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(window.location.origin)}`;
  };

  // Smooth Scroll
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const navItems = user ? ["Home", "Projects", "Skills", "About", "Dashboard", "Contact"] : ["Home", "Projects", "Skills", "About", "Contact"];

  if (loading) {
    return html`
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-lightBg dark:bg-darkBg transition-colors duration-500">
        <div className="w-12 h-12 border-4 border-accentBlue/20 border-t-accentBlue rounded-full animate-spin"></div>
      </div>
    `;
  }

  return html`
    <div className="relative w-full min-h-screen font-sans selection:bg-accentBlue selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-accentBlue/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accentPurple/20 rounded-full blur-[120px] animate-blob" style=${{ animationDelay: "2s" }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <a 
            href="#" 
            onClick=${(e) => { e.preventDefault(); handleLogoClick(e); }}
            className="text-2xl font-display font-bold tracking-tighter"
          >
            KBO<span className="text-accentBlue">.</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            ${navItems.map((item) => html`
              <a
                key=${item}
                href=${`#${item.toLowerCase()}`}
                onClick=${(e) => { e.preventDefault(); scrollTo(item.toLowerCase()); }}
                className=${`text-sm font-medium transition-colors hover:text-accentBlue ${activeSection === item.toLowerCase() ? 'text-accentBlue' : 'text-gray-600 dark:text-gray-300'}`}
              >
                ${item}
              </a>
            `)}
          </div>

          <div className="flex items-center gap-4">
            ${!user && !authLoading ? html`
              <div className="hidden md:block">
                <button
                  onClick=${triggerGoogleSignIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-sm border hover:shadow-md transition-shadow"
                  style=${{ boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                >
                  <span className="w-5 h-5 inline-block">🔑</span>
                  Sign in with Google
                </button>
                ${showGoogleSignIn ? html`<div ref=${googleButtonDesktopRef} style=${{ display: "none" }}></div>` : null}
              </div>
            ` : null}

            ${user ? html`
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick=${() => scrollTo('dashboard')}
                  className="px-4 py-2 rounded-full glass-card text-sm font-semibold hover:text-accentBlue"
                >
                  Dashboard
                </button>
                <button
                  onClick=${handleLogout}
                  className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold"
                >
                  Logout
                </button>
              </div>
            ` : null}

            <button
              onClick=${toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center glass-card hover:scale-110 transition-transform"
              aria-label="Toggle Dark Mode"
            >
              ${darkMode ? html`<span className="text-yellow-400">☀️</span>` : html`<span className="text-gray-800">🌙</span>`}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <div
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium mb-8 text-accentPurple dark:text-accentBlue">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentBlue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accentBlue"></span>
              </span>
              Available for new opportunities
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
              Hi, I'm <br className="md:hidden" />
              <span className="text-gradient">Khairi Bouzakher</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 h-10">
              <${Typewriter} texts=${["Full Stack Developer", "AI Enthusiast", "Creative Problem Solver"]} speed=${80} pause=${2000} />
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              ${!user && !authLoading ? html`
                <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
                  <button onClick=${triggerGoogleSignIn} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-sm border hover:shadow-md transition-shadow w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                      <path fill="#EA4335" d="M24 9.5c3.9 0 7.2 1.3 9.6 3.6l7.2-7.2C36.6 2.6 30.7 0 24 0 14.7 0 6.9 5.2 2.8 12.7l8.4 6.5C13.6 14 18.4 9.5 24 9.5z"/>
                      <path fill="#34A853" d="M46.5 24c0-1.6-.1-3.2-.4-4.7H24v8.9h12.8c-.6 3.2-2.6 5.9-5.5 7.7l8.5 6.6C43.9 37.9 46.5 31.5 46.5 24z"/>
                      <path fill="#4A90E2" d="M10.9 29.2A14.8 14.8 0 0 1 9 24c0-1.3.2-2.6.5-3.8L2.1 13.7C.8 16.1 0 19 0 22.2 0 27.2 2.6 31.9 6.7 35.6l4.2-6.4z"/>
                      <path fill="#FBBC05" d="M24 48c6.7 0 12.6-2.5 17.1-6.8l-8.5-6.6C31.1 36.6 27.9 37.9 24 37.9c-5.6 0-10.4-4.5-12.8-10.1l-8.4 6.5C6.9 42.8 14.7 48 24 48z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  ${showGoogleSignIn ? html`<div ref=${googleButtonMobileRef} style=${{ display: "none" }}></div>` : null}
                </div>
              ` : null}

              <button 
                onClick=${() => scrollTo('projects')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                View Projects →
              </button>
              ${user ? html`
                <button
                  onClick=${() => scrollTo('dashboard')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-accentBlue text-white font-semibold hover:scale-105 transition-transform"
                >
                  Open Dashboard
                </button>
              ` : null}
              <button 
                onClick=${() => scrollTo('contact')}
                className="w-full sm:w-auto px-8 py-4 rounded-full glass-card font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Contact Me
              </button>
            </div>

            ${authError ? html`<p className="mt-6 text-sm text-red-500">${authError}</p>` : null}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Selected Work</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">A showcase of my recent projects, blending modern web technologies with clean, intuitive design.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            ${repos.length > 0 ? repos.map((repo, idx) => html`
              <div
                key=${repo.id}
                className="group glass-card rounded-3xl overflow-hidden glow-hover p-8 flex flex-col"
              >
                <div className="w-14 h-14 bg-accentBlue/10 rounded-2xl flex items-center justify-center mb-6 text-accentBlue group-hover:bg-accentBlue group-hover:text-white transition-all duration-500">
                  <span>🐙</span>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  ${repo.language ? html`<span className="px-3 py-1 text-xs font-semibold rounded-full bg-accentPurple/10 text-accentPurple border border-accentPurple/20 uppercase tracking-wider">${repo.language}</span>` : null}
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">⭐ ${repo.stargazers_count}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">${repo.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 flex-grow line-clamp-3">${repo.description || "A project built by Khairi Bouzakher. Click below to explore the codebase."}</p>
                <a href=${repo.html_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold hover:text-accentBlue transition-colors mt-auto">
                  View Repository ↗
                </a>
              </div>
            `) : html`<div className="col-span-full py-20 text-center text-gray-500 font-medium animate-pulse">Loading GitHub Projects...</div>`}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Tech Arsenal</h2>
            <p className="text-gray-600 dark:text-gray-400">Tools and technologies I use to build robust applications.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            ${[
              { name: "React / Next.js", icon: "code", color: "text-blue-500" },
              { name: "Node.js", icon: "terminal", color: "text-green-500" },
              { name: "Python / AI", icon: "brain", color: "text-yellow-500" },
              { name: "Tailwind CSS", icon: "style", color: "text-cyan-500" },
            ].map((skill, i) => html`
              <div key=${skill.name} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white dark:bg-black/50 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🔧</span>
                </div>
                <span className="font-semibold text-sm">${skill.name}</span>
              </div>
            `)}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden glass-card p-2">
                <img src="/photo/khairibo.png" alt="Khairi Bouzakher" className="w-full h-full object-cover rounded-2xl filter grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-accentBlue to-accentPurple rounded-full blur-2xl opacity-50 -z-10"></div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">About Me</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                I'm a passionate Full Stack Developer and Computer Science student specializing in Web Development and AI. I love turning complex problems into simple, beautiful, and intuitive designs.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                When I'm not coding, you can find me exploring new technologies, participating in robotics competitions, or building side projects that solve real-world problems.
              </p>
              <div className="flex gap-4">
                <a href="/Khairi_Bouzakher_CV.pdf" download className="px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${user ? html`
        <section id="dashboard" className="py-32 bg-gray-50 dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">User Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">Welcome back. Your Google session is active.</p>
            </div>

            <div className="glass-card rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              <img
                src=${user.picture || "/photo/khairibo.png"}
                alt=${user.name || "User avatar"}
                className="w-24 h-24 rounded-full object-cover border border-gray-200 dark:border-white/10"
              />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">${user.name || "Google User"}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">${user.email || ""}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600 border border-green-500/20">Authenticated</span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accentBlue/10 text-accentBlue border border-accentBlue/20">Google Session</span>
                </div>
              </div>
              <button
                onClick=${handleLogout}
                className="px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>

            {/* File Upload Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Secure File Upload to Google Drive</h3>
              <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        ${uploading ? "Uploading..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PDF, Images, Documents up to 50MB</p>
                    </div>
                    <input
                      ref=${fileInputRef}
                      type="file"
                      className="hidden"
                      onChange=${handleFileUpload}
                      disabled=${uploading}
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.docx,.xlsx,.zip"
                    />
                  </label>
                </div>

                ${uploadMessage ? html`
                  <div className="mt-6 p-4 rounded-lg ${uploadMessage.includes("✅") ? "bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30" : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30"}">
                    <p className="${uploadMessage.includes("✅") ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}">
                      ${uploadMessage}
                    </p>
                  </div>
                ` : null}
              </div>

              {/* Uploaded Files List */}
              ${uploadedFiles.length > 0 ? html`
                <div className="mt-8">
                  <h4 className="text-lg font-bold mb-4">Recent Uploads</h4>
                  <div className="space-y-3">
                    ${uploadedFiles.slice(0, 5).map((file) => html`
                      <div key=${file.fileId} className="glass-card p-4 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">${file.fileName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${(file.size / 1024 / 1024).toFixed(2)} MB • ${new Date(file.createdTime).toLocaleDateString()}
                          </p>
                        </div>
                        <a
                          href=${file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-lg bg-accentBlue text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          View
                        </a>
                      </div>
                    `)}
                  </div>
                </div>
              ` : null}
            </div>
          </div>
        </section>
      ` : null}

      {/* Contact Section */}
      <section id="contact" className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-accentPurple/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Let's work together.</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">Feel free to reach out for collaborations or just a friendly hello.</p>
            
            <a href="mailto:khairibo32@gmail.com" className="inline-flex items-center gap-3 text-2xl md:text-4xl font-bold hover:text-accentBlue transition-colors mb-16">
              khairibo32@gmail.com ↗
            </a>

            <div className="flex items-center justify-center gap-6">
              <a href="https://github.com/KHAIRIBO" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <span>🐙</span>
              </a>
              <a href="https://linkedin.com/in/khairi-bouzakher/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <span>🔗</span>
              </a>
              <a href="mailto:khairibo32@gmail.com" className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:-translate-y-1 transition-transform hover:text-accentBlue">
                <span>✉️</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-white/10 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          © ${new Date().getFullYear()} Khairi Bouzakher. Built with React & Tailwind.
        </p>
      </footer>

    </div>
  `;
}

// Global error overlay for easier debugging when the app fails to load in the browser
function showErrorOverlay(message, stack) {
  try {
    const existing = document.getElementById('error-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '12px';
    overlay.style.right = '12px';
    overlay.style.top = '12px';
    overlay.style.zIndex = 999999;
    overlay.style.background = 'rgba(255,255,255,0.98)';
    overlay.style.color = '#b91c1c';
    overlay.style.border = '1px solid #fecaca';
    overlay.style.padding = '12px';
    overlay.style.borderRadius = '8px';
    overlay.style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)';
    overlay.innerHTML = `<strong>Application Error:</strong><div style="margin-top:6px;font-family:monospace;white-space:pre-wrap">${String(message)}</div>${stack ? `<details style="margin-top:8px"><summary style="cursor:pointer;color:#b91c1c">Stack</summary><pre style="white-space:pre-wrap">${String(stack)}</pre></details>` : ''}`;
    document.body.appendChild(overlay);
  } catch (e) {
    console.error('Failed to render error overlay', e);
  }
}

window.addEventListener('error', (ev) => {
  console.error('Runtime error:', ev.error || ev.message, ev.filename, ev.lineno, ev.colno);
  showErrorOverlay(ev.error?.message || ev.message || 'Unknown runtime error', ev.error?.stack || `${ev.filename}:${ev.lineno}:${ev.colno}`);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
  showErrorOverlay(ev.reason?.message || String(ev.reason), ev.reason?.stack || '');
});

const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(html`<${App} />`);
  } catch (err) {
    console.error('Render failed:', err);
    showErrorOverlay(err.message || 'Render failed', err.stack || '');
  }
}
