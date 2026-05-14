import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle, BarChart2, Plus, Settings,
  Search, Bell, MoreVertical, GraduationCap, ClipboardList, Target
} from 'lucide-react';

const MOCK_STUDENTS = [
  { id: '1', name: 'Alina Smith',    email: 'alina@example.com', progress: 85,  score: 92, status: 'active' },
  { id: '2', name: 'John Doe',       email: 'john@example.com',  progress: 60,  score: 78, status: 'active' },
  { id: '3', name: 'Sarah Connor',   email: 'sarah@example.com', progress: 100, score: 95, status: 'completed' },
  { id: '4', name: 'Michael Ross',   email: 'mike@example.com',  progress: 30,  score: 65, status: 'at-risk' },
  { id: '5', name: 'Jessica Day',    email: 'jess@example.com',  progress: 75,  score: 88, status: 'active' },
];

const MOCK_TASKS = [
  { id: 't1', title: 'Introduction to React Quiz', type: 'Quiz',     dueDate: 'Today',      assigned: 25, completed: 20 },
  { id: 't2', title: 'JavaScript Fundamentals',    type: 'Roadmap',  dueDate: 'Tomorrow',   assigned: 25, completed: 15 },
  { id: 't3', title: 'CSS Flexbox Guide',          type: 'Document', dueDate: 'Next Week',  assigned: 25, completed: 5  },
];

const STATS = [
  { label: 'Total Students',      value: '25',  icon: Users,         color: 'bg-blue-500/15 text-blue-400',   border: 'border-blue-500/20' },
  { label: 'Active Assignments',  value: '8',   icon: ClipboardList, color: 'bg-purple-500/15 text-purple-400', border: 'border-purple-500/20' },
  { label: 'Avg. Class Score',    value: '84%', icon: Target,        color: 'bg-emerald-500/15 text-emerald-400', border: 'border-emerald-500/20' },
];

const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments'>('overview');

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: BarChart2 },
    { id: 'students',     label: 'Students',     icon: Users },
    { id: 'assignments',  label: 'Assignments',  icon: ClipboardList },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#020617]">

      {/* Internal Sidebar */}
      <aside className="w-64 bg-[#0a0f1e] border-r border-white/5 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-bold text-white">Teacher Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                activeTab === id
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 font-medium text-sm transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <header className="bg-[#0a0f1e] border-b border-white/5 px-8 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-white capitalize">{activeTab}</h1>
          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search students or tasks..."
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-60"
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-slate-300 relative hover:bg-white/5 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#020617]">

          {/* Stats Row */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {STATS.map((stat, i) => (
                <div key={i} className={`bg-[#0f172a] p-6 rounded-2xl border ${stat.border} flex items-center space-x-4`}>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">{stat.label}</h3>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

            {/* Students Table */}
            {(activeTab === 'overview' || activeTab === 'students') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className={`bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden ${activeTab === 'overview' ? 'xl:col-span-2' : 'xl:col-span-3'}`}
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-base font-bold text-white">Student Roster</h2>
                  {activeTab === 'overview' && (
                    <button onClick={() => setActiveTab('students')} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      View All
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02]">
                        {['Student', 'Status', 'Progress', 'Avg Score'].map((h, i) => (
                          <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${i === 3 ? 'text-right' : ''}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_STUDENTS.map((student) => (
                        <tr key={student.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                              student.status === 'at-risk'   ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-white/5 rounded-full h-2 max-w-[100px]">
                                <div
                                  className={`h-2 rounded-full ${student.progress > 70 ? 'bg-emerald-500' : student.progress > 40 ? 'bg-blue-500' : 'bg-red-500'}`}
                                  style={{ width: `${student.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-400">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-bold text-white">{student.score}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Assignments */}
            {(activeTab === 'overview' || activeTab === 'assignments') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className={`bg-[#0f172a] rounded-2xl border border-white/5 overflow-hidden ${activeTab === 'overview' ? 'xl:col-span-1' : 'xl:col-span-3'}`}
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-base font-bold text-white">Assigned Tasks</h2>
                  <button className="text-slate-600 hover:text-slate-300 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-2">
                  <ul className="space-y-1">
                    {MOCK_TASKS.map((task) => (
                      <li key={task.id} className="p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {task.type === 'Quiz'
                              ? <CheckCircle className="w-5 h-5 text-indigo-400" />
                              : task.type === 'Roadmap'
                              ? <BookOpen className="w-5 h-5 text-emerald-400" />
                              : <ClipboardList className="w-5 h-5 text-amber-400" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{task.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs font-medium px-2 py-0.5 bg-white/5 text-slate-400 rounded-lg border border-white/5">{task.type}</span>
                              <span className="text-xs text-slate-500">Due {task.dueDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/5">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">Completion</span>
                            <span className="font-bold text-slate-300">{task.completed} / {task.assigned}</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${(task.completed / task.assigned) * 100}%` }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
