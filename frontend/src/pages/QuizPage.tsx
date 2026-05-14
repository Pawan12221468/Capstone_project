import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { QuizData, QuizQuestion } from '../types/api';
import {
  Brain, Search, CheckCircle, XCircle, ChevronRight,
  Trophy, RefreshCcw, AlertCircle, Sparkles, RotateCcw,
  Loader2
} from 'lucide-react';

const QuizPage: React.FC = () => {
  const { user } = useAuth();

  const [topic, setTopic]                       = useState('');
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<string | null>(null);
  const [quizData, setQuizData]                 = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption]     = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore]                       = useState(0);
  const [quizFinished, setQuizFinished]         = useState(false);
  const [difficulty, setDifficulty]             = useState<'Easy'|'Medium'|'Hard'>('Medium');
  const [generatingMore, setGeneratingMore]     = useState(false);
  const [isGeneratingLock, setIsGeneratingLock] = useState(false);
  const generateDebounceRef                     = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout to prevent memory leak
  useEffect(() => {
    return () => {
      if (generateDebounceRef.current) clearTimeout(generateDebounceRef.current);
    };
  }, []);

  const handleGenerate = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() || isGeneratingLock) return;
    if (!user) { setError('Please log in to generate a quiz.'); return; }
    
    setIsGeneratingLock(true);
    setLoading(true); setError(null); setQuizData(null);
    setCurrentQuestionIndex(0); setScore(0); setQuizFinished(false);
    setSelectedOption(null); setIsAnswerRevealed(false);
    
    try {
      const response = await apiService.generateQuiz(topic, [], difficulty);
      if (response?.quiz) setQuizData(response.quiz);
      else throw new Error('Invalid response from server');
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
      // Wait 1.5 seconds minimum before releasing the lock for fresh attempts
      if (generateDebounceRef.current) clearTimeout(generateDebounceRef.current);
      generateDebounceRef.current = setTimeout(() => {
        setIsGeneratingLock(false);
      }, 1500);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(option);
    setIsAnswerRevealed(true);
    if (quizData && option === quizData.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null); setIsAnswerRevealed(false);
    } else { setQuizFinished(true); }
  };

  const handleReset = () => {
    setQuizData(null); setTopic(''); setCurrentQuestionIndex(0);
    setScore(0); setQuizFinished(false); setSelectedOption(null); setIsAnswerRevealed(false);
    setDifficulty('Medium');
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
  };

  const handleGenerateMore = async () => {
    if (!quizData || !topic.trim()) return;
    setGeneratingMore(true); setError(null);
    try {
      const previousQuestions = quizData.questions.map(q => q.question);
      const response = await apiService.generateQuiz(topic, previousQuestions, difficulty);
      if (response?.quiz) {
        setQuizData(prev => prev ? {
          ...prev,
          questions: [...prev.questions, ...response.quiz.questions]
        } : response.quiz);
        setCurrentQuestionIndex(quizData.questions.length);
        setQuizFinished(false);
        setIsAnswerRevealed(false);
        setSelectedOption(null);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate more questions. Please try again.');
    } finally {
      setGeneratingMore(false);
    }
  };

  // ── Input Screen ──
  if (!quizData && !loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full relative z-10">
          <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">AI Quiz Generator</h1>
              <p className="text-indigo-100 max-w-lg mx-auto text-sm">
                Test your knowledge on any subject. Enter a topic, and our AI will instantly generate an interactive 10-question quiz.
              </p>
            </div>

            {/* Form & Error */}
            <div className="p-8">
              {error ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner shadow-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Quiz Generation Interrupted</h3>
                  <p className="text-slate-400 mb-8 text-sm px-4">{error}</p>
                  
                  <div className="flex sm:flex-row flex-col gap-3">
                    <button type="button" onClick={() => setError(null)} disabled={isGeneratingLock}
                      className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      Change Topic
                    </button>
                    <button type="button" onClick={handleGenerate} disabled={isGeneratingLock}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-lg shadow-red-500/20 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      <RotateCcw className="w-4 h-4 shrink-0" />
                      {isGeneratingLock ? 'Retrying...' : 'Retry Generation'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerate} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What would you like to be tested on?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                      <input
                        type="text"
                        className="input-field pl-11 py-4 text-base"
                        placeholder="e.g. JavaScript Closures, Quantum Physics, WW2..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Select Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setDifficulty(lvl)}
                          className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                            difficulty === lvl
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                              : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.05]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={!topic.trim() || isGeneratingLock}
                    className="btn-primary w-full py-4 text-base shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    {isGeneratingLock ? 'Firing up AI...' : 'Generate Quiz'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Loading Screen ──
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] py-12 px-4 flex flex-col items-center">
        <div className="flex flex-col items-center mb-10 mt-10">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white tracking-wide">Generating quiz questions...</h2>
          <p className="text-slate-400 text-sm mt-2">Our AI is drafting 10 tailored {difficulty.toLowerCase()} questions about "{topic}"</p>
        </div>
        <div className="max-w-4xl w-full">
          <div className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-xl p-8 sm:p-10 animate-pulse">
            <div className="h-8 bg-white/5 rounded-lg w-2/3 mb-12"></div>
            <div className="space-y-4">
              <div className="h-16 bg-white/[0.03] rounded-2xl w-full"></div>
              <div className="h-16 bg-white/[0.03] rounded-2xl w-full"></div>
              <div className="h-16 bg-white/[0.03] rounded-2xl w-full"></div>
              <div className="h-16 bg-white/[0.03] rounded-2xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (quizFinished) {
    const percentage = Math.round((score / quizData!.questions.length) * 100);
    const incorrectCount = quizData!.questions.length - score;
    const bgColor = percentage === 100 ? 'from-emerald-500 to-teal-600'
      : percentage >= 80 ? 'from-indigo-500 to-purple-600'
      : percentage >= 60 ? 'from-amber-400 to-orange-500'
      : 'from-red-500 to-rose-600';

    let performanceLevel = 'Beginner';
    if (percentage === 100) performanceLevel = 'Expert';
    else if (percentage >= 80) performanceLevel = 'Advanced';
    else if (percentage >= 60) performanceLevel = 'Intermediate';

    const feedback = percentage === 100 ? 'Perfect Score! Outstanding!'
      : percentage >= 80 ? 'Great Job! You really know your stuff.'
      : percentage >= 60 ? 'Good Effort! A little more study needed.'
      : 'Keep Learning! Practice makes perfect.';

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0f172a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className={`p-10 text-center text-white bg-gradient-to-br ${bgColor}`}>
            <Trophy className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-3xl font-bold mb-2">Quiz Complete</h2>
            <p className="text-white/80 font-medium">{feedback}</p>
          </div>
          <div className="p-10 text-center">
            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mb-4">Your Score</p>
            <motion.div initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="text-6xl font-black text-white mb-2">
              {score}<span className="text-3xl text-slate-500">/{quizData!.questions.length}</span>
            </motion.div>
            <p className="text-xl font-bold text-slate-400 mb-6">{percentage}%</p>

            <div className="flex justify-center gap-4 mb-6">
              <div className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {score} Correct
              </div>
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {incorrectCount} Incorrect
              </div>
            </div>

            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-sm font-bold text-white tracking-wide">
              <Brain className="w-4 h-4 text-indigo-400" />
              Skill Level: <span className="text-indigo-400">{performanceLevel}</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm mb-6 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {generatingMore ? (
              <div className="flex flex-col items-center justify-center py-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                  <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full mb-4" />
                </motion.div>
                <span className="text-indigo-300 font-medium">Drafting harder questions...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleGenerateMore}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 border border-indigo-400/20 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  Generate More
                </button>
                <button onClick={handleRetry}
                  className="flex-1 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 text-white hover:text-emerald-400 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-5 h-5 shrink-0" />
                  Retry
                </button>
                <button onClick={handleReset}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                  <Search className="w-5 h-5 shrink-0" />
                  New Topic
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Question Screen ──
  const currentQ = quizData!.questions[currentQuestionIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Quiz Topic</h2>
              <p className="text-lg font-bold text-white">{quizData?.topic}</p>
            </div>
            <span className="text-sm font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {currentQuestionIndex + 1} / {quizData!.questions.length}
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / quizData!.questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 50, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -50, scale: 0.95 }} transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden shadow-xl">

            <div className="p-8 sm:p-10 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">{currentQ.question}</h3>
            </div>

            <div className="p-8 sm:p-10 space-y-5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect  = option === currentQ.correctAnswer;

                let cls  = 'bg-white/5 border-white/10 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10';
                let icon = <div className="w-5 h-5 rounded-full border-2 border-white/20 mr-4 shrink-0" />;

                if (isAnswerRevealed) {
                  if (isCorrect) {
                    cls  = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300';
                    icon = <CheckCircle className="w-5 h-5 text-emerald-400 mr-4 shrink-0" />;
                  } else if (isSelected && !isCorrect) {
                    cls  = 'bg-red-500/10 border-red-500/50 text-red-300';
                    icon = <XCircle className="w-5 h-5 text-red-400 mr-4 shrink-0" />;
                  } else {
                    cls  = 'bg-white/[0.02] border-white/5 text-slate-600 opacity-60';
                    icon = <div className="w-5 h-5 rounded-full border-2 border-white/10 mr-4 shrink-0" />;
                  }
                } else if (isSelected) {
                  cls  = 'bg-indigo-500/15 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-indigo-100 scale-[1.01]';
                  icon = <div className="w-5 h-5 rounded-full border-[5px] border-indigo-400 mr-4 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />;
                }

                return (
                  <button key={idx} disabled={isAnswerRevealed} onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center text-sm font-semibold ${cls}`}>
                    {icon}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {isAnswerRevealed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-indigo-500/10 border-t border-indigo-500/20 p-8 sm:p-10">
                  <div className="flex items-start gap-3">
                    {selectedOption === currentQ.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold mb-2 text-sm ${selectedOption === currentQ.correctAnswer ? 'text-emerald-400' : 'text-red-400'}`}>
                        {selectedOption === currentQ.correctAnswer ? 'Correct!' : 'Incorrect!'}
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-sm">{currentQ.explanation}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleNext} className="btn-primary text-sm">
                      {currentQuestionIndex === quizData!.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
