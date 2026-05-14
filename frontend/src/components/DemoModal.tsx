import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Upload, MessageSquare, CheckCircle } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);

  const demoSteps = [
    { title: 'Upload Document',   description: 'Drag and drop your document or click to browse files',              icon: Upload,        content: 'Upload a PDF, DOC, or TXT file to get started' },
    { title: 'AI Processing',     description: 'Our AI extracts and analyzes the document content',                 icon: CheckCircle,   content: 'Document is processed and text is extracted with high accuracy' },
    { title: 'Start Q&A Session', description: 'Ask questions about your document in natural language',             icon: MessageSquare, content: 'Ask anything about the document content and get instant answers' },
  ];

  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) { setIsPlaying(false); clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 3000);
  };
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => { setCurrentStep(0); setIsPlaying(false); };
  const handleNext  = () => { if (currentStep < demoSteps.length - 1) setCurrentStep(p => p + 1); };
  const handlePrev  = () => { if (currentStep > 0) setCurrentStep(p => p - 1); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0f172a] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">Knowledge Scout Demo</h2>
                <p className="text-slate-400 text-sm">See how Knowledge Scout transforms your documents</p>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Steps */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Demo Steps</h3>
                  {demoSteps.map((step, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        idx === currentStep ? 'border-indigo-500/60 bg-indigo-500/10'
                        : idx < currentStep ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                      }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          idx === currentStep ? 'bg-indigo-500 text-white'
                          : idx < currentStep ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-slate-500'
                        }`}>
                          {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Preview */}
                <div className="bg-[#020617] border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={isPlaying ? handlePause : handlePlay}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={handleReset}
                        className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg transition-colors">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0f172a] border border-white/5 rounded-xl p-6 min-h-[260px] flex items-center justify-center text-center">
                    {React.createElement(demoSteps[currentStep].icon, { className: 'w-14 h-14 text-indigo-400 mx-auto mb-4' })}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{demoSteps[currentStep].title}</h4>
                      <p className="text-slate-400 text-sm mb-5">{demoSteps[currentStep].content}</p>
                      <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }} />
                      </div>
                      <p className="text-xs text-slate-600">Step {currentStep + 1} of {demoSteps.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                <button onClick={handlePrev} disabled={currentStep === 0} className="btn-secondary text-sm disabled:opacity-40">Previous</button>
                <div className="flex items-center gap-2">
                  {demoSteps.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentStep(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentStep ? 'bg-indigo-500 scale-125' : idx < currentStep ? 'bg-emerald-500' : 'bg-white/20'
                      }`} />
                  ))}
                </div>
                <button onClick={handleNext} disabled={currentStep === demoSteps.length - 1} className="btn-primary text-sm disabled:opacity-40">Next</button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white/[0.02] border-t border-white/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Ready to try it yourself?</p>
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="btn-secondary text-sm">Close Demo</button>
                  <button onClick={() => { onClose(); window.location.href = '/upload'; }} className="btn-primary text-sm">Try Now</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoModal;
