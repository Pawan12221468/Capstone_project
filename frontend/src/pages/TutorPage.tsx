import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { TutorSession, TutorMessage, QuizData } from '../types/api';
import {
  GraduationCap,
  Send,
  Plus,
  Trash2,
  Bot,
  User,
  Sparkles,
  BookOpenCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Code2,
  Lightbulb,
  RotateCcw,
  Brain,
  CheckCircle,
  XCircle,
  Trophy,
  Map,
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTED_TOPICS = [
  { label: 'React', icon: '⚛️' },
  { label: 'Python', icon: '🐍' },
  { label: 'Data Structures', icon: '🌳' },
  { label: 'Machine Learning', icon: '🤖' },
  { label: 'System Design', icon: '🏗️' },
  { label: 'TypeScript', icon: '💙' },
  { label: 'SQL', icon: '🗄️' },
  { label: 'Git & GitHub', icon: '🐙' },
];

const STARTER_QUESTIONS = [
  'Explain the core concept',
  'Give me a beginner-friendly overview',
  'What are the most important things to learn?',
  'Show me a real-world example',
];

// ─── Typing Dot Animation ────────────────────────────────────────────────────
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-blue-400"
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const TutorPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [activeSession, setActiveSession] = useState<TutorSession | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [topicDraft, setTopicDraft] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Quiz States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const [roadmapContext, setRoadmapContext] = useState<{ roadmapId: string, topicId: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping]);

  useEffect(() => {
    if (user) {
      loadSessions().then((fetchedSessions) => {
        const autoTopic = searchParams.get('topic');
        const autoStart = searchParams.get('autoStart');
        const rId = searchParams.get('roadmapId');
        const tId = searchParams.get('topicId');
        
        if (rId && tId) {
          setRoadmapContext({ roadmapId: rId, topicId: tId });
        }

        if (autoTopic && autoStart === 'true') {
          const existingSession = fetchedSessions?.find((s: TutorSession) => s.topic === autoTopic);
          if (existingSession) {
            openSession(existingSession);
          } else {
            handleAutoCreateSession(autoTopic);
          }
          setSearchParams({});
        }
      });
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await apiService.getTutorSessions();
      setSessions(res.sessions || []);
      return res.sessions;
    } catch {
      return [];
    }
  };

  const handleAutoCreateSession = async (topic: string) => {
    setCreatingSession(true);
    setError(null);
    try {
      const res = await apiService.createTutorSession(topic);
      setSessions((prev) => [res.session, ...prev]);
      setActiveSession(res.session);

      setAiTyping(true);
      const prompt = `Please explain the topic "${topic}" in simple language, using a step-by-step format, and provide practical examples.`;
      const optimisticMsg: TutorMessage = {
        id: 'auto-' + Date.now(),
        role: 'user',
        content: prompt,
        timestamp: new Date().toISOString()
      };
      setMessages([optimisticMsg]);
      
      const chatRes = await apiService.sendTutorMessage(res.session.id, prompt);
      setMessages([chatRes.userMessage, chatRes.assistantMessage]);
    } catch (e: any) {
      setError(e.message || 'Failed to auto-start session');
    } finally {
      setCreatingSession(false);
      setAiTyping(false);
    }
  };

  const openSession = useCallback(async (session: TutorSession) => {
    setSessionLoading(true);
    setError(null);
    try {
      const res = await apiService.getTutorSession(session.id);
      setActiveSession(res.session);
      setMessages(res.session.messages || []);
    } catch {
      setError('Failed to load session.');
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // ── Quiz Logic ──
  const handleTakeQuiz = async () => {
    if (!activeSession) return;
    setShowQuizModal(true);
    setQuizLoading(true);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    
    try {
      const chatHistoryStr = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n');
      const response = await apiService.generateQuiz(activeSession.topic, [], 'Medium', chatHistoryStr);
      if (response?.quiz) setQuizData(response.quiz);
    } catch (e: any) {
      setError(e.message || 'Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (option: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(option);
    setIsAnswerRevealed(true);
    if (quizData && option === quizData.questions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = async () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      setQuizFinished(true);
      
      // Auto-update progress if doing great and came from roadmap
      if (quizScore >= Math.floor(quizData.questions.length / 2) && roadmapContext) {
        try {
          const res = await apiService.getRoadmapProgress(roadmapContext.roadmapId);
          const currentCompleted = res.completedTopics || [];
          if (!currentCompleted.includes(roadmapContext.topicId)) {
            await apiService.saveRoadmapProgress(roadmapContext.roadmapId, [...currentCompleted, roadmapContext.topicId]);
          }
        } catch (e) {
          console.error('Failed to update progress automatically', e);
        }
      }
    }
  };

  const createSession = async () => {
    if (!topicDraft.trim() || !user) return;
    setCreatingSession(true);
    setError(null);
    try {
      const res = await apiService.createTutorSession(topicDraft.trim());
      setSessions(prev => [res.session, ...prev]);
      setActiveSession(res.session);
      setMessages([]);
      setTopicDraft('');
      setShowTopicModal(false);
    } catch (e: any) {
      setError(e.message || 'Failed to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || !activeSession || aiTyping) return;
    setInput('');
    setError(null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const optimistic: TutorMessage = {
      id: `opt-${Date.now()}`,
      content: msg,
      role: 'user',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setAiTyping(true);

    try {
      const res = await apiService.sendTutorMessage(activeSession.id, msg);
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimistic.id),
        res.userMessage,
        res.assistantMessage,
      ]);
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      if (!text) setInput(msg); // Only revert input if they manually typed it
      setError(e.message || 'Failed to get response. Please try again.');
    } finally {
      setAiTyping(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.deleteTutorSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession?.id === id) { setActiveSession(null); setMessages([]); }
    } catch {}
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0d0d0f] overflow-hidden select-text">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="shrink-0 flex flex-col bg-[#111113] border-r border-white/[0.07] overflow-hidden"
          >
            {/* Sidebar top */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-900/30">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[0.82rem] font-bold text-white tracking-wide">AI Tutor</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setShowTopicModal(true)}
                className="w-full flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-white/[0.06] border border-white/[0.09] text-neutral-300 text-[0.82rem] font-medium hover:bg-white/[0.1] hover:text-white transition-all group"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-90 transition-transform duration-200" />
                New topic
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-neutral-700 mb-3" />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    No sessions yet. Start a topic to begin learning.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[0.7rem] text-neutral-600 font-semibold uppercase tracking-widest px-2 py-2 mt-1">
                    Recent
                  </p>
                  {sessions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => openSession(s)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[0.82rem] group flex items-center justify-between transition-all duration-150 ${
                        activeSession?.id === s.id
                          ? 'bg-white/[0.09] text-white font-medium'
                          : 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm shrink-0">
                          {SUGGESTED_TOPICS.find(t => t.label.toLowerCase() === s.topic.toLowerCase())?.icon ?? '📘'}
                        </span>
                        <span className="truncate">{s.topic}</span>
                      </div>
                      <button
                        onClick={e => deleteSession(s.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/15 hover:text-red-400 text-neutral-600 transition-all ml-1 shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-sm z-10">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          
          {roadmapContext && (
            <button
              onClick={() => navigate('/roadmaps')}
              className="px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs mr-2 relative"
            >
              <Map className="w-3.5 h-3.5" />
              Back to Roadmap
              <span className="w-2 h-2 rounded-full bg-blue-500 absolute -top-1 -right-1 shadow-sm border border-[#0d0d0f]" />
            </button>
          )}

          {activeSession ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {SUGGESTED_TOPICS.find(t => t.label.toLowerCase() === activeSession.topic.toLowerCase())?.icon ?? '📘'}
                </span>
                <span className="font-semibold text-white text-sm">Learning: {activeSession.topic}</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTakeQuiz}
                className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold transition-colors uppercase tracking-wider shadow-sm"
              >
                <Brain className="w-3.5 h-3.5" />
                Take Quiz
              </motion.button>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500" />
                <span className="text-xs text-neutral-500">AI Assistant</span>
              </div>
            </>
          ) : (
            <span className="text-sm font-semibold text-neutral-400">
              {sidebarOpen ? '' : 'AI Tutor'}
            </span>
          )}
        </div>

        {/* Topic Modal */}
        <AnimatePresence>
          {showTopicModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowTopicModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#18181c] border border-white/[0.1] rounded-2xl p-7 w-full max-w-lg mx-4 shadow-2xl"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-900/40 shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white mb-0.5">Choose a topic</h2>
                    <p className="text-xs text-neutral-500">Your AI tutor will personalize every response to your chosen subject.</p>
                  </div>
                </div>

                <div className="relative mb-4">
                  <input
                    autoFocus
                    type="text"
                    value={topicDraft}
                    onChange={e => setTopicDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createSession(); }}
                    placeholder="e.g. Binary Search, React hooks, SQL joins…"
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <p className="text-[0.7rem] font-semibold text-neutral-600 uppercase tracking-widest mb-2.5">Popular topics</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SUGGESTED_TOPICS.map(t => (
                      <button
                        key={t.label}
                        onClick={() => setTopicDraft(t.label)}
                        className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all border ${
                          topicDraft === t.label
                            ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                            : 'bg-white/[0.04] border-white/[0.07] text-neutral-400 hover:bg-white/[0.08] hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="leading-tight text-center">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTopicModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/[0.09] text-neutral-500 text-sm hover:text-neutral-200 hover:border-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createSession}
                    disabled={!topicDraft.trim() || creatingSession}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                  >
                    {creatingSession
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><BookOpenCheck className="w-4 h-4" /> Start Learning</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Quiz Modal */}
          {showQuizModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col bg-[#0d0d0f]/95 backdrop-blur-md overflow-hidden"
            >
              {/* Quiz Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111113]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Quiz: {activeSession?.topic}</h2>
                    <p className="text-xs text-slate-400">Test your knowledge to ensure retention</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>

              {/* Quiz Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center justify-center">
                {quizLoading ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white/5 border-t-emerald-500 rounded-full mb-4 animate-spin mx-auto" />
                    <h3 className="text-lg font-bold text-white mb-2">Generating Quiz...</h3>
                    <p className="text-slate-400">Our AI is drafting 10 contextual questions for you.</p>
                  </div>
                ) : quizFinished ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-[#111113] p-8 rounded-3xl border border-white/5 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Quiz Finished!</h3>
                    <p className="text-slate-400 mb-6">You scored {quizScore} out of {quizData?.questions.length}</p>
                    {roadmapContext && quizScore >= Math.floor((quizData?.questions.length || 5) / 2) && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 inline-flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Got it! Roadmap progress automatically updated.
                      </div>
                    )}
                    
                    <div className="w-full bg-white/5 rounded-full h-3 mb-8 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(quizScore / (quizData?.questions.length || 1)) * 100}%` }} 
                        className={`h-full ${quizScore >= 3 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      />
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setShowQuizModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors font-semibold">Done</button>
                      <button onClick={handleTakeQuiz} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Retry
                      </button>
                    </div>
                  </motion.div>
                ) : quizData ? (
                  <div className="max-w-2xl w-full">
                    {/* Progress */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-slate-400">Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                        <span className="text-sm font-bold text-emerald-400">Score: {quizScore}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Question Card */}
                    <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111113] p-8 rounded-3xl border border-white/5 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
                        {quizData.questions[currentQuestionIndex].question}
                      </h3>

                      <div className="space-y-3 mb-8">
                        {quizData.questions[currentQuestionIndex].options.map((option, i) => {
                          const isSelected = selectedOption === option;
                          const isCorrect = option === quizData.questions[currentQuestionIndex].correctAnswer;
                          
                          let btnStyle = "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/10";
                          if (isAnswerRevealed) {
                            if (isCorrect) btnStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                            else if (isSelected) btnStyle = "border-red-500/50 bg-red-500/10 text-red-400";
                            else btnStyle = "border-white/5 bg-transparent text-slate-500 opacity-50";
                          } else if (isSelected) {
                            btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-100";
                          }

                          return (
                            <motion.button
                              whileHover={!isAnswerRevealed ? { scale: 1.01 } : {}}
                              whileTap={!isAnswerRevealed ? { scale: 0.98 } : {}}
                              key={i}
                              disabled={isAnswerRevealed}
                              onClick={() => handleSelectQuizOption(option)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${btnStyle}`}
                            >
                              <span className="text-[0.95rem]">{option}</span>
                              {isAnswerRevealed && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                              {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Explanation Area */}
                      {isAnswerRevealed && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl">
                          <p className="text-sm text-slate-300 leading-relaxed"><span className="font-bold text-white mr-2">Explanation:</span>{quizData.questions[currentQuestionIndex].explanation}</p>
                        </motion.div>
                      )}

                      {/* Next Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleNextQuizQuestion}
                          disabled={!isAnswerRevealed}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold disabled:opacity-30 transition-opacity flex items-center gap-2"
                        >
                          {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'View Results'}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Empty state */}
        {!activeSession && !sessionLoading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-md"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 mb-6 shadow-2xl shadow-blue-900/20"
              >
                <GraduationCap className="w-9 h-9 text-blue-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-3">Your Personal AI Tutor</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-8">
                Learn any concept through conversation. Your tutor breaks it down simply, uses examples, and gives you exercises to practice.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: Zap, label: 'Instant answers', desc: 'No waiting. Ask and learn.' },
                  { icon: Code2, label: 'Code examples', desc: 'Concepts shown in real code.' },
                  { icon: Lightbulb, label: 'Simple language', desc: 'Explained like you\'re five.' },
                  { icon: BookOpenCheck, label: 'Mini exercises', desc: 'Practice what you learn.' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex flex-col items-start gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-left">
                    <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold text-white">{label}</span>
                    <span className="text-[0.72rem] text-neutral-500">{desc}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowTopicModal(true)}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-xl shadow-blue-900/30"
              >
                <Plus className="w-4 h-4" />
                Start a New Session
              </button>
            </motion.div>
          </div>
        )}

        {sessionLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Chat area */}
        {activeSession && !sessionLoading && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="text-4xl mb-4">
                      {SUGGESTED_TOPICS.find(t => t.label.toLowerCase() === activeSession.topic.toLowerCase())?.icon ?? '📘'}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1.5">
                      Learning: <span className="text-blue-400">{activeSession.topic}</span>
                    </h3>
                    <p className="text-sm text-neutral-500 mb-8">Ask anything — your tutor is ready.</p>
                    <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
                      {STARTER_QUESTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-left text-[0.78rem] text-neutral-400 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:text-white px-3.5 py-2.5 rounded-xl transition-all leading-snug"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {msg.role === 'assistant' ? (
                      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/30 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-700 border border-white/10 flex items-center justify-center mt-0.5">
                        <User className="w-4 h-4 text-neutral-300" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`group flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'user' ? (
                        <div className="bg-[#2d2f3e] border border-white/[0.09] rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
                          <MarkdownRenderer content={msg.content} />
                        </div>
                      ) : (
                        <div className="bg-[#1a1a1f] border border-white/[0.07] rounded-2xl rounded-tl-sm shadow-md">
                          <div className="px-5 py-4">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        </div>
                      )}
                      <span className="text-[0.65rem] text-neutral-700 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* AI typing indicator */}
                {aiTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 flex-row"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/30 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#1a1a1f] border border-white/[0.07] rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2.5 text-red-400 bg-red-950/40 border border-red-800/30 rounded-xl px-4 py-3 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                      <button
                        onClick={() => setError(null)}
                        className="ml-2 p-1 rounded-md hover:bg-red-800/20 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} className="h-1" />
              </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 bg-[#0d0d0f] px-4 pb-5 pt-3 border-t border-white/[0.05]">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3 bg-[#1c1c21] border border-white/[0.1] rounded-2xl px-4 py-3.5 shadow-lg focus-within:ring-1 focus-within:ring-blue-500/30 focus-within:border-blue-500/25 transition-all">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={aiTyping}
                    placeholder={`Ask about ${activeSession.topic}…`}
                    className="flex-1 bg-transparent text-[0.9rem] text-neutral-100 placeholder-neutral-600 resize-none outline-none leading-relaxed max-h-44 py-0.5"
                    style={{ height: 'auto' }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={aiTyping || !input.trim()}
                    className={`shrink-0 p-2.5 rounded-xl transition-all ${
                      input.trim() && !aiTyping
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30 hover:opacity-90'
                        : 'bg-white/[0.06] text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    {aiTyping
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-center text-[0.67rem] text-neutral-700 mt-2.5">
                  Press <kbd className="bg-white/[0.06] border border-white/10 text-neutral-500 text-[0.65rem] px-1.5 py-0.5 rounded font-mono">Enter</kbd> to send &nbsp;·&nbsp; <kbd className="bg-white/[0.06] border border-white/10 text-neutral-500 text-[0.65rem] px-1.5 py-0.5 rounded font-mono">Shift+Enter</kbd> for newline
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorPage;
