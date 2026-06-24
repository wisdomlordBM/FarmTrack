import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Wallet, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

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
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ExpensesPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const ITEMS_PER_PAGE = 7;
  const [form, setForm] = useState({ title: '', category: 'Feed', amount: '', date: '', description: '' });

  const load = () => {
    setCurrentPage(1);
    setLoading(true);
    API.get(`/expense/summary?month=${selectedMonth}&year=${selectedYear}`)
      .then(res => setSummary(res.data))
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/expense', { ...form, amount: parseFloat(form.amount) });
      toast.success('Expense recorded! 💸');
      setShowModal(false);
      setForm({ title: '', category: 'Feed', amount: '', date: '', description: '' });
      load();
    } catch {
      toast.error('Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/expense/${confirmModal.id}`);
      toast.success('Expense deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pieData = summary?.byCategory?.map(c => ({ name: c.category, value: c.total, color: getCat(c.category).color })) ?? [];
  const expenses = summary?.expenses ?? [];
  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = expenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const years = [2024, 2025, 2026, 2027];

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Expenses</h1>
          <p className="text-slate-500 mt-1">Track what you spend to know your real profit</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          <Plus size={18} /> Add Expense
        </motion.button>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}
          className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-white text-slate-700">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2.5 border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-white text-slate-700">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="text-sm text-slate-500 font-medium">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4 shadow-lg shadow-orange-200/50">
        <div>
          <p className="text-white/80 text-sm font-medium">Total Expenses — {MONTHS[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-white text-3xl font-black mt-1">₦{(summary?.totalExpenses ?? 0).toLocaleString()}</p>
          <p className="text-white/70 text-xs mt-1.5">{expenses.length} expense records</p>
        </div>
        <div className="text-5xl">💸</div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {summary?.byCategory?.map((cat, i) => {
          const info = getCat(cat.category);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="font-black text-slate-900">₦{cat.total.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{cat.category}</div>
              <div className="text-xs text-slate-400">{cat.count} record{cat.count !== 1 ? 's' : ''}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
        {['Overview', 'Records'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {pieData.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Wallet size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No expenses this month</p>
              <p className="text-slate-400 text-sm mt-1">Add your first expense record</p>
            </div>
          ) : (
            <>
              <h3 className="font-black text-slate-900 mb-4">Spending Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `₦${val.toLocaleString()}`}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </motion.div>
      )}

      {activeTab === 'Records' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {expenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Wallet size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No expenses this month</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Date', 'Title', 'Category', 'Amount', 'Description', ''].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedExpenses.map((exp, i) => {
                      const cat = getCat(exp.category);
                      return (
                        <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                            {new Date(exp.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900 text-sm">{exp.title}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                              {cat.icon} {exp.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-black text-rose-500 text-sm">₦{exp.amount.toLocaleString()}</td>
                          <td className="px-5 py-4 text-sm text-slate-400 italic">{exp.description || '—'}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => setConfirmModal({ isOpen: true, id: exp.id })}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-orange-50 border-t border-slate-100">
                    <tr>
                      <td colSpan={3} className="px-5 py-4 font-bold text-slate-700">Total</td>
                      <td className="px-5 py-4 font-black text-rose-500 text-lg">₦{(summary?.totalExpenses ?? 0).toLocaleString()}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, expenses.length)} of {expenses.length} records
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Previous</button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                            currentPage === page ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}>{page}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowModal(false)}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-300/40"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-xl">💸</div>
                  <h2 className="font-black text-xl text-slate-900">Record Expense</h2>
                </div>
                <button onClick={() => !submitting && setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input placeholder="e.g. Bought 10 bags of feed" value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.label} type="button" onClick={() => setForm({ ...form, category: cat.label })}
                        className={`flex flex-col items-center py-2.5 px-1 rounded-2xl border-2 text-xs font-bold transition-all ${
                          form.category === cat.label ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>
                        <span className="text-lg mb-1">{cat.icon}</span>{cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (₦)</label>
                    <input type="number" placeholder="e.g. 25000" value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description (optional)</label>
                  <input placeholder="Any extra details..." value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => !submitting && setShowModal(false)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-60">Cancel</button>
                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }} whileTap={{ scale: submitting ? 1 : 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting
                      ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Please wait...</>
                      : 'Save Expense'
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Expense?"
        message="This expense record will be permanently deleted. This cannot be undone."
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
}