import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login({
        fullName: res.data.fullName,
        email: res.data.email,
        role: res.data.role
      }, res.data.token);
      toast.success(`Welcome back, ${res.data.fullName}! 🎉`);
      navigate('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-700 to-emerald-950 p-10 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                🐔
              </div>
              <div>
                <h1 className="text-2xl font-black">FarmTrack</h1>
                <p className="text-sm text-emerald-100">Poultry management made simple</p>
              </div>
            </div>

            <div className="mt-20 max-w-md">
              <h2 className="text-4xl font-black leading-tight">
                Welcome back to your farm dashboard
              </h2>
              <p className="mt-4 text-base leading-7 text-emerald-100">
                Sign in to track eggs, birds, workers, sales and daily farm performance.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-emerald-100">
              “Simple, clean and built for real farm work.”
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                  🐔
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h1>
                <p className="mt-1 text-slate-500">Sign in to manage your farm</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <LogIn size={20} /> Sign In
                    </>
                  )}
                </motion.button>
              </form>

               <div className="mt-6 space-y-3 text-center text-sm text-slate-500">
                   <div>
                    <Link to="/forgot-password" className="font-semibold text-slate-500 hover:text-emerald-700 hover:underline">
                     Forgot your password?
                    </Link>
                   </div>
                 <div>
                   First time?{' '}
                 <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
                  Create admin account
                    </Link>
                  </div>
                 </div>
               </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              🔒 Secure login — your data is private
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}