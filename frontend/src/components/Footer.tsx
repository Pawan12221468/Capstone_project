import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Mail, FileText, Shield, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020617] border-t border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                Knowledge Scout
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Transform documents into intelligent conversations.
              Discover insights, ask questions, and collaborate seamlessly.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://github.com/knowledge-scout"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@knowledgescout.com"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 mb-5">Product</h3>
            <ul className="space-y-3">
              {[
                { to: '/upload',    label: 'Upload Documents' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/features',  label: 'Features' },
                { to: '/pricing',   label: 'Pricing' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-500 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 mb-5">Resources</h3>
            <ul className="space-y-3">
              {[
                { href: '/docs', label: 'Documentation', icon: FileText },
                { href: '/help', label: 'Help Center',   icon: HelpCircle },
                { href: '/api',  label: 'API Reference', icon: null },
                { href: '/blog', label: 'Blog',          icon: null },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a href={href} className="flex items-center space-x-2 text-slate-500 hover:text-white text-sm transition-colors">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-400 mb-5">Legal</h3>
            <ul className="space-y-3">
              {[
                { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                { href: '/terms',   label: 'Terms of Service', icon: null },
                { href: '/security',label: 'Security', icon: null },
                { href: '/cookies', label: 'Cookie Policy', icon: null },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a href={href} className="flex items-center space-x-2 text-slate-500 hover:text-white text-sm transition-colors">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              © 2024 Knowledge Scout. All rights reserved.
            </p>
            <div className="flex space-x-6">
              {['Status', 'Contact'].map((label) => (
                <a
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  className="text-slate-600 hover:text-slate-300 text-sm transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
