import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Lightbulb, Shield, Heart, ArrowRight } from 'lucide-react';

const teamMembers = [
  { name: 'Sarah Chen',        role: 'CEO & Co-Founder',     bio: 'Former AI researcher at Stanford with 10+ years in machine learning and NLP.', avatar: 'SC', color: 'from-sky-500 to-blue-600' },
  { name: 'Michael Rodriguez', role: 'CTO & Co-Founder',     bio: 'Full-stack engineer with expertise in scalable systems. Previously at Google.',  avatar: 'MR', color: 'from-emerald-500 to-teal-600' },
  { name: 'Dr. Emily Watson',  role: 'Head of AI Research',  bio: 'PhD in CS, specializing in document understanding and knowledge extraction.',    avatar: 'EW', color: 'from-purple-500 to-violet-600' },
  { name: 'David Kim',         role: 'Head of Product',      bio: 'Product strategist with 8+ years building user-centric AI applications.',         avatar: 'DK', color: 'from-amber-500 to-orange-600' },
];

const values = [
  { icon: Lightbulb, title: 'Innovation',    description: "We constantly push the boundaries of what's possible with AI and document understanding.", color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/20' },
  { icon: Users,     title: 'Collaboration', description: 'We believe knowledge is best when shared and built together with our community.',            color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/20' },
  { icon: Shield,    title: 'Privacy',       description: 'Your documents and data are protected with enterprise-grade security and privacy controls.',  color: 'text-emerald-400',bg: 'bg-emerald-500/15 border-emerald-500/20' },
  { icon: Heart,     title: 'Accessibility', description: "We're committed to making knowledge accessible to everyone, regardless of background.",       color: 'text-rose-400',   bg: 'bg-rose-500/15 border-rose-500/20' },
];

const milestones = [
  { year: '2024', title: 'Knowledge Scout Founded',    description: 'Started with a vision to democratize document intelligence' },
  { year: '2024', title: 'First AI Model Deployed',   description: 'Launched our proprietary document understanding system' },
  { year: '2024', title: '10,000+ Documents Processed', description: 'Reached our first major milestone in document processing' },
  { year: '2024', title: 'Team Collaboration Features', description: 'Added advanced collaboration and sharing capabilities' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617]">

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About Knowledge Scout</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to transform how the world interacts with documents, making every piece of knowledge accessible, searchable, and conversational.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-slate-400 mb-5 leading-relaxed">
                Knowledge Scout was born from a simple yet powerful idea: what if every document could become an intelligent conversation partner? We believe the future of knowledge work lies in dynamic, interactive experiences that help people discover insights faster.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Our mission is to democratize access to intelligent document analysis, making advanced AI capabilities available to researchers, students, professionals, and organizations of all sizes.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#0f172a] border border-indigo-500/20 rounded-2xl p-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                To create a world where every document becomes a gateway to deeper understanding, where knowledge flows freely between people and ideas, and where the barriers between information and insight are eliminated.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">What We Stand For</span>
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-slate-400 max-w-xl mx-auto">The principles that guide everything we do at Knowledge Scout</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#0f172a] border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 text-center transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl border ${v.bg} flex items-center justify-center mx-auto mb-4`}>
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">The People</span>
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-slate-400 max-w-xl mx-auto">The passionate people behind Knowledge Scout</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#0f172a] border border-white/5 hover:border-indigo-500/20 rounded-2xl p-6 text-center transition-all duration-300">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.color} text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {m.avatar}
                </div>
                <h3 className="text-base font-bold text-white mb-1">{m.name}</h3>
                <p className="text-indigo-400 font-medium text-sm mb-3">{m.role}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{m.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">History</span>
            <h2 className="text-3xl font-bold text-white mb-4">Our Journey</h2>
            <p className="text-slate-400">Key milestones in our mission to revolutionize document intelligence</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-indigo-500/50 to-transparent" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`flex items-center ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${i % 2 === 0 ? 'pr-10 text-right' : 'pl-10 text-left'}`}>
                    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 inline-block">
                      <div className="text-indigo-400 font-bold text-sm mb-1">{m.year}</div>
                      <h3 className="text-base font-bold text-white mb-1">{m.title}</h3>
                      <p className="text-slate-400 text-sm">{m.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-3 h-3 bg-indigo-500 rounded-full border-4 border-[#0a0f1e] shadow-lg shadow-indigo-500/50" />
                  <div className="w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 p-12 text-center shadow-2xl shadow-indigo-500/30">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">Knowledge Scout by the Numbers</h2>
              <p className="text-indigo-100 mb-12">The impact we're making in document intelligence</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '10K+', label: 'Documents Processed' },
                  { value: '95%',  label: 'Accuracy Rate' },
                  { value: '1.2s', label: 'Avg Response Time' },
                  { value: '99.9%',label: 'Uptime' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-4xl font-extrabold text-white mb-1">{value}</div>
                    <div className="text-indigo-200 text-sm">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to join our mission?</h2>
            <p className="text-lg text-slate-400 mb-8">Start transforming your documents into intelligent conversations today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-base px-8 py-4">
                Get Started Free <ArrowRight className="w-5 h-5 ml-1" />
              </button>
              <button className="btn-secondary text-base px-8 py-4">Contact Us</button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
