"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  File, 
  Image as ImageIcon, 
  FileText, 
  FileCode,
  FolderArchive,
  Search,
  Grid3x3,
  List
} from "lucide-react";

interface PublicFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  created_at: string;
}

export default function DownloadsPage() {
  const [files, setFiles] = useState<PublicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data && !Array.isArray(data.error)) {
        setFiles(data);
      }
    } catch (e) {
      console.error('Failed to fetch files', e);
    }
    setLoading(false);
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={28} className="text-blue-500" />;
    if (type.includes("pdf")) return <FileText size={28} className="text-red-500" />;
    if (type.includes("json") || type.includes("javascript") || type.includes("zip")) return <FileCode size={28} className="text-amber-500" />;
    if (type.includes("video")) return <File size={28} className="text-purple-500" />;
    return <File size={28} className="text-slate-500" />;
  };

  const getCategory = (type: string, name: string) => {
    if (type.startsWith("image/")) return "Images";
    if (type.includes("pdf")) return "Documents";
    if (type.includes("video")) return "Videos";
    if (type.includes("zip") || type.includes("compressed")) return "Archives";
    if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi')) return "Videos";
    if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg')) return "Audio";
    return "Files";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-[2rem] mb-6">
              <FolderArchive size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Download Center
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Access and download files, videos, notes, and other resources shared by the admin.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900/5 text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Files */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto mb-4">
              <File size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2">No files found</h3>
            <p className="text-slate-400 font-medium">
              {searchQuery ? "Try adjusting your search" : "Files will appear here once uploaded"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file, idx) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-[1.25rem] group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {getFileIcon(file.type)}
                    </div>
                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {getCategory(file.type, file.name)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 truncate mb-1" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-6">
                    <span>{file.size}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>

                  <a
                    href={file.url}
                    download={file.name}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="text-left px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="text-left px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Size</th>
                    <th className="text-left px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="text-right px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file, idx) => (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-xl">
                            {getFileIcon(file.type)}
                          </div>
                          <span className="font-bold text-slate-900 truncate max-w-xs">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
                          {getCategory(file.type, file.name)}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium">{file.size}</td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <a
                          href={file.url}
                          download={file.name}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                        >
                          <Download size={14} />
                          Download
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
