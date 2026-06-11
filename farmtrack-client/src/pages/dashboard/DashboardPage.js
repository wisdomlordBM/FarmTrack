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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      {icon}
    </div>
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
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
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
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
    { icon: <Egg size={22} className="text-yellow-600" />, label: 'Eggs Today', value: (summary?.totalEggsToday ?? 0).toLocaleString(), color: 'bg-yellow-100', delay: 0 },
    { icon: <Bird size={22} className="text-green-600" />, label: 'Live Birds', value: (summary?.totalActiveBirds ?? 0).toLocaleString(), color: 'bg-green-100', delay: 0.1 },
    { icon: <Home size={22} className="text-blue-600" />, label: 'Active Flocks', value: summary?.totalActiveFlocks ?? 0, color: 'bg-blue-100', delay: 0.2 },
    { icon: <AlertCircle size={22} className="text-red-500" />, label: 'Unpaid Sales', value: summary?.unpaidSalesCount ?? 0, color: 'bg-red-100', delay: 0.3 },
    { icon: <Users size={22} className="text-teal-600" />, label: 'Active Workers', value: summary?.totalWorkers ?? 0, color: 'bg-teal-100', delay: 0.4 },
    { icon: <Wallet size={22} className="text-orange-600" />, label: 'Expenses This Month', value: `₦${expenses.toLocaleString()}`, color: 'bg-orange-100', delay: 0.5 },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {greeting}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-NG', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </motion.div>

      {/* ── MONEY SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* Operating Profit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className={`rounded-2xl p-5 col-span-1 ${
            operatingProfit >= 0
              ? 'bg-gradient-to-br from-green-600 to-emerald-500'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-semibold">
              🥚 Egg Operating Profit
            </span>
            {operatingProfit >= 0
              ? <TrendingUp size={20} className="text-white/60" />
              : <TrendingDown size={20} className="text-white/60" />}
          </div>
          <div className="text-3xl font-extrabold text-white">
            {operatingProfit >= 0 ? '+' : ''}₦{operatingProfit.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2">
            <div>
              <div className="text-white/60 text-xs">Egg Revenue</div>
              <div className="text-white font-bold text-sm">₦{eggRevenue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-white/60 text-xs">Expenses</div>
              <div className="text-white font-bold text-sm">₦{expenses.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-2 text-white/60 text-xs">
            Egg Sales minus Farm Expenses
          </div>
        </motion.div>

        {/* Bird Sales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 bg-gradient-to-br from-orange-500 to-amber-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-semibold">
              🐔 Bird Sales Income
            </span>
            <span className="text-white/60 text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">
              One-time
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            ₦{birdSaleRevenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-white/60 text-xs">
              From selling old layers & retired birds
            </div>
            <div className="text-white/60 text-xs mt-1">
              Kept separate from daily operations
            </div>
          </div>
        </motion.div>

        {/* Total Cash */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-5 ${
            totalCash >= 0
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600'
              : 'bg-gradient-to-br from-red-600 to-rose-700'
          }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-sm font-semibold">
              💵 Total Cash This Month
            </span>
            <span className="text-2xl">
              {totalCash >= 0 ? '📈' : '📉'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {totalCash >= 0 ? '+' : ''}₦{totalCash.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2">
            <div>
              <div className="text-white/60 text-xs">All Income</div>
              <div className="text-white font-bold text-sm">
                ₦{(eggRevenue + birdSaleRevenue).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">All Expenses</div>
              <div className="text-white font-bold text-sm">₦{expenses.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-2 text-white/60 text-xs">
            Egg + Bird Sales minus all Expenses
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Egg Production Trend</h2>
            <p className="text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl">
            🥚 Daily
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={summary?.eggTrend ?? []}>
            <defs>
              <linearGradient id="eggGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }} />
            <Area type="monotone" dataKey="totalEggs"
              stroke="#16a34a" strokeWidth={3}
              fill="url(#eggGrad)"
              dot={{ fill: '#16a34a', r: 5 }}
              activeDot={{ r: 7 }} name="Eggs" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}