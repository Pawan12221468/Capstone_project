import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Roadmap, RoadmapData } from '../types/api';
import {
  Map,
  Search,
  BookOpen,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Brain,
  History,
  AlertCircle,
  CheckCircle2,
  Circle,
  Trophy,
  Loader2,
  X
} from 'lucide-react';

const RoadmapPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData | null>(null);
  const [currentRoadmapId, setCurrentRoadmapId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate progress
  const totalTopics = currentRoadmap?.phases.reduce((acc, p) => acc + p.topics.length, 0) || 0;
  const completedCount = currentRoadmap?.phases.reduce((acc, p) => {
    return acc + p.topics.filter(t => completedTopics.has(`${currentRoadmap.topic}-${p.name}-${t}`)).length;
  }, 0) || 0;
  const progressPercent = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);

  const toggleTopic = async (id: string) => {
    if (!currentRoadmapId) return;

    const next = new Set(completedTopics);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    
    setCompletedTopics(next);

    try {
      await apiService.saveRoadmapProgress(currentRoadmapId, Array.from(next));
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  // Fetch progress for selected roadmap
  const fetchProgress = async (id: string) => {
    try {
      const res = await apiService.getRoadmapProgress(id);
      if (res.completedTopics) {
        setCompletedTopics(new Set(res.completedTopics));
      } else {
        setCompletedTopics(new Set());
      }
    } catch (err) {
      console.error('Failed to fetch progress', err);
      setCompletedTopics(new Set());
    }
  };

  // Fetch previous roadmaps
  useEffect(() => {
    if (user) {
      fetchRoadmaps();
    }
  }, [user]);

  const fetchRoadmaps = async () => {
    try {
      const res = await apiService.getRoadmaps();
      if (res.roadmaps) {
        setRoadmaps(res.roadmaps);
        if (res.roadmaps.length > 0 && !currentRoadmapId) {
          setCurrentRoadmap(res.roadmaps[0].content);
          setCurrentRoadmapId(res.roadmaps[0].id);
          fetchProgress(res.roadmaps[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load past roadmaps', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!user) {
      setError('Please log in to generate a roadmap.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.generateRoadmap(topic);
      setCurrentRoadmap(response.roadmap.content);
      setCurrentRoadmapId(response.roadmap.id);
      setCompletedTopics(new Set()); // New roadmap has 0 progress
      
      // Update sidebar
      setRoadmaps((prev) => [response.roadmap, ...prev]);
      setTopic(''); // Clear input
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate roadmap. Please try a different topic.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (roadmap: Roadmap) => {
    setCurrentRoadmap(roadmap.content);
    setCurrentRoadmapId(roadmap.id);
    fetchProgress(roadmap.id);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row">
      {/* History Sidebar */}
      <div className={`${isSidebarOpen ? 'w-full md:w-64 border-b md:border-b-0 md:border-r' : 'hidden'} bg-[#0a0f1e] border-white/5 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
            <History className="w-5 h-5" />
            <span>Your Maps</span>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {roadmaps.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">No roadmaps yet.</p>
          ) : (
            roadmaps.map((rm) => (
              <button
                key={rm.id}
                onClick={() => handleSelectHistory(rm)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                  currentRoadmap?.topic === rm.content.topic
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="truncate">{rm.content.topic}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {new Date(rm.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Arena */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header/Input Section */}
        <div className="bg-[#0a0f1e] px-4 sm:px-6 py-6 sm:py-8 border-b border-white/5 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Sidebar toggle for mobile & desktop */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-all border border-white/5 shadow-sm active:scale-95"
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span>{isSidebarOpen ? 'Hide History' : 'Show History'}</span>
              </button>
            </div>

            <div className="text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center justify-center p-3 bg-indigo-500/15 rounded-full mb-4"
              >
                <Map className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">AI Learning Roadmap</h1>
              <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Tell us what you want to learn, and our AI will chart the course. From foundations to advanced projects, get a structured path in seconds.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="relative max-w-2xl mx-auto">
              {/* Outer glow/border wrapper */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-2xl sm:rounded-full blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full bg-[#0f172a] border border-white/10 group-focus-within:border-indigo-500/40 transition-all duration-300 shadow-2xl overflow-hidden p-2 sm:p-0">
                  <input
                    type="text"
                    className="w-full py-3.5 sm:py-5 px-4 sm:px-8 text-white outline-none text-base sm:text-lg bg-transparent placeholder-slate-600 font-medium"
                    placeholder="e.g. React, Python, Data Science, AWS..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={loading}
                  />
                  <div className="mt-2 sm:mt-0 sm:pr-2 shrink-0 flex">
                    <button
                      type="submit"
                      disabled={loading || !topic.trim()}
                      className="w-full sm:w-auto justify-center px-6 sm:px-10 py-3 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl sm:rounded-full transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center gap-2 rounded-xl max-w-2xl mx-auto"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Roadmap Display Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#020617] p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!currentRoadmap && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-20 text-slate-600"
                >
                  <Map className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg">Your learning path will appear here.</p>
                </motion.div>
              )}

              {currentRoadmap && (
                <motion.div
                  key="roadmap"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  {/* Title & Metadata */}
                  <div className="bg-[#0f172a] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5 shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-600" />

                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-6 gap-4">
                        <div>
                          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                            {currentRoadmap.topic}
                          </h2>
                          <div className="inline-flex items-center space-x-2 bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-sm font-semibold">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {currentRoadmap.estimatedTotalTime}</span>
                          </div>
                        </div>

                        {/* Progress Display */}
                        <div className="w-full md:w-auto bg-[#020617] border border-white/5 rounded-2xl p-4 md:min-w-[240px]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</span>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-2 text-right">{completedCount} of {totalTopics} topics fully learned</p>
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
                        {currentRoadmap.description}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Unified Timeline View */}
                  <div className="relative pl-4 sm:pl-8 lg:pl-12 py-8 max-w-4xl">
                    {/* Timeline line */}
                    <div className="absolute left-4 sm:left-8 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/30 to-transparent rounded-full" />

                    <div className="space-y-12">
                      {currentRoadmap.phases.map((phase, index) => {
                        // Card Phase calculation 
                        const isPhaseCompleted = phase.topics.every(t => completedTopics.has(`${currentRoadmap.topic}-${phase.name}-${t}`));
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 + 0.3 }}
                            className="relative flex flex-col group"
                          >
                            {/* Timeline dot */}
                            <div className="absolute -left-4 sm:-left-8 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#020617] border-4 border-indigo-500 transform -translate-x-1/2 mt-6 z-10 group-hover:scale-125 group-hover:border-purple-400 transition-all duration-300">
                              {isPhaseCompleted && <div className="absolute inset-0 bg-indigo-500 rounded-full m-0.5 animate-pulse" />}
                            </div>

                            {/* Main Card */}
                            <div className="ml-4 sm:ml-8 bg-[#0f172a] p-4 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl border border-white/5 hover:border-indigo-500/20 shadow-xl transition-all duration-500 relative overflow-hidden group-hover:-translate-y-1">
                               {/* Decorative bg */}
                               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full z-0 pointer-events-none" />

                               <div className="relative z-10">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                                    <div>
                                      <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase shadow-sm">
                                        {phase.level}
                                      </div>
                                      <h3 className="text-xl font-bold text-white leading-tight">{phase.name}</h3>
                                    </div>
                                    <div className="mt-3 md:mt-0 inline-flex items-center text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-sm">
                                      <Clock className="w-4 h-4 mr-2 text-purple-400" />
                                      {phase.duration}
                                    </div>
                                  </div>
                                  
                                  {/* Topics Grid with Checkboxes */}
                                  <div className="mb-8">
                                    <h4 className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                      <BookOpen className="w-4 h-4 mr-2 text-indigo-400" /> Modules
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {phase.topics.map((item, i) => {
                                        const topicId = `${currentRoadmap.topic}-${phase.name}-${item}`;
                                        const isDone = completedTopics.has(topicId);
                                        return (
                                          <motion.div 
                                            key={i}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className={`flex flex-col p-4 rounded-xl border-2 transition-all shadow-sm ${
                                              isDone
                                                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-indigo-500/10'
                                                : 'bg-white/[0.03] border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                                            }`}>
                                            <label className="flex items-start cursor-pointer w-full">
                                              <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isDone}
                                                onChange={() => toggleTopic(topicId)}
                                              />
                                              <div className="mr-3 mt-0.5 shrink-0 transition-transform hover:scale-110 active:scale-95">
                                                {isDone ? (
                                                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                                ) : (
                                                  <Circle className="w-5 h-5 text-slate-600" />
                                                )}
                                              </div>
                                              <span className={`text-sm leading-snug transition-colors flex-1 ${isDone ? 'text-indigo-200 font-medium' : 'text-slate-400'}`}>
                                                {item}
                                              </span>
                                            </label>
                                            <div className="mt-3 ml-8 flex">
                                              <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  navigate(`/tutor?topic=${encodeURIComponent(item)}&autoStart=true&roadmapId=${currentRoadmapId}&topicId=${encodeURIComponent(topicId)}`);
                                                }}
                                                className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20 hover:border-indigo-500/40 shadow-sm"
                                              >
                                                <Brain className="w-3 h-3 mr-1.5" />
                                                Learn with AI
                                              </motion.button>
                                            </div>
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Projects Segment */}
                                  {phase.projects && phase.projects.length > 0 && (
                                    <div className="bg-purple-500/10 rounded-2xl p-5 border border-purple-500/20 relative overflow-hidden">
                                      <div className="absolute right-0 bottom-0 opacity-5">
                                        <Briefcase className="w-24 h-24 translate-x-4 translate-y-4" />
                                      </div>
                                      <h4 className="flex items-center font-bold text-purple-300 mb-3 text-xs uppercase tracking-wider relative z-10">
                                        <Briefcase className="w-4 h-4 text-purple-400 mr-2" /> Practical Implementation
                                      </h4>
                                      <ul className="space-y-2 relative z-10">
                                        {phase.projects.map((proj, i) => (
                                          <li key={i} className="text-sm text-slate-300 flex items-start bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="flex items-center justify-center bg-gradient-to-b from-indigo-500 to-purple-500 text-white w-6 h-6 rounded-lg shrink-0 mr-3 text-xs font-bold">
                                              {i + 1}
                                            </span>
                                            <span className="pt-0.5">{proj}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                               </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* End marker / Trophy */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: progressPercent === 100 ? 1 : 0.6, scale: progressPercent === 100 ? 1 : 0.95 }}
                    className="mt-12 text-center pb-12 transition-all duration-700"
                  >
                    <div className={`inline-flex items-center justify-center p-6 rounded-full mb-4 shadow-lg relative overflow-hidden ${
                      progressPercent === 100 ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 shadow-amber-500/20' : 'bg-white/5 border border-white/5'
                    }`}>
                      <Trophy className={`w-10 h-10 ${progressPercent === 100 ? 'text-amber-400' : 'text-slate-600'}`} />
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${progressPercent === 100 ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500' : 'text-slate-600'}`}>
                      {progressPercent === 100 ? "You've Mastered This!" : "Keep learning to unlock your Mastery!"}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto text-sm">
                      {progressPercent === 100
                        ? 'Congratulations on fully completing your roadmap. You are ready for the next adventure.'
                        : 'Complete the topics above to fill up your progress bar.'}
                    </p>
                  </motion.div>
                  
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
