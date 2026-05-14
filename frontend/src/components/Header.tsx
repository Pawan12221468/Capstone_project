import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Menu, X, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <motion.header
      className="bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
              Knowledge Scout
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {[
              { to: '/',                label: 'Home' },
              { to: '/upload',          label: 'Upload' },
              { to: '/dashboard',       label: 'Dashboard' },
              { to: '/roadmap',         label: 'Roadmap' },
              { to: '/tutor',           label: 'AI Tutor' },
              { to: '/quiz',            label: 'Quiz' },
              { to: '/about',           label: 'About' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
            <Link
              to="/teacher/dashboard"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
            >
              Teacher Portal
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-indigo-500/50"
                  />
                  <span className="text-slate-300 font-medium text-sm">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 text-slate-400 hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-white/5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-1">
              {[
                { to: '/',                  label: 'Home' },
                { to: '/upload',            label: 'Upload' },
                { to: '/dashboard',         label: 'Dashboard' },
                { to: '/roadmap',           label: 'Roadmap' },
                { to: '/tutor',             label: 'AI Tutor' },
                { to: '/quiz',              label: 'Quiz' },
                { to: '/about',             label: 'About' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/teacher/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Teacher Portal
              </Link>

              <div className="pt-3 mt-2 border-t border-white/5 space-y-2">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 text-slate-300">
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                      <span className="font-medium text-sm">{user.name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="btn-primary inline-block text-sm mx-3"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
