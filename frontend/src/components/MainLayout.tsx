import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, BookOpen } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    in:      { opacity: 1, y: 0,  scale: 1    },
    out:     { opacity: 0, y: -10, scale: 1.02 },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.3,
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden w-full font-sans text-white">

      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 bg-[#020617]">

        {/* Mobile Header */}
        <header className="md:hidden bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0 z-30 sticky top-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              Knowledge Scout
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
