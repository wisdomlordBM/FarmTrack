import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Egg, Bird, TrendingUp, Users, ShieldCheck,
  BarChart3, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <Bird size={28} />, title: 'Flock Management', desc: 'Track every batch of birds, monitor survival rates and bird health in real time.', color: 'bg-emerald-50 text-emerald-700' },
    { icon: <Egg size={28} />, title: 'Egg Production', desc: 'Record daily egg collections, track cracked eggs and monitor production trends.', color: 'bg-amber-50 text-amber-700' },
    { icon: <TrendingUp size={28} />, title: 'Sales Tracking', desc: 'Record every sale, track unpaid balances and monitor monthly revenue.', color: 'bg-sky-50 text-sky-700' },
    { icon: <Users size={28} />, title: 'Worker Management', desc: 'Manage farm workers, track attendance and monitor daily rates.', color: 'bg-violet-50 text-violet-700' },
    { icon: <BarChart3 size={28} />, title: 'Smart Dashboard', desc: 'See everything at a glance — production trends, revenue and farm health.', color: 'bg-orange-50 text-orange-700' },
    { icon: <ShieldCheck size={28} />, title: 'Secure & Private', desc: 'Your farm data is protected. Only you have access to your business records.', color: 'bg-rose-50 text-rose-700' },
  ];

  const benefits = [
    'Know exactly how many eggs are produced daily',
    'Never lose track of who owes you money',
    'Monitor bird mortality and take quick action',
    'See your revenue grow month by month',
    'Works perfectly on mobile and desktop',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              🐔
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight text-slate-900">FarmTrack</div>
              <div className="text-xs text-slate-500">Poultry management made simple</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Sign In
          </button>
        </div>
      </nav>

      <section className="pt-32 pb-16 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-emerald-50 via-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
              🚀 Built for Nigerian poultry farmers
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Manage your farm
              <span className="block text-emerald-600">like a pro</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              FarmTrack helps you track eggs, manage flocks, record sales and handle workers — all from your phone or computer.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
              >
                Get Started Free <ArrowRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="rounded-2xl border border-emerald-200 bg-white px-7 py-4 text-base font-bold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Sign In
              </motion.button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {benefits.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-sm leading-6 text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-100">
              <div className="flex items-center gap-2 bg-emerald-700 px-5 py-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-300" />
                <span className="ml-2 text-sm font-medium text-white">FarmTrack Dashboard</span>
              </div>

              <div className="bg-slate-50 p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: '🥚', label: 'Eggs Today', value: '1,240', color: 'bg-amber-50' },
                    { icon: '🐔', label: 'Live Birds', value: '3,500', color: 'bg-emerald-50' },
                    { icon: '💰', label: 'Revenue', value: '₦182,000', color: 'bg-sky-50' },
                    { icon: '👷', label: 'Workers', value: '8', color: 'bg-violet-50' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className={`${item.color} rounded-2xl border border-white p-4 text-center shadow-sm`}
                    >
                      <div className="mb-1 text-2xl">{item.icon}</div>
                      <div className="text-lg font-extrabold text-slate-900">{item.value}</div>
                      <div className="text-xs font-medium text-slate-500">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Everything you need</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              One platform to run your poultry business — no spreadsheets, no confusion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 px-4 sm:px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Why FarmTrack?
          </h2>
          <p className="mt-4 text-base text-emerald-100 sm:text-lg">
            Designed specifically for poultry farmers who want to grow their business.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-5 text-left backdrop-blur"
              >
                <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-200" />
                <span className="font-medium text-white">{b}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
            className="mt-12 rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-xl transition hover:bg-emerald-50"
          >
            Start Managing Your Farm →
          </motion.button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 sm:px-6 py-10 text-center text-slate-400">
        <div className="mb-3 flex items-center justify-center gap-2">
          <span className="text-2xl">🐔</span>
          <span className="text-lg font-bold text-white">FarmTrack</span>
        </div>
        <p className="text-sm">Built with care for poultry farmers in Nigeria</p>
        <p className="mt-2 text-xs">© 2026 FarmTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}