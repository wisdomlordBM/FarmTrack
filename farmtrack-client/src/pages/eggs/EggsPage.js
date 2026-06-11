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
  const [form, setForm] = useState({
    flockId: '', collectionDate: '', totalCollected: '', crackedEggs: '', notes: ''
  });

  const load = async () => {
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalCrates = Math.floor(records.reduce((s, r) => s + r.totalCollected, 0) / 30);
  const totalCracked = records.reduce((s, r) => s + r.crackedEggs, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Egg Records</h1>
          <p className="text-gray-500 mt-1">{todayTotal} eggs collected today</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
          <Plus size={18} /> Record Eggs
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🥚', label: "Today's Eggs", value: todayTotal, color: 'bg-yellow-50' },
          { icon: '📦', label: "Today's Crates", value: Math.floor(todayTotal / 30), color: 'bg-green-50' },
          { icon: '📋', label: 'Total Records', value: records.length, color: 'bg-blue-50' },
          { icon: '💔', label: 'Total Cracked', value: totalCracked, color: 'bg-red-50' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`${s.color} rounded-2xl p-5 border border-gray-100`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Egg size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No egg records yet</p>
          <p className="text-gray-400 text-sm mt-1">Start recording daily collections</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Flock', 'Total', 'Good', 'Cracked', 'Crates', 'By'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r, i) => (
                  <motion.tr key={r.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {new Date(r.collectionDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.flockName || '—'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{r.totalCollected}</td>
                    <td className="px-5 py-4">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {r.goodEggs ?? r.totalCollected - r.crackedEggs}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        r.crackedEggs > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>{r.crackedEggs}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {Math.floor(r.totalCollected / 30)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{r.recordedBy}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                <h2 className="font-bold text-xl text-gray-900">Record Egg Collection</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Flock</label>
                  <select value={form.flockId}
                    onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required>
                    <option value="">Select flock</option>
                    {flocks.map(f => <option key={f.id} value={f.id}>{f.batchName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Date</label>
                  <input type="date" value={form.collectionDate}
                    onChange={e => setForm({ ...form, collectionDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Collected</label>
                    <input type="number" placeholder="e.g. 450"
                      value={form.totalCollected}
                      onChange={e => setForm({ ...form, totalCollected: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cracked Eggs</label>
                    <input type="number" placeholder="e.g. 5"
                      value={form.crackedEggs}
                      onChange={e => setForm({ ...form, crackedEggs: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                  </div>
                </div>
                {form.totalCollected && (
                  <div className="bg-green-50 rounded-xl px-4 py-3 text-sm">
                    <span className="text-green-700 font-semibold">
                      = {Math.floor(parseInt(form.totalCollected || 0) / 30)} crates + {parseInt(form.totalCollected || 0) % 30} eggs
                    </span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any observations..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">Save Record</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}