import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CreditCard } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const REASONS = [
  { label: 'Old Layers', icon: '🐔', desc: 'Layers that stopped producing' },
  { label: 'Sick Birds', icon: '🤒', desc: 'Birds too sick to recover' },
  { label: 'Excess Stock', icon: '📦', desc: 'Too many birds in flock' },
  { label: 'End of Cycle', icon: '🔄', desc: 'End of production cycle' },
];

export default function BirdSalesPage() {
  const [sales, setSales] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [form, setForm] = useState({
    flockId: '',
    saleDate: '',
    customerName: '',
    customerPhone: '',
    numberOfBirds: '',
    pricePerBird: '',
    amountPaid: '',
    reason: 'Old Layers',
    notes: ''
  });

  const load = async () => {
    try {
      const [salesRes, flocksRes, revenueRes] = await Promise.all([
        API.get('/birdsale'),
        API.get('/flock'),
        API.get('/birdsale/revenue/month')
      ]);
      setSales(salesRes.data);
      setFlocks(flocksRes.data);
      setMonthRevenue(revenueRes.data.revenueThisMonth);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const selectedFlock = flocks.find(f => f.id === parseInt(form.flockId));
  const totalAmount = parseInt(form.numberOfBirds || 0) * parseFloat(form.pricePerBird || 0);
  const balance = totalAmount - parseFloat(form.amountPaid || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFlock && parseInt(form.numberOfBirds) > selectedFlock.aliveBirds) {
      toast.error(`Only ${selectedFlock.aliveBirds} birds available in this flock`);
      return;
    }
    try {
      await API.post('/birdsale', {
        ...form,
        flockId: parseInt(form.flockId),
        numberOfBirds: parseInt(form.numberOfBirds),
        pricePerBird: parseFloat(form.pricePerBird),
        amountPaid: parseFloat(form.amountPaid)
      });
      toast.success('Bird sale recorded! 🐔');
      setShowModal(false);
      setForm({
        flockId: '', saleDate: '', customerName: '', customerPhone: '',
        numberOfBirds: '', pricePerBird: '', amountPaid: '',
        reason: 'Old Layers', notes: ''
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    }
  };

  const markPaid = async (id) => {
    const amount = prompt('Enter amount paid (₦):');
    if (!amount || isNaN(amount)) return;
    try {
      await API.put(`/birdsale/${id}/pay`, parseFloat(amount), {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Payment updated!');
      load();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalBirdsSold = sales.reduce((s, r) => s + r.numberOfBirds, 0);
  const totalRevenue = sales.reduce((s, r) => s + r.totalAmount, 0);
  const unpaid = sales.filter(s => s.paymentStatus !== 'Paid');

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Bird Sales</h1>
          <p className="text-gray-500 mt-1">Track sales of old layers and retired birds</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
          <Plus size={18} /> Record Bird Sale
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🐔', label: 'Birds Sold (All Time)', value: totalBirdsSold.toLocaleString(), color: 'bg-orange-50' },
          { icon: '💰', label: 'Revenue This Month', value: `₦${monthRevenue.toLocaleString()}`, color: 'bg-green-50' },
          { icon: '🧾', label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, color: 'bg-blue-50' },
          { icon: '⚠️', label: 'Unpaid / Partial', value: unpaid.length, color: 'bg-red-50' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`${s.color} rounded-2xl p-5 border border-gray-100`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-extrabold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      {sales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">🐔</div>
          <p className="text-gray-500 font-medium">No bird sales yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Record sales when old layers stop producing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Flock', 'Customer', 'Birds', 'Price/Bird', 'Total', 'Paid', 'Balance', 'Reason', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map((s, i) => (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(s.saleDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">
                        {s.flockName}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{s.customerName}</div>
                      {s.customerPhone && <div className="text-xs text-gray-400">{s.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900">{s.numberOfBirds}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">₦{s.pricePerBird.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-bold text-gray-900">₦{s.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-green-600 font-semibold">₦{s.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-bold"
                      style={{ color: s.balance > 0 ? '#dc2626' : '#16a34a' }}>
                      ₦{s.balance.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-1 rounded-lg">
                        {s.reason}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        s.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>{s.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-4">
                      {s.paymentStatus !== 'Paid' && (
                        <button onClick={() => markPaid(s.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
                          <CreditCard size={13} /> Pay
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-green-50 border-t border-gray-100">
                <tr>
                  <td colSpan={3} className="px-4 py-4 font-bold text-gray-700">Total</td>
                  <td className="px-4 py-4 font-extrabold text-gray-900">{totalBirdsSold}</td>
                  <td />
                  <td className="px-4 py-4 font-extrabold text-gray-900">₦{totalRevenue.toLocaleString()}</td>
                  <td colSpan={5} />
                </tr>
              </tfoot>
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
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">🐔 Record Bird Sale</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Flock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Flock</label>
                  <select value={form.flockId}
                    onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required>
                    <option value="">Choose flock</option>
                    {flocks.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.batchName} — {f.aliveBirds} birds alive
                      </option>
                    ))}
                  </select>
                  {selectedFlock && (
                    <p className="text-xs text-green-600 font-semibold mt-1.5">
                      ✅ {selectedFlock.aliveBirds} birds currently alive in this flock
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Sale</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                      <button key={r.label} type="button"
                        onClick={() => setForm({ ...form, reason: r.label })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                          form.reason === r.label
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${form.reason === r.label ? 'text-green-700' : 'text-gray-700'}`}>
                            {r.label}
                          </div>
                          <div className="text-xs text-gray-400">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                    <input placeholder="e.g. Alhaji Musa"
                      value={form.customerName}
                      onChange={e => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input placeholder="080..."
                      value={form.customerPhone}
                      onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Birds</label>
                    <input type="number" placeholder="e.g. 50"
                      value={form.numberOfBirds}
                      onChange={e => setForm({ ...form, numberOfBirds: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-green-500 bg-gray-50 ${
                        selectedFlock && parseInt(form.numberOfBirds) > selectedFlock.aliveBirds
                          ? 'border-red-400' : 'border-gray-200'
                      }`} required />
                    {selectedFlock && parseInt(form.numberOfBirds) > selectedFlock.aliveBirds && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Exceeds available birds ({selectedFlock.aliveBirds})
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Bird (₦)</label>
                    <input type="number" placeholder="e.g. 3500"
                      value={form.pricePerBird}
                      onChange={e => setForm({ ...form, pricePerBird: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid (₦)</label>
                    <input type="number" placeholder="e.g. 100000"
                      value={form.amountPaid}
                      onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Date</label>
                    <input type="date" value={form.saleDate}
                      onChange={e => setForm({ ...form, saleDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>

                {/* Live Preview */}
                {form.numberOfBirds && form.pricePerBird && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-3 border border-green-100">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                        <div className="font-extrabold text-gray-900">₦{totalAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Paid</div>
                        <div className="font-extrabold text-green-600">₦{parseFloat(form.amountPaid || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Balance</div>
                        <div className={`font-extrabold ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          ₦{Math.max(0, balance).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any extra details..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200">
                    Record Sale
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