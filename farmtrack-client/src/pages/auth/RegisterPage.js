import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      toast.success('Account created! Please sign in 🎉');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-emerald-950 p-10 text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                🐔
              </div>
              <div>
                <h1 className="text-2xl font-black">FarmTrack</h1>
                <p className="text-sm text-slate-300">Set up your farm admin account</p>
              </div>
            </div>

            <div className="mt-20 max-w-md">
              <h2 className="text-4xl font-black leading-tight">
                Build a cleaner way to manage the farm
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Register once, then start tracking production, sales, workers and farm profit.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-300">
              Simple setup. Strong structure. Easy to use.
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
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Create Your Account</h1>
                <p className="mt-1 text-slate-500">Start managing your farm for free</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 6 characters"
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
                      <UserPlus size={20} /> Create Account
                    </>
                  )}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}