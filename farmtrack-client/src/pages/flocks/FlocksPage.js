import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bird, X, TrendingUp, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function FlocksPage() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    batchName: '', birdType: 'Layer', totalBirds: '', dateAcquired: ''
  });

  const load = () => {
    API.get('/flock')
      .then(res => setFlocks(res.data))
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
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalBirds = flocks.reduce((s, f) => s + f.totalBirds, 0);
  const aliveBirds = flocks.reduce((s, f) => s + f.aliveBirds, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Flock Management</h1>
          <p className="text-gray-500 mt-1">{flocks.length} active batch{flocks.length !== 1 ? 'es' : ''}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
        >
          <Plus size={18} /> Add Flock
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Flocks', value: flocks.length, icon: '🏠', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Birds', value: totalBirds.toLocaleString(), icon: '🐔', color: 'bg-green-50 text-green-600' },
          { label: 'Alive Birds', value: aliveBirds.toLocaleString(), icon: '💚', color: 'bg-emerald-50 text-emerald-600' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Flocks Grid */}
      {flocks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Bird size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No flocks yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first batch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flocks.map((f, i) => {
            const survivalRate = f.totalBirds > 0
              ? Math.round((f.aliveBirds / f.totalBirds) * 100) : 0;
            return (
              <motion.div key={f.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* Card top bar */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">{f.batchName}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      f.status === 'Active' ? 'bg-white text-green-600' : 'bg-white/30 text-white'
                    }`}>{f.status}</span>
                  </div>
                  <p className="text-green-100 text-sm mt-1">{f.birdType}</p>
                </div>

                <div className="p-5">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Total', value: f.totalBirds },
                      { label: 'Alive', value: f.aliveBirds },
                      { label: 'Survival', value: `${survivalRate}%` },
                    ].map((s, j) => (
                      <div key={j} className="text-center bg-gray-50 rounded-xl py-3">
                        <div className="font-bold text-gray-900">{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Survival bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Survival Rate</span>
                      <span className={survivalRate >= 80 ? 'text-green-600' : 'text-red-500'}>
                        {survivalRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${survivalRate}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className={`h-full rounded-full ${
                          survivalRate >= 80 ? 'bg-green-500' :
                          survivalRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    Acquired: {new Date(f.dateAcquired).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {f.status === 'Active' && (
                    <button onClick={() => deactivate(f.id)}
                      className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                      Deactivate Flock
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
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
                <h2 className="font-bold text-xl text-gray-900">Add New Flock</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Name</label>
                  <input placeholder="e.g. Batch A — Jan 2025"
                    value={form.batchName}
                    onChange={e => setForm({ ...form, batchName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-gray-50"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bird Type</label>
                  <select value={form.birdType}
                    onChange={e => setForm({ ...form, birdType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50">
                    <option>Layer</option>
                    <option>Broiler</option>
                    <option>Cockerel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Birds</label>
                  <input type="number" placeholder="e.g. 500"
                    value={form.totalBirds}
                    onChange={e => setForm({ ...form, totalBirds: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-gray-50"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Acquired</label>
                  <input type="date" value={form.dateAcquired}
                    onChange={e => setForm({ ...form, dateAcquired: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-gray-50"
                    required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                    Add Flock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}