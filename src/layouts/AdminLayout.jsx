import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, UserCheck, HelpCircle,
  FolderOpen, LogOut, Menu, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard',   path: '/dashboard',  icon: LayoutDashboard },
  { name: 'Courses',     path: '/courses',     icon: BookOpen },
  { name: 'Internships', path: '/internships', icon: UserCheck },
  { name: 'Quiz',        path: '/quiz',        icon: HelpCircle },
  { name: 'Resources',   path: '/resources',   icon: FolderOpen },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const adminName  = localStorage.getItem('admin_name')  || 'Admin';
  const adminEmail = localStorage.getItem('admin_email') || '';
  const initials   = adminName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => { if (!localStorage.getItem('admin_token')) navigate('/login'); }, [navigate]);
  useEffect(() => { setMobileSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    ['admin_token', 'admin_name', 'admin_email'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-slate-700/60 ${collapsed && !mobile ? 'justify-center px-3 py-4' : 'px-5 py-4'}`}>
        <img
          src="/logo.png"
          alt="Forensic Talents"
          className={`object-contain flex-shrink-0 transition-all duration-300 ${collapsed && !mobile ? 'h-9 w-9' : 'h-12 w-12'}`}
        />
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white leading-tight">Forensic Talents</p>
            <p className="truncate text-[10px] text-slate-500">India Admin Panel</p>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto text-slate-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ name, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={name}
              to={path}
              title={collapsed && !mobile ? name : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
                ${active ? 'bg-blue-700/20 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'}
                ${collapsed && !mobile ? 'justify-center' : ''}
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-400' : ''}`} />
              {(!collapsed || mobile) && <span>{name}</span>}
              {active && (!collapsed || mobile) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-700/60 p-3 space-y-1">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-700/30 text-xs font-bold text-blue-300">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-300">{adminName}</p>
              <p className="truncate text-[10px] text-slate-500">{adminEmail}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-red-900/20 hover:text-red-400 ${collapsed && !mobile ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f172a]">
      {/* Desktop Sidebar */}
      <aside
        className="relative hidden flex-shrink-0 flex-col bg-[#0c1322] md:flex transition-all duration-300 ease-in-out border-r border-slate-700/40"
        style={{ width: collapsed ? '4.5rem' : '15rem' }}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#0c1322] text-slate-400 shadow transition-colors hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50 flex h-full w-60 flex-col bg-[#0c1322] border-r border-slate-700/40" style={{ animation: 'slideInLeft .25s ease' }}>
            <SidebarContent mobile />
          </div>
          <style>{`@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 border-b border-slate-700/40 bg-[#0c1322] px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
              <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain md:hidden" />
              <h2 className="text-base font-semibold text-slate-100 capitalize">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight text-slate-200">{adminName}</p>
                <p className="text-xs text-slate-500">{adminEmail}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#0f172a] p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
