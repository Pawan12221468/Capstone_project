import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Document, ChatSessionResponse, MessagesResponse } from '../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, ArrowLeft, Loader2, Sparkles, AlertTriangle, MessageSquare, Tag, AlignLeft, Send
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  type TabType = 'summary' | 'keywords' | 'qa';
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  // Q&A State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const res = await apiService.getDocument(id);
        if (res.document) setDocument(res.document);
        
        // Check for existing chat sessions for this document
        const sessionsRes = await apiService.getChatSessions(user.id);
        if (sessionsRes.sessions) {
          const docSession = sessionsRes.sessions.find(s => s.documentId === id);
          if (docSession) {
            setSessionId(docSession.id);
            // Fetch messages
            const msgsRes = await apiService.getChatSession(docSession.id, user.id);
            if (msgsRes.messages) {
              setMessages(msgsRes.messages);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, user]);

  useEffect(() => {
    // Auto scroll chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleStartQA = async () => {
    if (!document || !user) return;
    try {
      setSessionLoading(true);
      const res = await apiService.createChatSession(document.id, user.id, `Chat about ${document.title}`) as ChatSessionResponse;
      if (res.session) {
        setSessionId(res.session.id);
      }
    } catch (error) {
      console.error('Failed to create chat session', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !sessionId || !user) return;

    const currentInput = inputMsg;
    setInputMsg('');
    setSendingMsg(true);

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: currentInput }]);

    try {
      const res = await apiService.sendMessage(sessionId, currentInput, user.id);
      // Re-fetch messages to get precise DB state and AI response
      const msgsRes = await apiService.getChatSession(sessionId, user.id);
      if (msgsRes.messages) {
        setMessages(msgsRes.messages);
      }
    } catch (err) {
      console.error('Send message error:', err);
      // Remove temp message if failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#020617] px-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
        <p className="text-lg font-bold text-white">Loading Document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#020617] px-4 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Document Unavailable</h2>
        <p className="text-slate-400 mb-4">{error || 'This document could not be found or you do not have permission.'}</p>
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { importantPoints, keywords } = document.metadata || {};

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#020617] flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="bg-[#0a0f1e] border-b border-white/5 px-6 py-4 flex items-center shrink-0">
        <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-indigo-400 mr-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <FileText className="w-5 h-5 text-indigo-400 mr-3" />
        <div>
          <h1 className="text-base font-bold text-white leading-tight">{document.title}</h1>
          <p className="text-xs text-slate-500">{document.status === 'completed' ? 'Processing finished' : document.status}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: Document Preview */}
        <div className="hidden md:flex md:w-1/2 lg:w-7/12 border-r border-white/5 bg-[#0a0f1e] flex-col overflow-hidden">
           <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center shrink-0">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Document Preview</span>
           </div>
           <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-slate-300 bg-[#0a0f1e] custom-scrollbar" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
             {document.status === 'processing' ? (
               <div className="h-full flex items-center justify-center flex-col text-slate-500">
                 <Loader2 className="w-8 h-8 animate-spin mb-4" />
                 <p>Extracting text from document...</p>
               </div>
             ) : (
               <div className="max-w-3xl mx-auto">
                 <MarkdownRenderer content={document.extractedText || 'No text content available.'} />
               </div>
             )}
           </div>
        </div>

        {/* RIGHT PANEL: Interactive Tabs */}
        <div className="flex-1 flex flex-col bg-[#020617] overflow-hidden w-full">
           <div className="flex border-b border-white/5 bg-[#0a0f1e] shrink-0">
             <button
               onClick={() => setActiveTab('summary')}
               className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center border-b-2 transition-colors ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
             >
               <AlignLeft className="w-4 h-4 mr-2" /> Insights
             </button>
             <button
               onClick={() => setActiveTab('keywords')}
               className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center border-b-2 transition-colors ${activeTab === 'keywords' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
             >
               <Tag className="w-4 h-4 mr-2" /> Keywords
             </button>
             <button
               onClick={() => setActiveTab('qa')}
               className={`flex-1 py-4 text-center font-bold text-sm flex items-center justify-center border-b-2 transition-colors ${activeTab === 'qa' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
             >
               <MessageSquare className="w-4 h-4 mr-2" /> Q&A
             </button>
           </div>

           <div className="flex-1 overflow-y-auto relative p-6 custom-scrollbar">
             <AnimatePresence mode="wait">
                {activeTab === 'summary' && (
                 <motion.div key="summary" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                    {document.status === 'processing' ? (
                       <div className="text-center py-12 text-slate-500">
                         <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                         <p>AI is generating insights...</p>
                       </div>
                    ) : (
                      <>
                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-indigo-500/20">
                          <h2 className="text-base font-bold text-indigo-300 mb-4 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> Executive Summary
                          </h2>
                          <MarkdownRenderer content={document.summary || 'No summary generated.'} />
                        </div>

                        {importantPoints && importantPoints.length > 0 && (
                          <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
                            <h2 className="text-base font-bold text-white mb-4">Key Takeaways</h2>
                            <ul className="space-y-3">
                              {importantPoints.map((point: string, idx: number) => (
                                <li key={idx} className="flex">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3 flex-shrink-0" />
                                  <span className="text-slate-300 leading-relaxed text-sm">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                 </motion.div>
                )}

               {activeTab === 'keywords' && (
                 <motion.div key="keywords" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                   {document.status === 'processing' ? (
                     <div className="text-center py-12 text-slate-500">
                       <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                       <p>Extracting semantic keywords...</p>
                     </div>
                   ) : (
                     <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5">
                      <h2 className="text-base font-bold text-white mb-6">Semantic Keywords</h2>
                      {keywords && keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl text-sm font-semibold border border-indigo-500/20 hover:scale-105 transition-transform select-none cursor-default">
                              {kw}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No semantic keywords found.</p>
                      )}
                     </div>
                   )}
                 </motion.div>
               )}

               {activeTab === 'qa' && (
                 <motion.div key="qa" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full flex flex-col">
                   {!sessionId ? (
                     <div className="h-full flex flex-col items-center justify-center bg-[#0f172a] rounded-2xl border border-white/5 p-8 text-center">
                       <MessageSquare className="w-14 h-14 text-indigo-400/30 mb-4" />
                       <h2 className="text-xl font-bold text-white mb-2">Talk to your Document</h2>
                       <p className="text-slate-400 mb-8 max-w-sm text-sm">Ask any question about the contents of this document and get immediate, cited answers from AI.</p>
                       <button onClick={handleStartQA} disabled={sessionLoading || document.status === 'processing'} className="btn-primary disabled:opacity-50">
                         {sessionLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
                         Start Q&A Session
                       </button>
                       {document.status === 'processing' && <p className="text-sm text-amber-400 mt-4">Document is currently processing. Q&A will be available shortly.</p>}
                     </div>
                   ) : (
                     <div className="flex-1 flex flex-col h-full bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden">
                       {/* Chat Messages */}
                       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                          {messages.length === 0 && (
                            <div className="h-full flex items-center justify-center text-slate-600 font-medium text-sm">Say hello to get started!</div>
                          )}
                          {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[90%] rounded-2xl px-5 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm'}`}>
                                <MarkdownRenderer content={msg.content} />
                              </div>
                            </div>
                          ))}
                          {sendingMsg && (
                            <div className="flex justify-start">
                              <div className="bg-white/5 border border-white/5 text-slate-300 rounded-2xl rounded-tl-sm px-5 py-4">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                       </div>

                       {/* Input Area */}
                       <div className="p-3 bg-[#0f172a] border-t border-white/5">
                         <form onSubmit={handleSendMessage} className="relative flex items-center">
                           <input
                             type="text"
                             value={inputMsg}
                             onChange={(e) => setInputMsg(e.target.value)}
                             disabled={sendingMsg}
                             placeholder="Ask a question about this document..."
                             className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-14 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 transition-all text-sm"
                           />
                           <button
                             type="submit"
                             disabled={!inputMsg.trim() || sendingMsg}
                             className="absolute right-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-40 transition-all"
                           >
                             <Send className="w-4 h-4" />
                           </button>
                         </form>
                       </div>
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
