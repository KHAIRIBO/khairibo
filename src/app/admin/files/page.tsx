"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  X, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  MoreVertical,
  Cloud,
  FileCode,
  Download
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files from Supabase
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setFiles(data);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async (newFiles: FileList | File[]) => {
    setUploading(true);
    setProgress(0);
    
    const filesToUpload = Array.from(newFiles);
    const totalFiles = filesToUpload.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = filesToUpload[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (storageError) {
        console.error('Storage error:', storageError);
        alert(`Upload failed: ${storageError.message}. Make sure you created the "assets" bucket in Supabase.`);
        continue;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // 3. Save Metadata to Database
      const { data: dbData, error: dbError } = await supabase
        .from('files')
        .insert([{
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
          type: file.type,
          url: publicUrl,
        }])
        .select()
        .single();

      if (dbData) {
        setFiles((prev) => [dbData, ...prev]);
      }

      // Update progress
      setProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (!error) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={24} className="text-blue-500" />;
    if (type.includes("pdf")) return <FileText size={24} className="text-red-500" />;
    if (type.includes("json") || type.includes("javascript")) return <FileCode size={24} className="text-amber-500" />;
    return <File size={24} className="text-slate-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cloud Storage</h1>
          <p className="text-slate-500 font-medium">Manage your assets and documents securely.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5"
        >
          <Upload size={20} />
          Upload New File
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          multiple 
          className="hidden" 
        />
      </div>

      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-12 border-2 border-dashed rounded-[3rem] transition-all flex flex-col items-center justify-center text-center group overflow-hidden ${
          isDragging 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 transition-all ${
            isDragging ? "bg-blue-500 text-white scale-110 shadow-xl shadow-blue-500/20" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
          }`}>
            <Cloud size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Drag & Drop Files</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
            Upload your images, PDFs, or documents directly to your secure storage.
          </p>
          <div className="flex gap-4 justify-center">
            <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-100">Max 50MB</span>
            <span className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest border border-slate-100">All formats</span>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-12"
            >
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Uploading Assets</h4>
                    <p className="text-sm font-bold text-slate-500">Syncing to secure server...</p>
                  </div>
                  <span className="text-3xl font-black text-blue-600">{progress}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover-lift group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-slate-50 rounded-[1.5rem] group-hover:bg-slate-900 group-hover:text-white transition-all">
                  {getFileIcon(file.type)}
                </div>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h4 className="font-bold text-slate-900 truncate mb-1" title={file.name}>{file.name}</h4>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{file.size}</span>
                <span>{new Date(file.created_at).toLocaleDateString()}</span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={file.url === "https://placeholder.com" ? "#" : file.url} 
                  target={file.url === "https://placeholder.com" ? "_self" : "_blank"}
                  rel="noreferrer"
                  onClick={(e) => file.url === "https://placeholder.com" && e.preventDefault()}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    file.url === "https://placeholder.com" 
                      ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Eye size={14} />
                  Preview
                </a>
                <a 
                  href={file.url === "https://placeholder.com" ? "#" : file.url}
                  download={file.name}
                  onClick={(e) => file.url === "https://placeholder.com" && e.preventDefault()}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    file.url === "https://placeholder.com" 
                      ? "bg-slate-200 text-white cursor-not-allowed" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  <Download size={14} />
                  Get
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {files.length === 0 && !uploading && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6">
              <File size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-400">Storage is empty</h4>
            <p className="text-slate-300 font-medium">Your uploaded files will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
