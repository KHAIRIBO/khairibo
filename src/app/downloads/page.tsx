"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  File, 
  Image as ImageIcon, 
  FileText, 
  FileCode,
  FolderArchive,
  Search,
  Grid3x3,
  List,
  Eye,
  X,
  Ban,
  Copy,
  Check,
  Globe
} from "lucide-react";

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  content?: string;
  created_at: string;
  allow_download?: boolean;
}

export default function DownloadsPage() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pop-up Modal state
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFiles(data);
      }
    } catch (e) {
      console.error('Failed to fetch files', e);
    }
    setLoading(false);
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={26} className="text-blue-500" />;
    if (type.includes("pdf") || type.includes("text")) return <FileText size={26} className="text-emerald-500" />;
    if (type.includes("json") || type.includes("javascript") || type.includes("zip")) return <FileCode size={26} className="text-amber-500" />;
    return <File size={26} className="text-slate-500" />;
  };

  const copyTextContent = (content?: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: SharedFile) => {
    if (file.allow_download === false) return;
    if (file.content && (!file.url || file.type?.includes("text"))) {
      const blob = new Blob([file.content], { type: file.type || "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.name.includes(".") ? file.name : `${file.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }
    if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-2xl sm:rounded-[2rem] mb-4 sm:mb-6 shadow-lg shadow-slate-900/10">
              <FolderArchive size={28} className="text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              Shared Resource Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto font-medium">
              View shared files, code notes, and text snippets in pop-up previews or download permitted files.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search shared files & text notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium shadow-xs"
            />
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
              title="Grid View"
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Shared Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <File size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No shared files found</h3>
            <p className="text-slate-400 text-xs font-medium">
              {searchQuery ? "Try adjusting your search query." : "Admin shared files and text notes will appear here."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file, idx) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {getFileIcon(file.type)}
                    </div>

                    {file.allow_download === false ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-200/80 flex items-center gap-1">
                        <Ban size={11} /> View Only
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200/80 flex items-center gap-1">
                        <Download size={11} /> Downloadable
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-slate-900 truncate text-sm sm:text-base mb-1" title={file.name}>
                    {file.name}
                  </h3>

                  <div className="text-xs text-slate-400 font-medium mb-4">
                    {file.size} • {new Date(file.created_at).toLocaleDateString()}
                  </div>

                  {file.content && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 font-mono line-clamp-3 mb-5 border border-slate-100">
                      {file.content}
                    </div>
                  )}
                </div>

                {/* Pop-up Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => setSelectedFile(file)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={14} />
                    View Pop-up
                  </button>

                  {file.allow_download !== false && (
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      <Download size={14} />
                      Get
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {getFileIcon(file.type)}
                          </div>
                          <span className="font-bold text-slate-900 text-sm truncate max-w-xs">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {file.allow_download === false ? (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md inline-flex items-center gap-1">
                            <Ban size={12} /> View Only
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md inline-flex items-center gap-1">
                            <Download size={12} /> Downloadable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">{file.size}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedFile(file)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye size={13} /> View Pop-up
                          </button>

                          {file.allow_download !== false && (
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Download size={13} /> Download
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL PREVIEW */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFile(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl">
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Shared on {new Date(selectedFile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content Preview */}
              <div className="flex-1 overflow-y-auto my-6 space-y-4 pr-1">
                {/* Permission Banner */}
                {selectedFile.allow_download === false ? (
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Ban size={15} className="text-amber-600" />
                      View Only Mode — Download option disabled by Admin
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] uppercase font-bold">Read Only</span>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-between text-blue-900 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Download size={15} className="text-blue-600" />
                      Download Allowed — You can save this resource to your device
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 rounded text-[10px] uppercase font-bold">Permitted</span>
                  </div>
                )}

                {/* Display Text Content if Snippet */}
                {selectedFile.content ? (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shared Text Content</span>
                      <button
                        onClick={() => copyTextContent(selectedFile.content)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy Text"}
                      </button>
                    </div>
                    <pre className="p-5 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800 shadow-inner">
                      {selectedFile.content}
                    </pre>
                  </div>
                ) : selectedFile.url && selectedFile.type.startsWith("image/") ? (
                  <div className="rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center p-2">
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.name} 
                      className="w-full max-h-96 object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                    <File size={40} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-700">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{selectedFile.size}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>

                {selectedFile.allow_download !== false ? (
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <Download size={15} />
                    Download {selectedFile.content && (!selectedFile.url || selectedFile.type?.includes("text")) ? "Note" : "File"}
                  </button>
                ) : (
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                    Download Disabled (View Only)
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
