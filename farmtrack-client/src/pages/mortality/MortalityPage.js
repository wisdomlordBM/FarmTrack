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
  const [form, setForm] = useState({
    flockId: '',
    date: '',
    numberDied: '',
    cause: 'Disease'
  });

  const load = async () => {
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
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalAllTime = summary?.totalDeathsAllTime ?? 0;
  const totalThisMonth = summary?.totalDeathsThisMonth ?? 0;

  const pieData = summary?.byCause?.map(c => ({
    name: c.cause,
    value: c.total,
    color: getCause(c.cause).color
  })) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Mortality Records
          </h1>
          <p className="text-gray-500 mt-1">
            Track bird deaths to monitor flock health
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-200">
          <Plus size={18} /> Record Deaths
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💀', label: 'Deaths This Month', value: totalThisMonth, color: 'bg-red-50' },
          { icon: '📊', label: 'Deaths All Time', value: totalAllTime, color: 'bg-orange-50' },
          { icon: '📋', label: 'Total Records', value: records.length, color: 'bg-blue-50' },
          { icon: '🦠', label: 'Top Cause', value: summary?.byCause?.[0]?.cause ?? '—', color: 'bg-purple-50' },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${s.color} rounded-2xl p-5 border border-gray-100`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {['Records', 'By Cause'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>{tab}</button>
        ))}
      </div>

      {/* Records Tab */}
      {activeTab === 'Records' && (
        <>
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Skull size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No mortality records yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Record any bird deaths to track flock health
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Date', 'Flock', 'Birds Died', 'Cause', 'Recorded By'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {records.map((r, i) => {
                      const cause = getCause(r.cause);
                      return (
                        <motion.tr key={r.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {new Date(r.date).toLocaleDateString('en-NG', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                              {r.flockName}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-extrabold text-red-500 text-lg">
                              {r.numberDied}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">birds</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: cause.color + '20',
                                color: cause.color
                              }}>
                              {cause.icon} {r.cause}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {r.recordedBy}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-red-50 border-t border-gray-100">
                    <tr>
                      <td colSpan={2} className="px-5 py-4 font-bold text-gray-700">
                        Total Deaths
                      </td>
                      <td className="px-5 py-4 font-extrabold text-red-500 text-lg">
                        {records.reduce((s, r) => s + r.numberDied, 0)}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* By Cause Tab */}
      {activeTab === 'By Cause' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {pieData.length === 0 ? (
            <div className="text-center py-16">
              <Skull size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No data yet</p>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-gray-900 mb-6">Deaths by Cause</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%"
                      outerRadius={110} dataKey="value" nameKey="name">
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `${val} birds`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

                {/* Cause breakdown list */}
                <div className="space-y-3">
                  {summary?.byCause?.map((c, i) => {
                    const info = getCause(c.cause);
                    const pct = totalAllTime > 0
                      ? Math.round((c.total / totalAllTime) * 100) : 0;
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: info.color + '20' }}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {c.cause}
                            </span>
                            <span className="text-sm font-bold"
                              style={{ color: info.color }}>
                              {c.total} birds ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3, duration: 0.8 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: info.color }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
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
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">
                  💀 Record Bird Deaths
                </h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Flock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Flock
                  </label>
                  <select value={form.flockId}
                    onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50"
                    required>
                    <option value="">Choose flock</option>
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.batchName} — {f.aliveBirds} alive
                      </option>
                    ))}
                  </select>
                  {selectedFlock && (
                    <p className="text-xs text-green-600 font-semibold mt-1.5">
                      ✅ {selectedFlock.aliveBirds} birds currently alive
                    </p>
                  )}
                </div>

                {/* Cause */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cause of Death
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CAUSES.map(c => (
                      <button key={c.label} type="button"
                        onClick={() => setForm({ ...form, cause: c.label })}
                        className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                          form.cause === c.label
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}>
                        <span className="text-xl mb-1">{c.icon}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number Died
                    </label>
                    <input type="number" placeholder="e.g. 5"
                      value={form.numberDied}
                      onChange={e => setForm({ ...form, numberDied: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-red-400 bg-gray-50 ${
                        selectedFlock && parseInt(form.numberDied) > selectedFlock.aliveBirds
                          ? 'border-red-400' : 'border-gray-200'
                      }`}
                      required />
                    {selectedFlock && parseInt(form.numberDied) > selectedFlock.aliveBirds && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Exceeds alive birds ({selectedFlock.aliveBirds})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date
                    </label>
                    <input type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 bg-gray-50"
                      required />
                  </div>
                </div>

                {/* Warning if high number */}
                {form.numberDied && parseInt(form.numberDied) >= 10 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="text-sm font-bold text-red-700">
                        High mortality detected
                      </div>
                      <div className="text-xs text-red-500">
                        {parseInt(form.numberDied)} deaths — consider calling a vet
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-lg shadow-red-200">
                    Record Deaths
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