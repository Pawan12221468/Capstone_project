import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  FileText, Map, GraduationCap, BarChart3, Clock,
  Flame, CheckCircle, Trophy, Activity, ChevronRight
} from 'lucide-react';
import { UserStats, RoadmapProgressRecord } from '../types/api';

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  lastAccessed: string;
  status: 'processed' | 'processing' | 'error';
  summary: string;
  tags: string[];
  isFavorite: boolean;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [documents, setDocuments]         = useState<Document[]>([]);
  const [loading, setLoading]             = useState(true);
  const [userStats, setUserStats]         = useState<UserStats | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgressRecord[]>([]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      const transformedDocs: Document[] = response.documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.mimeType?.includes('pdf') ? 'PDF' : doc.mimeType?.includes('docx') ? 'DOCX' : doc.mimeType?.includes('txt') ? 'TXT' : 'Unknown',
        size: `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
        lastAccessed: 'Just now',
        status: doc.status === 'completed' ? 'processed' : doc.status === 'processing' ? 'processing' : 'error',
        summary: doc.summary || 'No summary available',
        tags: [],
        isFavorite: false,
      }));
      setDocuments(transformedDocs);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatsAndProgress = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        apiService.getUserStats(),
        apiService.getProgress(),
      ]);
      setUserStats(statsRes.stats);
      setRoadmapProgress(progressRes.progress);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    if (user) { fetchDocuments(); fetchStatsAndProgress(); }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden && user) fetchDocuments(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const pendingTopicsCount = roadmapProgress.reduce(
    (total, curr) => total + (curr.totalTopics - curr.completedTopics.length), 0
  );

  const stats = {
    totalDocuments:  userStats?.documentCount ?? 0,
    topicsCompleted: userStats?.totalTopicsCompleted ?? 0,
    streak:          userStats?.streak ?? 0,
    pendingTopics:   pendingTopicsCount,
  };

  const progressPct = Math.min(100,
    stats.topicsCompleted > 0
      ? Math.round((stats.topicsCompleted / Math.max(stats.topicsCompleted + stats.pendingTopics, 1)) * 100)
      : 0
  );

  return (
    <div className="min-h-screen bg-[#020617] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── SECTION 1: Welcome + Continue Learning ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Welcome Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-8 text-white shadow-2xl shadow-indigo-500/20"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-indigo-200 text-sm font-medium">Good day! 👋</p>
                  <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!</h1>
                </div>
              </div>
              <p className="text-indigo-100 text-lg leading-relaxed">
                You're making great progress. Keep up the momentum and reach your learning goals!
              </p>
              <div className="flex items-center flex-wrap gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm">
                  Upload Document
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/roadmap')}
                  className="bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-sm">
                  My Learning Path
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Continue Learning Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Continue Learning</h2>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              {roadmapProgress.length > 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">Last Active</p>
                  <p className="text-white font-bold line-clamp-1">{roadmapProgress[0]?.topic || 'Learning Path'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex-1 bg-amber-500/20 rounded-full h-2 mr-3">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.round((roadmapProgress[0]?.completedTopics?.length / (roadmapProgress[0]?.totalTopics || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {Math.round((roadmapProgress[0]?.completedTopics?.length / (roadmapProgress[0]?.totalTopics || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-4 text-center">
                  <Map className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No active learning path yet</p>
                </div>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/roadmap')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2">
              <span>{roadmapProgress.length > 0 ? 'Resume Learning' : 'Start a Roadmap'}</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* ── SECTION 2: Progress + Stats ── */}
        <div className="space-y-6">
          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Overall Learning Progress</h2>
                <p className="text-sm text-slate-400">Your journey across all topics</p>
              </div>
              <div className="flex items-center space-x-2 bg-indigo-500/15 text-indigo-300 px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-500/20">
                <Activity className="w-4 h-4" />
                <span>{stats.topicsCompleted} completed</span>
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.3, ease: 'easeOut', delay: 0.4 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 rounded-full shadow-sm shadow-indigo-500/50"
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-600">0%</span>
              <span className="text-sm font-bold text-indigo-400">{progressPct}% Complete</span>
              <span className="text-xs text-slate-600">100%</span>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Completed Topics', value: stats.topicsCompleted, icon: CheckCircle, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', bar: 'from-emerald-400 to-teal-500', delay: 0.25 },
              { label: 'Pending Topics',   value: stats.pendingTopics,   icon: Clock,        iconBg: 'bg-amber-500/15',   iconColor: 'text-amber-400',  bar: 'from-amber-400 to-orange-500', delay: 0.3 },
              { label: 'Total Documents', value: stats.totalDocuments,  icon: FileText,     iconBg: 'bg-indigo-500/15',  iconColor: 'text-indigo-400', bar: 'from-indigo-400 to-blue-500',  delay: 0.35 },
              { label: 'Learning Streak', value: `${stats.streak} 🔥`,  icon: Trophy,       iconBg: 'bg-pink-500/15',    iconColor: 'text-pink-400',   bar: 'from-pink-400 to-purple-500',  delay: 0.4 },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.4, delay: s.delay, type: 'spring', stiffness: 300, damping: 22 }}
                className="bg-[#0f172a] border border-white/5 hover:border-indigo-500/20 rounded-3xl p-6 shadow-xl flex flex-col transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <p className="text-3xl font-extrabold text-white mb-1">{s.value}</p>
                <p className="text-xs font-medium text-slate-500 mb-4">{s.label}</p>
                <div className={`h-1 w-full rounded-full bg-gradient-to-r ${s.bar} mt-auto opacity-60`} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: Recent Topics + Recent Documents ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

          {/* Recent Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
            className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                  <Map className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-white">Recent Topics</h2>
              </div>
              <button onClick={() => navigate('/roadmap')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 transition-colors">
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {roadmapProgress.length > 0 ? (
              <div className="space-y-2">
                {roadmapProgress.slice(0, 4).map((item, idx) => {
                  const pct = Math.round((item.completedTopics.length / Math.max(item.totalTopics, 1)) * 100);
                  return (
                    <motion.div
                      key={item.roadmapId}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.08 }}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate('/roadmap')}
                      className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pct === 100 ? 'bg-emerald-500/15' : 'bg-indigo-500/15'}`}>
                        {pct === 100
                          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                          : <BarChart3 className="w-5 h-5 text-indigo-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{item.topic}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-white/5 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <Map className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">No learning topics yet</p>
                <p className="text-xs text-slate-600 mt-1">Generate a roadmap to start tracking</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/roadmap')}
                  className="mt-4 btn-primary text-sm">
                  Create Roadmap
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-[#0f172a] border border-white/5 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-base font-bold text-white">Recent Documents</h2>
              </div>
              <button onClick={() => navigate('/upload')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 transition-colors">
                <span>Upload New</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-3 rounded-2xl bg-white/5">
                    <div className="w-10 h-10 bg-white/5 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-white/5 rounded-full w-3/4" />
                      <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">No documents yet</p>
                <p className="text-xs text-slate-600 mt-1">Upload your first document to begin</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="mt-4 btn-primary text-sm">
                  Upload Document
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc, idx) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + idx * 0.07 }}
                    whileHover={{ x: -3, scale: 1.01 }}
                    onClick={() => navigate(`/document/${doc.id}`)}
                    className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group border border-transparent hover:border-white/5"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.status === 'processed' ? 'bg-purple-500/15' :
                      doc.status === 'processing' ? 'bg-amber-500/15' : 'bg-red-500/15'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        doc.status === 'processed' ? 'text-purple-400' :
                        doc.status === 'processing' ? 'text-amber-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{doc.title}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-slate-500">{doc.type} · {doc.size}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.status === 'processed'  ? 'bg-emerald-500/15 text-emerald-400' :
                          doc.status === 'processing' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'
                        }`}>
                          {doc.status === 'processed' ? 'Ready' : doc.status === 'processing' ? 'Processing' : 'Error'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
