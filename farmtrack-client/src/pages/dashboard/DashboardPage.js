import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Egg, Bird, Users, AlertCircle,
  Home, Wallet, TrendingUp, TrendingDown
} from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
      {icon}
    </div>
    <div className="text-2xl font-black tracking-tight text-slate-900">{value}</div>
    <div className="mt-1 text-sm text-slate-500">{label}</div>
  </motion.div>
);

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    API.get('/dashboard/summary')
      .then(res => setSummary(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const eggRevenue = summary?.eggRevenueThisMonth ?? 0;
  const expenses = summary?.totalExpensesThisMonth ?? 0;
  const operatingProfit = summary?.operatingProfitThisMonth ?? 0;
  const birdSaleRevenue = summary?.birdSaleRevenueThisMonth ?? 0;
  const totalCash = summary?.totalCashThisMonth ?? 0;

  const stats = [
    { icon: <Egg size={22} className="text-amber-600" />, label: 'Eggs Today', value: (summary?.totalEggsToday ?? 0).toLocaleString(), color: 'bg-amber-50', delay: 0 },
    { icon: <Bird size={22} className="text-emerald-600" />, label: 'Live Birds', value: (summary?.totalActiveBirds ?? 0).toLocaleString(), color: 'bg-emerald-50', delay: 0.08 },
    { icon: <Home size={22} className="text-sky-600" />, label: 'Active Flocks', value: summary?.totalActiveFlocks ?? 0, color: 'bg-sky-50', delay: 0.16 },
    { icon: <AlertCircle size={22} className="text-rose-600" />, label: 'Unpaid Sales', value: summary?.unpaidSalesCount ?? 0, color: 'bg-rose-50', delay: 0.24 },
    { icon: <Users size={22} className="text-violet-600" />, label: 'Active Workers', value: summary?.totalWorkers ?? 0, color: 'bg-violet-50', delay: 0.32 },
    { icon: <Wallet size={22} className="text-orange-600" />, label: 'Expenses This Month', value: `₦${expenses.toLocaleString()}`, color: 'bg-orange-50', delay: 0.4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                FarmTrack Dashboard
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                {greeting}, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className="mt-1 text-sm text-slate-500 md:text-base">
                {new Date().toLocaleDateString('en-NG', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className={`rounded-3xl p-5 shadow-sm ${
              operatingProfit >= 0
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                : 'bg-gradient-to-br from-rose-600 to-red-700'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/80">🥚 Egg Operating Profit</span>
              {operatingProfit >= 0
                ? <TrendingUp size={20} className="text-white/70" />
                : <TrendingDown size={20} className="text-white/70" />}
            </div>
            <div className="text-3xl font-black tracking-tight text-white">
              {operatingProfit >= 0 ? '+' : ''}₦{operatingProfit.toLocaleString()}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
              <div>
                <div className="text-xs text-white/60">Egg Revenue</div>
                <div className="text-sm font-bold text-white">₦{eggRevenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Expenses</div>
                <div className="text-sm font-bold text-white">₦{expenses.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/80">🐔 Bird Sales Income</span>
              <span className="rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold text-white">One-time</span>
            </div>
            <div className="text-3xl font-black tracking-tight text-white">
              ₦{birdSaleRevenue.toLocaleString()}
            </div>
            <div className="mt-4 border-t border-white/15 pt-4 text-xs leading-6 text-white/70">
              From selling old layers & retired birds
              <br />
              Kept separate from daily operations
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={`rounded-3xl p-5 shadow-sm ${
              totalCash >= 0
                ? 'bg-gradient-to-br from-sky-600 to-indigo-600'
                : 'bg-gradient-to-br from-rose-600 to-red-700'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/80">💵 Total Cash This Month</span>
              <span className="text-2xl">{totalCash >= 0 ? '📈' : '📉'}</span>
            </div>
            <div className="text-3xl font-black tracking-tight text-white">
              {totalCash >= 0 ? '+' : ''}₦{totalCash.toLocaleString()}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
              <div>
                <div className="text-xs text-white/60">All Income</div>
                <div className="text-sm font-bold text-white">₦{(eggRevenue + birdSaleRevenue).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">All Expenses</div>
                <div className="text-sm font-bold text-white">₦{expenses.toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Egg Production Trend</h2>
              <p className="text-sm text-slate-500">Last 7 days</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              🥚 Daily
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={summary?.eggTrend ?? []}>
              <defs>
                <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(15,23,42,0.08)'
                }}
              />
              <Area
                type="monotone"
                dataKey="totalEggs"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#eggGrad)"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Eggs"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}