import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bird, X } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function FlocksPage() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [form, setForm] = useState({
    batchName: '', birdType: 'Layer', totalBirds: '', dateAcquired: ''
  });

  const load = () => {
    API.get('/flock')
      .then(res => { setFlocks(res.data); setCurrentPage(1); })
      .catch(() => toast.error('Failed to load flocks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/flock', { ...form, totalBirds: parseInt(form.totalBirds) });
      toast.success('Flock added successfully! 🐔');
      setShowModal(false);
      setForm({ batchName: '', birdType: 'Layer', totalBirds: '', dateAcquired: '' });
      load();
    } catch {
      toast.error('Failed to add flock');
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this flock?')) return;
    try {
      await API.put(`/flock/${id}/deactivate`);
      toast.success('Flock deactivated');
      load();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalBirds = flocks.reduce((s, f) => s + f.totalBirds, 0);
  const aliveBirds = flocks.reduce((s, f) => s + f.aliveBirds, 0);

  const totalPages = Math.ceil(flocks.length / ITEMS_PER_PAGE);
  const paginatedFlocks = flocks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Flock Management</h1>
          <p className="text-slate-500 mt-1">{flocks.length} active batch{flocks.length !== 1 ? 'es' : ''}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Plus size={18} /> Add Flock
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Flocks', value: flocks.length, icon: '🏠', color: 'bg-sky-50 border-sky-100' },
          { label: 'Total Birds', value: totalBirds.toLocaleString(), icon: '🐔', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Alive Birds', value: aliveBirds.toLocaleString(), icon: '💚', color: 'bg-teal-50 border-teal-100' },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${s.color} rounded-3xl p-5 border`}
          >
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-2xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Flocks Grid */}
      {flocks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
            <Bird size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold">No flocks yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first batch to get started</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedFlocks.map((f, i) => {
              const survivalRate = f.totalBirds > 0
                ? Math.round((f.aliveBirds / f.totalBirds) * 100) : 0;
              return (
                <motion.div key={f.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm shadow-slate-100 hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Card top bar */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-black text-lg">{f.batchName}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        f.status === 'Active'
                          ? 'bg-white text-emerald-600'
                          : 'bg-white/20 text-white'
                      }`}>{f.status}</span>
                    </div>
                    <p className="text-emerald-100 text-sm mt-1">{f.birdType}</p>
                  </div>

                  <div className="p-5">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Total', value: f.totalBirds },
                        { label: 'Alive', value: f.aliveBirds },
                        { label: 'Survival', value: `${survivalRate}%` },
                      ].map((s, j) => (
                        <div key={j} className="text-center bg-slate-50 rounded-2xl py-3">
                          <div className="font-black text-slate-900">{s.value}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Survival bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-medium">Survival Rate</span>
                        <span className={`font-bold ${survivalRate >= 80 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {survivalRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${survivalRate}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          className={`h-full rounded-full ${
                            survivalRate >= 80 ? 'bg-emerald-500' :
                            survivalRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 font-medium">
                      Acquired: {new Date(f.dateAcquired).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    {f.status === 'Active' && (
                      <button onClick={() => deactivate(f.id)}
                        className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all">
                        Deactivate Flock
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 mt-4">
              <span className="text-sm text-slate-500 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, flocks.length)} of {flocks.length} flocks
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl shadow-slate-300/40"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">🐔</div>
                  <h2 className="font-black text-xl text-slate-900">Add New Flock</h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch Name</label>
                  <input placeholder="e.g. Batch A — Jan 2025"
                    value={form.batchName}
                    onChange={e => setForm({ ...form, batchName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bird Type</label>
                  <select value={form.birdType}
                    onChange={e => setForm({ ...form, birdType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900">
                    <option>Layer</option>
                    <option>Broiler</option>
                    <option>Cockerel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Total Birds</label>
                  <input type="number" placeholder="e.g. 500"
                    value={form.totalBirds}
                    onChange={e => setForm({ ...form, totalBirds: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date Acquired</label>
                  <input type="date" value={form.dateAcquired}
                    onChange={e => setForm({ ...form, dateAcquired: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                    required />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                    Add Flock
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