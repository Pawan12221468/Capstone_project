import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  Upload, FileText, CheckCircle, AlertCircle, X, ArrowRight,
  File, FileSpreadsheet, CloudUpload
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedText?: string;
  summary?: string;
  documentId?: string;
}

const UploadPage: React.FC = () => {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [isDragOver, setIsDragOver]       = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!user) { alert('Please log in to upload documents'); return; }
    const validFiles = files.filter(f => ['application/pdf'].includes(f.type) && f.size <= 50 * 1024 * 1024);
    if (validFiles.length !== files.length) alert('Some files were rejected. Only PDF files under 50MB are allowed.');

    for (const file of validFiles) {
      const fileId  = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = { id: fileId, file, status: 'uploading', progress: 0 };
      setUploadedFiles(prev => [...prev, newFile]);

      try {
        const response = await apiService.uploadDocument(file);
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', documentId: response.document.id } : f));

        const pollForCompletion = async () => {
          try {
            const docResponse = await apiService.getDocument(response.document.id);
            const doc = docResponse.document;
            if (doc.status === 'completed') {
              setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed', extractedText: doc.extractedText, summary: doc.summary } : f));
            } else if (doc.status === 'error') {
              setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
            } else {
              setTimeout(pollForCompletion, 2000);
            }
          } catch {
            setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
          }
        };
        setTimeout(pollForCompletion, 1000);
      } catch {
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f));
      }
    }
  }, [user]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const handleStartQA = async (file: UploadedFile) => {
    if (!user || !file.documentId) { alert('Please log in to start a Q&A session'); return; }
    try {
      const session = await apiService.createChatSession(file.documentId, user.id, `Chat about ${file.file.name}`);
      navigate(`/chat/${session.session.id}`);
    } catch {
      alert('Failed to start Q&A session. Please try again.');
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf')  return <FileText className="w-8 h-8 text-red-400" />;
    if (ext === 'txt')  return <FileText className="w-8 h-8 text-slate-400" />;
    if (ext === 'rtf')  return <FileSpreadsheet className="w-8 h-8 text-emerald-400" />;
    return <File className="w-8 h-8 text-blue-400" />;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CloudUpload className="w-4 h-4" />
              <span>Document Intelligence</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Upload Your Documents</h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Drag and drop your documents or click to browse. We'll extract the text and make it ready for intelligent Q&A.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                : 'border-white/10 hover:border-indigo-500/50 bg-[#0f172a] hover:bg-indigo-500/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" multiple accept=".pdf" onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${
                isDragOver ? 'bg-indigo-500/30 scale-110' : 'bg-indigo-500/15'
              }`}>
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isDragOver ? 'Drop your files here!' : 'Choose files or drag and drop'}
              </h3>
              <p className="text-slate-400 mb-6">PDF files up to 50MB</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                <FileText className="w-4 h-4" />
                <span>PDF supported</span>
              </div>
            </motion.div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f172a] border border-white/5 rounded-2xl p-6"
                  >
                    <div className="flex items-start space-x-4">
                      {getFileIcon(file.file.name)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-white truncate">{file.file.name}</h4>
                          <button onClick={() => removeFile(file.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors ml-2 shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">{formatSize(file.file.size)}</p>

                        {/* Uploading */}
                        {file.status === 'uploading' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>Uploading...</span>
                              <span>{file.progress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2">
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Processing */}
                        {file.status === 'processing' && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-indigo-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
                            <span>Processing document...</span>
                          </div>
                        )}

                        {/* Completed */}
                        {file.status === 'completed' && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 text-sm text-emerald-400 mb-3">
                              <CheckCircle className="w-4 h-4" />
                              <span>Processing complete</span>
                            </div>

                            {file.extractedText && (
                              <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-3">
                                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Extracted Text Preview</h5>
                                <p className="text-sm text-slate-300 line-clamp-3">{file.extractedText}</p>
                              </div>
                            )}

                            {file.summary && (
                              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-3">
                                <h5 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">AI Summary</h5>
                                <p className="text-sm text-slate-300">{file.summary}</p>
                              </div>
                            )}

                            <button onClick={() => handleStartQA(file)} className="btn-primary text-sm">
                              <span>Start Q&A Session</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Error */}
                        {file.status === 'error' && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Processing failed. Please try again.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}


        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
