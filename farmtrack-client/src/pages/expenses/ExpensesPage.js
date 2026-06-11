import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Wallet, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { label: 'Feed', icon: '🌾', color: '#16a34a' },
  { label: 'Fuel', icon: '⛽', color: '#2563eb' },
  { label: 'Worker Salary', icon: '👷', color: '#7c3aed' },
  { label: 'Security', icon: '🔒', color: '#dc2626' },
  { label: 'Medication', icon: '💊', color: '#db2777' },
  { label: 'Repairs', icon: '🔧', color: '#d97706' },
  { label: 'Utilities', icon: '💡', color: '#0891b2' },
  { label: 'Other', icon: '📦', color: '#6b7280' },
];

const getCat = (name) => CATEGORIES.find(c => c.label === name) || CATEGORIES[7];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ExpensesPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('Overview');
  const [form, setForm] = useState({
    title: '', category: 'Feed', amount: '', date: '', description: ''
  });

  const load = () => {
    setLoading(true);
    API.get(`/expense/summary?month=${selectedMonth}&year=${selectedYear}`)
      .then(res => setSummary(res.data))
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expense', {
        ...form,
        amount: parseFloat(form.amount)
      });
      toast.success('Expense recorded! 💸');
      setShowModal(false);
      setForm({ title: '', category: 'Feed', amount: '', date: '', description: '' });
      load();
    } catch {
      toast.error('Failed to record expense');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expense/${id}`);
      toast.success('Expense deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pieData = summary?.byCategory?.map(c => ({
    name: c.category,
    value: c.total,
    color: getCat(c.category).color
  })) ?? [];

  const years = [2024, 2025, 2026, 2027];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Track what you spend to know your real profit</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
          <Plus size={18} /> Add Expense
        </motion.button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-green-500 bg-white">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-sm text-gray-500 font-medium">
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </span>
      </div>

      {/* Total Banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-white/80 text-sm">Total Expenses — {MONTHS[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-white text-3xl font-extrabold mt-1">
            ₦{(summary?.totalExpenses ?? 0).toLocaleString()}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {summary?.expenses?.length ?? 0} expense records
          </p>
        </div>
        <div className="text-5xl">💸</div>
      </motion.div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {summary?.byCategory?.map((cat, i) => {
          const info = getCat(cat.category);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="font-bold text-gray-900">₦{cat.total.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{cat.category}</div>
              <div className="text-xs text-gray-400">{cat.count} record{cat.count !== 1 ? 's' : ''}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {['Overview', 'Records'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{tab}</button>
        ))}
      </div>

      {/* Overview Tab — Pie Chart */}
      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {pieData.length === 0 ? (
            <div className="text-center py-16">
              <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No expenses this month</p>
              <p className="text-gray-400 text-sm mt-1">Add your first expense record</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-gray-900 mb-4">Spending Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={110}
                    dataKey="value" nameKey="name" label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    } labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₦${val.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </motion.div>
      )}

      {/* Records Tab */}
      {activeTab === 'Records' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {summary?.expenses?.length === 0 ? (
            <div className="text-center py-16">
              <Wallet size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No expenses this month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Date', 'Title', 'Category', 'Amount', 'Description', ''].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary?.expenses?.map((exp, i) => {
                    const cat = getCat(exp.category);
                    return (
                      <motion.tr key={exp.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {new Date(exp.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{exp.title}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                            {cat.icon} {exp.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-red-500 text-sm">
                          ₦{exp.amount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 italic">
                          {exp.description || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleDelete(exp.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-orange-50 border-t border-gray-100">
                  <tr>
                    <td colSpan={3} className="px-5 py-4 font-bold text-gray-700">Total</td>
                    <td className="px-5 py-4 font-extrabold text-red-500 text-lg">
                      ₦{(summary?.totalExpenses ?? 0).toLocaleString()}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">Record Expense</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input placeholder="e.g. Bought 10 bags of feed"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.label} type="button"
                        onClick={() => setForm({ ...form, category: cat.label })}
                        className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all ${
                          form.category === cat.label
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}>
                        <span className="text-lg mb-1">{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
                    <input type="number" placeholder="e.g. 25000"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
                  <input placeholder="Any extra details..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200">Save Expense</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}