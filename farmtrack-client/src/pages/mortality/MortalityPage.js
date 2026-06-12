import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Skull } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const CAUSES = [
  { label: 'Disease', icon: '🦠', color: '#dc2626' },
  { label: 'Heat Stress', icon: '🌡️', color: '#f97316' },
  { label: 'Injury', icon: '🤕', color: '#d97706' },
  { label: 'Predator', icon: '🦊', color: '#7c3aed' },
  { label: 'Starvation', icon: '🌾', color: '#ca8a04' },
  { label: 'Unknown', icon: '❓', color: '#6b7280' },
];

const getCause = (name) => CAUSES.find(c => c.label === name) || CAUSES[5];

export default function MortalityPage() {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Records');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [form, setForm] = useState({
    flockId: '', date: '', numberDied: '', cause: 'Disease'
  });

  const load = async () => {
    setCurrentPage(1);
    try {
      const [recordsRes, flocksRes, summaryRes] = await Promise.all([
        API.get('/mortality'),
        API.get('/flock'),
        API.get('/mortality/summary')
      ]);
      setRecords(recordsRes.data);
      setFlocks(flocksRes.data);
      setSummary(summaryRes.data);
    } catch {
      toast.error('Failed to load mortality records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedFlock = flocks.find(f => f.id === parseInt(form.flockId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFlock && parseInt(form.numberDied) > selectedFlock.aliveBirds) {
      toast.error(`Only ${selectedFlock.aliveBirds} birds alive in this flock`);
      return;
    }
    try {
      await API.post('/mortality', {
        ...form,
        flockId: parseInt(form.flockId),
        numberDied: parseInt(form.numberDied)
      });
      toast.success('Mortality recorded');
      setShowModal(false);
      setForm({ flockId: '', date: '', numberDied: '', cause: 'Disease' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalAllTime = summary?.totalDeathsAllTime ?? 0;
  const totalThisMonth = summary?.totalDeathsThisMonth ?? 0;

  const pieData = summary?.byCause?.map(c => ({
    name: c.cause,
    value: c.total,
    color: getCause(c.cause).color
  })) ?? [];

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const paginatedRecords = records.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Mortality Records</h1>
          <p className="text-slate-500 mt-1">Track bird deaths to monitor flock health</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
          <Plus size={18} /> Record Deaths
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💀', label: 'Deaths This Month', value: totalThisMonth, color: 'bg-rose-50 border-rose-100' },
          { icon: '📊', label: 'Deaths All Time', value: totalAllTime, color: 'bg-orange-50 border-orange-100' },
          { icon: '📋', label: 'Total Records', value: records.length, color: 'bg-sky-50 border-sky-100' },
          { icon: '🦠', label: 'Top Cause', value: summary?.byCause?.[0]?.cause ?? '—', color: 'bg-violet-50 border-violet-100' },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${s.color} rounded-3xl p-5 border`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
        {['Records', 'By Cause'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>{tab}</button>
        ))}
      </div>

      {/* Records Tab */}
      {activeTab === 'Records' && (
        <>
          {records.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Skull size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No mortality records yet</p>
              <p className="text-slate-400 text-sm mt-1">Record any bird deaths to track flock health</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Date', 'Flock', 'Birds Died', 'Cause', 'Recorded By'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedRecords.map((r, i) => {
                      const cause = getCause(r.cause);
                      return (
                        <motion.tr key={r.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                            {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                              {r.flockName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-black text-rose-500 text-lg">{r.numberDied}</span>
                            <span className="text-slate-400 text-xs ml-1">birds</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: cause.color + '20', color: cause.color }}>
                              {cause.icon} {r.cause}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-400">{r.recordedBy}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-rose-50 border-t border-slate-100">
                    <tr>
                      <td colSpan={2} className="px-5 py-4 font-bold text-slate-700">Total Deaths</td>
                      <td className="px-5 py-4 font-black text-rose-500 text-lg">
                        {records.reduce((s, r) => s + r.numberDied, 0)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, records.length)} of {records.length} records
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      ← Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}>{page}</button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* By Cause Tab */}
      {activeTab === 'By Cause' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {pieData.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                <Skull size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No data yet</p>
            </div>
          ) : (
            <>
              <h3 className="font-black text-slate-900 mb-6">Deaths by Cause</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `${val} birds`}
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {summary?.byCause?.map((c, i) => {
                    const info = getCause(c.cause);
                    const pct = totalAllTime > 0 ? Math.round((c.total / totalAllTime) * 100) : 0;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: info.color + '20' }}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-800">{c.cause}</span>
                            <span className="text-sm font-bold" style={{ color: info.color }}>
                              {c.total} birds ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: info.color }} />
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {c.count} record{c.count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-300/40"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-xl">💀</div>
                  <h2 className="font-black text-xl text-slate-900">Record Bird Deaths</h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Flock</label>
                  <select value={form.flockId}
                    onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-slate-50 text-slate-900"
                    required>
                    <option value="">Choose flock</option>
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>{f.batchName} — {f.aliveBirds} alive</option>
                    ))}
                  </select>
                  {selectedFlock && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1.5">
                      ✅ {selectedFlock.aliveBirds} birds currently alive
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cause of Death</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAUSES.map(c => (
                      <button key={c.label} type="button"
                        onClick={() => setForm({ ...form, cause: c.label })}
                        className={`flex flex-col items-center py-3 px-2 rounded-2xl border-2 text-xs font-bold transition-all ${
                          form.cause === c.label
                            ? 'border-rose-400 bg-rose-50 text-rose-700'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>
                        <span className="text-xl mb-1">{c.icon}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number Died</label>
                    <input type="number" placeholder="e.g. 5"
                      value={form.numberDied}
                      onChange={e => setForm({ ...form, numberDied: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-slate-50 text-slate-900 ${
                        selectedFlock && parseInt(form.numberDied) > selectedFlock.aliveBirds
                          ? 'border-rose-400' : 'border-slate-200'
                      }`} required />
                    {selectedFlock && parseInt(form.numberDied) > selectedFlock.aliveBirds && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">
                        ⚠️ Exceeds alive birds ({selectedFlock.aliveBirds})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-slate-50 text-slate-900"
                      required />
                  </div>
                </div>
                {form.numberDied && parseInt(form.numberDied) >= 10 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="text-sm font-bold text-rose-700">High mortality detected</div>
                      <div className="text-xs text-rose-500">{parseInt(form.numberDied)} deaths — consider calling a vet</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200">
                    Record Deaths
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}