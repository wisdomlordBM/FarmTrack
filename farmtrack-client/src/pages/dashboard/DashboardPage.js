import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Egg, Bird, Users, AlertCircle,
  Home, Wallet, TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight
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

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchSummary = (month, year) => {
    setLoading(true);
    API.get(`/dashboard/summary?month=${month}&year=${year}`)
      .then(res => setSummary(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth() + 1)) return;
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
  };

  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();
  const isAtCurrentMonth = isCurrentMonth;

  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) {
    yearOptions.push(y);
  }

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
  const manureRevenue = summary?.manureSaleRevenueThisMonth ?? 0;
  const totalCash = summary?.totalCashThisMonth ?? 0;
  const isFuture = summary?.isFuture ?? false;

  const allTimeExpenses = summary?.totalAllTimeExpenses ?? 0;
  const allTimeRevenue = summary?.totalAllTimeRevenue ?? 0;
  const allTimeProfit = summary?.totalAllTimeProfit ?? 0;
  const allTimeEggRevenue = summary?.totalAllTimeEggRevenue ?? 0;
  const allTimeBirdRevenue = summary?.totalAllTimeBirdRevenue ?? 0;
  const allTimeManureRevenue = summary?.totalAllTimeManureRevenue ?? 0;
  const recoveryPct = allTimeExpenses > 0
    ? Math.min(100, Math.round((allTimeRevenue / allTimeExpenses) * 100))
    : allTimeRevenue > 0 ? 100 : 0;

  const stats = [
    { 
      icon: <Egg size={22} className="text-emerald-600" />, 
      label: 'Eggs Today', 
      value: (summary?.totalEggsToday ?? 0).toLocaleString(), 
      color: 'bg-emerald-50', 
      delay: 0 
    },
    { 
      icon: <Bird size={22} className="text-green-700" />, 
      label: 'Live Birds', 
      value: (summary?.totalActiveBirds ?? 0).toLocaleString(), 
      color: 'bg-green-50', 
      delay: 0.08 
    },
    { 
      icon: <Home size={22} className="text-teal-600" />, 
      label: 'Active Flocks', 
      value: summary?.totalActiveFlocks ?? 0, 
      color: 'bg-teal-50', 
      delay: 0.16 
    },
    { 
      icon: <AlertCircle size={22} className="text-red-600" />, 
      label: 'Unpaid Sales', 
      value: summary?.unpaidSalesCount ?? 0, 
      color: 'bg-red-50', 
      delay: 0.24 
    },
    { 
      icon: <Users size={22} className="text-emerald-700" />, 
      label: 'Active Workers', 
      value: summary?.totalWorkers ?? 0, 
      color: 'bg-emerald-50', 
      delay: 0.32 
    },
    { 
      icon: <Wallet size={22} className="text-green-700" />, 
      label: `Expenses (${MONTHS[selectedMonth - 1].slice(0,3)})`, 
      value: `₦${expenses.toLocaleString()}`, 
      color: 'bg-green-50', 
      delay: 0.4 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Greeting */}
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

        {/* Month / Year Selector */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm px-2 py-1.5">
            <button onClick={goToPrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all">
              <ChevronLeft size={18} />
            </button>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer px-1">
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="text-sm font-bold text-slate-900 bg-transparent outline-none cursor-pointer px-1">
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button onClick={goToNextMonth} disabled={isAtCurrentMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={18} />
            </button>
          </div>

          {!isCurrentMonth && (
            <button onClick={() => { setSelectedMonth(now.getMonth() + 1); setSelectedYear(now.getFullYear()); }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-100 transition-all">
              Back to Current Month
            </button>
          )}

          <span className="text-sm font-semibold text-slate-500">
            {isCurrentMonth ? '📅 This Month' : `📅 ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          </span>
        </motion.div>

        {/* Future month notice */}
        {isFuture && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-700 font-medium">
            📅 You are viewing a future month — no data yet. Select a past or current month to see records.
          </motion.div>
        )}

        {/* THIS PERIOD SECTION */}
        <div className="mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isCurrentMonth ? 'This Month' : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Egg Operating Profit */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className={`rounded-3xl p-5 lg:col-span-2 ${
              operatingProfit >= 0
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                : 'bg-gradient-to-br from-rose-600 to-red-700'
            } text-white`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">🥚 Egg Operating Profit</span>
              {operatingProfit >= 0
                ? <TrendingUp size={20} className="text-white/70" />
                : <TrendingDown size={20} className="text-white/70" />}
            </div>
            <div className="text-3xl font-black text-white">
              {isFuture ? '₦0' : `${operatingProfit >= 0 ? '+' : ''}₦${operatingProfit.toLocaleString()}`}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-white/60">Egg Revenue</div>
                <div className="text-sm font-bold text-white">₦{eggRevenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-white/60">Expenses</div>
                <div className="text-sm font-bold text-white">₦{expenses.toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-2 text-white/60 text-xs">Egg Sales minus Farm Expenses</div>
          </motion.div>

          {/* Bird Sales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-5 bg-gradient-to-br from-emerald-600 to-green-700 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">🐔 Bird Sales</span>
              <span className="text-white/70 text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">One-time</span>
            </div>
            <div className="text-2xl font-black text-white">₦{birdSaleRevenue.toLocaleString()}</div>
            <div className="mt-2 text-white/60 text-xs">From selling old layers</div>
          </motion.div>

          {/* Manure Sales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl p-5 bg-gradient-to-br from-green-700 to-emerald-800 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm font-semibold">🌿 Manure Sales</span>
              <span className="text-white/70 text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">One-time</span>
            </div>
            <div className="text-2xl font-black text-white">₦{manureRevenue.toLocaleString()}</div>
            <div className="mt-2 text-white/60 text-xs">From selling poultry manure</div>
          </motion.div>

          {/* Total Cash */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-5 lg:col-span-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">
                  💵 Total Cash — {isCurrentMonth ? 'This Month' : `${MONTHS[selectedMonth - 1]} ${selectedYear}`}
                </p>
                <p className="text-4xl font-extrabold text-white">
                  {totalCash >= 0 ? '+' : ''}₦{totalCash.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs mt-2">
                  Egg ₦{eggRevenue.toLocaleString()} + Birds ₦{birdSaleRevenue.toLocaleString()} + Manure ₦{manureRevenue.toLocaleString()} − Expenses ₦{expenses.toLocaleString()}
                </p>
              </div>
              <div className="text-5xl">{totalCash >= 0 ? '📈' : '📉'}</div>
            </div>
          </motion.div>
        </div>

        {/* ALL-TIME BUSINESS HEALTH */}
        <div className="mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Business Performance</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

          {/* All-Time Profit/Loss */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-3xl p-6 ${
              allTimeProfit >= 0
                ? 'bg-gradient-to-br from-emerald-700 to-teal-700'
                : 'bg-gradient-to-br from-red-700 to-red-800'
            } text-white`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80 text-sm font-semibold">📊 All-Time Profit / Loss</span>
              {allTimeProfit >= 0
                ? <TrendingUp size={20} className="text-white/70" />
                : <TrendingDown size={20} className="text-white/70" />}
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {allTimeProfit >= 0 ? '+' : ''}₦{allTimeProfit.toLocaleString()}
            </div>
            <p className="text-white/60 text-xs mb-4">
              {allTimeProfit >= 0
                ? 'Your business is profitable overall 🎉'
                : 'Still recovering startup costs — keep going!'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
              <div>
                <div className="text-xs text-white/60 mb-1">Total Revenue</div>
                <div className="text-lg font-black text-white">₦{allTimeRevenue.toLocaleString()}</div>
                <div className="text-xs text-white/50 mt-0.5">Eggs ₦{allTimeEggRevenue.toLocaleString()}</div>
                <div className="text-xs text-white/50">
                  Birds ₦{allTimeBirdRevenue.toLocaleString()} · Manure ₦{allTimeManureRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Total Expenses</div>
                <div className="text-lg font-black text-white">₦{allTimeExpenses.toLocaleString()}</div>
                <div className="text-xs text-white/50 mt-0.5">All time recorded expenses</div>
              </div>
            </div>
          </motion.div>

          {/* Cost Recovery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900">Cost Recovery</h3>
                <p className="text-xs text-slate-500 mt-0.5">How much of your expenses have you recovered</p>
              </div>
              <div className={`text-2xl font-black ${recoveryPct >= 100 ? 'text-emerald-600' : 'text-emerald-600'}`}>
                {recoveryPct}%
              </div>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recoveryPct}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className={`h-full rounded-full ${
                  recoveryPct >= 100 ? 'bg-emerald-500' :
                  recoveryPct >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                }`} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 rounded-2xl p-3">
                <div className="text-xs text-slate-500 mb-1">Total Spent</div>
                <div className="font-black text-red-600 text-sm">₦{allTimeExpenses.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3">
                <div className="text-xs text-slate-500 mb-1">Recovered</div>
                <div className="font-black text-emerald-600 text-sm">₦{allTimeRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3">
                <div className="text-xs text-slate-500 mb-1">{allTimeProfit >= 0 ? 'Net Profit' : 'Remaining'}</div>
                <div className={`font-black text-sm ${allTimeProfit >= 0 ? 'text-emerald-600' : 'text-emerald-600'}`}>
                  ₦{Math.abs(allTimeProfit).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400 text-center">
              {recoveryPct >= 100
                ? '✅ You have fully recovered your costs and are making profit!'
                : recoveryPct >= 70
                  ? `📈 Great progress! ₦${(allTimeExpenses - allTimeRevenue).toLocaleString()} more to break even`
                  : `💪 Keep going! ₦${(allTimeExpenses - allTimeRevenue).toLocaleString()} more to break even`
              }
            </div>
          </motion.div>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>

        {/* Egg Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.08)' }} />
              <Area type="monotone" dataKey="totalEggs" stroke="#10b981" strokeWidth={3}
                fill="url(#eggGrad)" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Eggs" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}