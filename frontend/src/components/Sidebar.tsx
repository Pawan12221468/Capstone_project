import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, LayoutDashboard, UploadCloud, GraduationCap, 
  CheckSquare, LogOut, ChevronLeft, ChevronRight, Presentation
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  let navItems = [
    { name: 'Dashboard',   path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Learning', path: '/roadmap',   icon: Presentation },
    { name: 'Upload Docs', path: '/upload',    icon: UploadCloud },
    { name: 'AI Tutor',    path: '/tutor',     icon: GraduationCap },
    { name: 'Quizzes',     path: '/quiz',      icon: CheckSquare },
  ];

  if (user?.role === 'teacher') {
    navItems = [
      navItems[0],
      { name: 'Teacher Portal', path: '/teacher/dashboard', icon: BookOpen },
      ...navItems.slice(1),
    ];
  }

  const sidebarVariants: Variants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' },
  };

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`;

  const SidebarContent = (
    <>
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 shrink-0 z-50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-white"
            >
              Knowledge Scout
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar z-50 relative">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className="relative group flex items-center p-3 rounded-xl transition-all duration-300"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div className={`relative flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-4'}`}>
                <item.icon
                  className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${
                    isActive
                      ? 'text-indigo-300'
                      : 'text-indigo-200 group-hover:text-white group-hover:scale-110 transition-all duration-300'
                  }`}
                />

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className={`font-medium whitespace-nowrap ${
                        isActive ? 'text-white' : 'text-indigo-100 group-hover:text-white'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/10 shrink-0 z-50 relative">
        <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col space-y-4' : 'justify-between'}`}>
          <div className={`flex items-center ${!isCollapsed ? 'space-x-3' : ''}`}>
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-indigo-400"
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white truncate max-w-[120px]">{user?.name}</span>
                <span className="text-xs text-indigo-300 capitalize">{user?.role || 'student'}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-[#0F172A] to-[#311C6B] z-50 flex flex-col shadow-2xl md:hidden overflow-hidden border-r border-white/10"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className="hidden md:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-[#0F172A] to-[#311C6B] border-r border-white/5 shadow-2xl overflow-hidden z-40"
      >
        {SidebarContent}

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-indigo-600 text-white rounded-full p-1 shadow-lg hover:bg-indigo-500 hover:scale-110 transition-all z-50 border-2 border-[#0F172A]"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
