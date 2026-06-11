import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Egg, Bird, TrendingUp, Users, ShieldCheck,
  BarChart3, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <Bird size={28} />, title: 'Flock Management', desc: 'Track every batch of birds, monitor survival rates and bird health in real time.', color: 'bg-green-100 text-green-600' },
    { icon: <Egg size={28} />, title: 'Egg Production', desc: 'Record daily egg collections, track cracked eggs and monitor production trends.', color: 'bg-yellow-100 text-yellow-600' },
    { icon: <TrendingUp size={28} />, title: 'Sales Tracking', desc: 'Record every sale, track unpaid balances and monitor monthly revenue.', color: 'bg-blue-100 text-blue-600' },
    { icon: <Users size={28} />, title: 'Worker Management', desc: 'Manage farm workers, track attendance and monitor daily rates.', color: 'bg-purple-100 text-purple-600' },
    { icon: <BarChart3 size={28} />, title: 'Smart Dashboard', desc: 'See everything at a glance — production trends, revenue and farm health.', color: 'bg-orange-100 text-orange-600' },
    { icon: <ShieldCheck size={28} />, title: 'Secure & Private', desc: 'Your farm data is protected. Only you have access to your business records.', color: 'bg-red-100 text-red-600' },
  ];

  const benefits = [
    'Know exactly how many eggs are produced daily',
    'Never lose track of who owes you money',
    'Monitor bird mortality and take quick action',
    'See your revenue grow month by month',
    'Works perfectly on mobile and desktop',
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐔</span>
            <span className="text-xl font-bold text-green-600">FarmTrack</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              🚀 Built for Nigerian Poultry Farmers
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Manage Your Farm
              <span className="text-green-600 block">Like a Pro</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              FarmTrack helps you track eggs, manage flocks, record sales and handle workers — all from your phone or computer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                Get Started Free <ArrowRight size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>

          {/* Hero image placeholder — dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="bg-green-600 px-6 py-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-white text-sm ml-2 font-medium">FarmTrack Dashboard</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🥚', label: 'Eggs Today', value: '1,240', color: 'bg-yellow-50' },
                { icon: '🐔', label: 'Live Birds', value: '3,500', color: 'bg-green-50' },
                { icon: '💰', label: 'Revenue', value: '₦182,000', color: 'bg-blue-50' },
                { icon: '👷', label: 'Workers', value: '8', color: 'bg-purple-50' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`${item.color} rounded-2xl p-4 text-center`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="font-bold text-gray-800 text-lg">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              One platform to run your entire poultry business — no spreadsheets, no confusion.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Why FarmTrack?
          </h2>
          <p className="text-green-100 text-lg mb-12">
            Designed specifically for poultry farmers who want to grow their business.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-5 py-4"
              >
                <CheckCircle2 size={22} className="text-green-300 shrink-0" />
                <span className="text-white font-medium">{b}</span>
              </motion.div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="mt-12 bg-white text-green-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all shadow-xl"
          >
            Start Managing Your Farm →
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🐔</span>
          <span className="text-white font-bold text-lg">FarmTrack</span>
        </div>
        <p className="text-sm">Built with ❤️ for poultry farmers in Nigeria</p>
        <p className="text-xs mt-2">© 2026 FarmTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}