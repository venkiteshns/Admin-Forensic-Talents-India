import { useState, useEffect } from 'react';
import { BookOpen, UserCheck, HelpCircle, FolderOpen, TrendingUp, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [counts, setCounts] = useState({ courses: '—', internships: '—', resources: '—' });
  const [quiz, setQuiz]     = useState(null);
  const adminName = localStorage.getItem('admin_name') || 'Admin';

  useEffect(() => {
    Promise.allSettled([
      api.get('/courses'),
      api.get('/internships'),
      api.get('/quiz/latest'),
      api.get('/resources'),
    ]).then(([c, i, q, r]) => {
      setCounts({
        courses:     c.status === 'fulfilled' ? c.value.data.length : '—',
        internships: i.status === 'fulfilled' ? i.value.data.length : '—',
        resources:   r.status === 'fulfilled' ? r.value.data.length : '—',
      });
      if (q.status === 'fulfilled') setQuiz(q.value.data);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { title: 'Total Courses',    value: counts.courses,     icon: BookOpen,   from: 'from-blue-700',    to: 'to-blue-600' },
    { title: 'Internship Plans', value: counts.internships, icon: UserCheck,  from: 'from-indigo-700',  to: 'to-indigo-600' },
    {
      title: 'Quiz Status',
      value: quiz ? (quiz.isVisible ? 'Live' : 'Hidden') : 'None',
      icon:  quiz?.isVisible ? Eye : EyeOff,
      from:  quiz?.isVisible ? 'from-emerald-700' : 'from-slate-600',
      to:    quiz?.isVisible ? 'to-emerald-600'   : 'to-slate-500',
    },
    { title: 'Resources', value: counts.resources, icon: FolderOpen, from: 'from-amber-700', to: 'to-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6">
        <div>
          <p className="text-sm text-slate-500">{greeting},</p>
          <h1 className="mt-0.5 text-2xl font-bold text-white">{adminName} 👋</h1>
          <p className="mt-1 text-sm text-slate-400">Here's your live panel overview.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Live Dashboard</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-[#1e293b] p-5 transition-all duration-200 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.from} ${s.to} shadow`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.title}</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-100">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Quiz card */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz Status</p>
          {quiz ? (
            <>
              <p className="text-base font-bold text-slate-100">{quiz.title}</p>
              <p className="mt-1 text-sm text-slate-400">{quiz.description}</p>
              <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${quiz.isVisible ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {quiz.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {quiz.isVisible ? 'Visible to users' : 'Hidden from users'}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">No quiz configured yet.</p>
          )}
        </div>

        {/* System info */}
        <div className="rounded-2xl border border-slate-700/50 bg-[#1e293b] p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">System Info</p>
          <div className="space-y-3">
            {[
              { label: 'Platform',   val: 'Forensic Talents India' },
              { label: 'Role',       val: 'Super Admin' },
              { label: 'Last login', val: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-200">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
