import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Upload, MessageSquare, BarChart3, ArrowRight, Play,
  Star, Zap, Map, GraduationCap, FileText, CheckSquare,
  Sparkles, ChevronRight
} from 'lucide-react';

interface HomePageProps {
  onOpenDemo: () => void;
}

const FEATURE_CARDS = [
  {
    icon: Map,
    title: 'AI Roadmaps',
    description: 'Generate personalized learning paths from beginner to expert on any topic in seconds.',
    path: '/roadmap',
    gradient: 'from-indigo-500 to-blue-600',
    border: 'border-indigo-500/20 hover:border-indigo-500/50',
    glow: 'hover:shadow-indigo-500/20',
    badge: 'Powered by Gemini',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    iconColor: 'text-indigo-400',
  },
  {
    icon: GraduationCap,
    title: 'AI Tutor',
    description: 'Have interactive learning conversations with an AI that adapts to your pace and style.',
    path: '/tutor',
    gradient: 'from-purple-500 to-violet-600',
    border: 'border-purple-500/20 hover:border-purple-500/50',
    glow: 'hover:shadow-purple-500/20',
    badge: 'Conversational AI',
    badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  {
    icon: FileText,
    title: 'Smart Notes',
    description: 'Upload any document and instantly extract summaries, key points, and semantic keywords.',
    path: '/upload',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/20 hover:border-emerald-500/50',
    glow: 'hover:shadow-emerald-500/20',
    badge: 'Auto-Extract',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    icon: CheckSquare,
    title: 'Quiz Generator',
    description: 'Auto-generate 5-question MCQ quizzes on any topic with instant scoring and feedback.',
    path: '/quiz',
    gradient: 'from-rose-500 to-pink-600',
    border: 'border-rose-500/20 hover:border-rose-500/50',
    glow: 'hover:shadow-rose-500/20',
    badge: 'Instant Results',
    badgeColor: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    iconColor: 'text-rose-400',
  },
];


const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const HomePage: React.FC<HomePageProps> = ({ onOpenDemo }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Ambient blobs */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-5 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered EdTech Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              Learn Smarter with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                AI Intelligence
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload documents, generate roadmaps, get tutored by AI, and test your knowledge — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signup"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all text-base"
                >
                  <Zap className="w-5 h-5" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <button
                  onClick={onOpenDemo}
                  className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16"
          >
            {[
              { value: '10K+', label: 'Documents Processed' },
              { value: '95%',  label: 'Accuracy Rate' },
              { value: '2s',   label: 'Avg Response Time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Core Features</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                Everything you need to{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">level up</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Four powerful AI-driven tools designed to make learning faster, smarter, and more enjoyable.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                onClick={() => navigate(card.path)}
                className={`group relative cursor-pointer bg-[#0f172a] rounded-3xl p-7 border ${card.border} shadow-lg hover:shadow-2xl ${card.glow} transition-all duration-300 flex flex-col overflow-hidden`}
              >
                {/* Gradient top line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Badge */}
                <div className={`self-start mb-5 px-3 py-1 rounded-full text-xs font-bold ${card.badgeColor}`}>
                  {card.badge}
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{card.description}</p>

                <div className={`mt-6 flex items-center space-x-1 text-sm font-semibold ${card.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0`}>
                  <span>Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA Banner ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white p-12 text-center shadow-2xl shadow-indigo-500/30"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to transform how you learn?</h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students and educators already using Knowledge Scout to accelerate their learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/signup"
                    className="inline-flex items-center space-x-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all"
                  >
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
