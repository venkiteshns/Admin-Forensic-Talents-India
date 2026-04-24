import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_refresh_token', data.refreshToken);
        localStorage.setItem('admin_name',  data.admin.name);
        localStorage.setItem('admin_email', data.admin.email);
        navigate('/dashboard', { replace: true });
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md">

        {/* Logo + Title */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex items-center justify-center">
            <img src="/logo.png" alt="Forensic Talents" className="h-[72px] object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin Portal</h1>
          <p className="mt-1.5 text-sm font-medium text-slate-400">Forensic Talents India</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700 bg-[#1e293b] p-8 shadow-2xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                placeholder="admin@forensic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white shadow transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-700/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating…
                </span>
              ) : 'Login to Dashboard'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-slate-600">
          Authorised personnel only · Forensic Talents India
        </p>
      </div>
    </div>
  );
}
