import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Egg } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function EggsPage() {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [form, setForm] = useState({
    flockId: '', collectionDate: '', totalCollected: '', crackedEggs: '', notes: ''
  });

  const load = async () => {
    setCurrentPage(1);
    try {
      const [r, f, t] = await Promise.all([
        API.get('/egg'), API.get('/flock'), API.get('/egg/today')
      ]);
      setRecords(r.data);
      setFlocks(f.data);
      setTodayTotal(t.data.totalEggsToday);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/egg', {
        ...form,
        flockId: parseInt(form.flockId),
        totalCollected: parseInt(form.totalCollected),
        crackedEggs: parseInt(form.crackedEggs || 0)
      });
      toast.success('Egg record saved! 🥚');
      setShowModal(false);
      setForm({ flockId: '', collectionDate: '', totalCollected: '', crackedEggs: '', notes: '' });
      load();
    } catch {
      toast.error('Failed to save record');
    }
  };

  const getFlockName = (record) => {
    if (record.flockName) return record.flockName;
    const match = flocks.find(f => f.id === record.flockId);
    return match ? match.batchName : '—';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalCracked = records.reduce((s, r) => s + r.crackedEggs, 0);
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const paginatedRecords = records.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Egg Records</h1>
          <p className="text-slate-500 mt-1">{todayTotal} eggs collected today</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          <Plus size={18} /> Record Eggs
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🥚', label: "Today's Eggs", value: todayTotal, color: 'bg-amber-50 border-amber-100' },
          { icon: '📦', label: "Today's Crates", value: Math.floor(todayTotal / 30), color: 'bg-emerald-50 border-emerald-100' },
          { icon: '📋', label: 'Total Records', value: records.length, color: 'bg-sky-50 border-sky-100' },
          { icon: '💔', label: 'Total Cracked', value: totalCracked, color: 'bg-rose-50 border-rose-100' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`${s.color} rounded-3xl p-5 border`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {records.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Egg size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">No egg records yet</p>
          <p className="text-slate-400 text-sm mt-1">Start recording daily collections</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date', 'Flock', 'Total', 'Good', 'Cracked', 'Crates', 'By'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedRecords.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {new Date(r.collectionDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {getFlockName(r) !== '—' ? (
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {getFlockName(r)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-black text-slate-900">{r.totalCollected}</td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {r.goodEggs ?? r.totalCollected - r.crackedEggs}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        r.crackedEggs > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                      }`}>{r.crackedEggs}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-semibold">
                      {Math.floor(r.totalCollected / 30)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{r.recordedBy}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

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

      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-300/40"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-xl">🥚</div>
                  <h2 className="font-black text-xl text-slate-900">Record Collection</h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Flock</label>
                  <select value={form.flockId}
                    onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                    required>
                    <option value="">Select flock</option>
                    {flocks.map(f => <option key={f.id} value={f.id}>{f.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Collection Date</label>
                  <input type="date" value={form.collectionDate}
                    onChange={e => setForm({ ...form, collectionDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                    required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Total Collected</label>
                    <input type="number" placeholder="e.g. 450" value={form.totalCollected}
                      onChange={e => setForm({ ...form, totalCollected: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cracked Eggs</label>
                    <input type="number" placeholder="e.g. 5" value={form.crackedEggs}
                      onChange={e => setForm({ ...form, crackedEggs: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                {form.totalCollected && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                    <span className="text-emerald-700 font-bold text-sm">
                      = {Math.floor(parseInt(form.totalCollected || 0) / 30)} crates + {parseInt(form.totalCollected || 0) % 30} eggs
                    </span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any observations..." value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                    Save Record
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