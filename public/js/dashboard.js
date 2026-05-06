import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";

const html = htm.bind(React.createElement);

function DashboardApp() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/user", { credentials: "include" });
        if (!response.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const payload = await response.json();
        setUser(payload.user || null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      window.location.href = "/";
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

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "File upload failed");
      }

      setUploadedFiles((prev) => [payload.file, ...prev]);
      setUploadMessage(`Uploaded ${file.name} successfully.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return html`
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accentBlue/20 border-t-accentBlue rounded-full animate-spin"></div>
      </div>
    `;
  }

  if (!user) {
    return html`
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Dashboard Access Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in from the home page before opening your dashboard.</p>
          <a href="/" className="inline-flex px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold">Go to Home</a>
        </div>
      </div>
    `;
  }

  return html`
    <main className="min-h-screen">
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 dark:bg-[#0a0a0a]/75 border-b border-gray-200/70 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-display font-bold shadow-lg shadow-black/10 dark:shadow-white/10">
              KBO
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">User Dashboard</p>
              <p className="text-sm font-semibold group-hover:text-accentBlue transition-colors">${user.name || "Google User"}</p>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#overview" className="hover:text-accentBlue transition-colors">Overview</a>
            <a href="#upload" className="hover:text-accentBlue transition-colors">Upload</a>
            <a href="#files" className="hover:text-accentBlue transition-colors">Files</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" className="hidden sm:inline-flex px-4 py-2 rounded-full border border-gray-300 dark:border-white/20 hover:text-accentBlue transition-colors">Home</a>
            <button onClick=${handleLogout} className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <section id="overview" className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-10 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex items-center gap-5">
              <img
                src=${user.picture || "/photo/khairibo.png"}
                alt=${user.name || "User avatar"}
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200 dark:border-white/10 shadow-md"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-accentBlue font-semibold mb-2">Welcome back</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">${user.name || "Google User"}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">${user.email || ""}</p>
              </div>
            </div>

            <div className="lg:ml-auto grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-4 bg-gray-50 dark:bg-white/[0.02]">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</p>
                <p className="mt-1 font-semibold text-green-600">Authenticated</p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-4 bg-gray-50 dark:bg-white/[0.02]">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Area</p>
                <p className="mt-1 font-semibold">Private Dashboard</p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-4 bg-gray-50 dark:bg-white/[0.02]">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Brand</p>
                <p className="mt-1 font-semibold">KBO</p>
              </div>
            </div>
          </div>
        </section>

        <section id="upload" className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Secure Upload</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Upload to Google Drive</h2>
            </div>
            <span className="hidden md:inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-accentBlue/10 text-accentBlue border border-accentBlue/20">Google Drive</span>
          </div>

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">${uploading ? "Uploading..." : "Click to select a file"}</p>
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

          ${uploadMessage ? html`
            <div className="mt-6 p-4 rounded-lg border ${uploadMessage.startsWith("Uploaded") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}">
              ${uploadMessage}
            </div>
          ` : null}

          ${uploadedFiles.length > 0 ? html`
            <div className="mt-8">
              <h4 className="text-lg font-bold mb-3">Recent Uploads</h4>
              <div className="space-y-3">
                ${uploadedFiles.slice(0, 5).map((file) => html`
                  <div key=${file.fileId} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">${file.fileName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <a href=${file.webViewLink} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-accentBlue text-white text-xs font-semibold">View</a>
                  </div>
                `)}
              </div>
            </div>
          ` : null}

          <div id="files"></div>
        </section>

        <section className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Recent Activity</p>
              <h3 className="text-2xl font-display font-bold">Uploaded Files</h3>
            </div>
          </div>

          ${uploadedFiles.length > 0 ? html`
            <div className="space-y-3">
              ${uploadedFiles.slice(0, 5).map((file) => html`
                <div key=${file.fileId} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">${file.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <a href=${file.webViewLink} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-accentBlue text-white text-xs font-semibold">View</a>
                </div>
              `)}
            </div>
          ` : html`
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-8 text-center text-gray-500 dark:text-gray-400">
              No files uploaded yet.
            </div>
          `}
        </section>
      </div>
    </main>
  `;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(html`<${DashboardApp} />`);
}
