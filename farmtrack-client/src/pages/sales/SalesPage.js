import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingCart, CreditCard } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', cratesSold: '',
    pricePerCrate: '', amountPaid: '', saleDate: ''
  });

  const load = async () => {
    try {
      const [s, r] = await Promise.all([
        API.get('/sale'), API.get('/sale/revenue/month')
      ]);
      setSales(s.data);
      setMonthRevenue(r.data.revenueThisMonth);
    } catch {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalAmt = (s) => s.cratesSold * s.pricePerCrate;
  const bal = (s) => totalAmt(s) - s.amountPaid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/sale', {
        ...form,
        cratesSold: parseInt(form.cratesSold),
        pricePerCrate: parseFloat(form.pricePerCrate),
        amountPaid: parseFloat(form.amountPaid)
      });
      toast.success('Sale recorded! 💰');
      setShowModal(false);
      setForm({ customerName: '', customerPhone: '', cratesSold: '', pricePerCrate: '', amountPaid: '', saleDate: '' });
      load();
    } catch {
      toast.error('Failed to record sale');
    }
  };

  const markPaid = async (id) => {
    const amount = prompt('Enter amount paid (₦):');
    if (!amount || isNaN(amount)) return;
    try {
      await API.put(`/sale/${id}/pay`, parseFloat(amount), {
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

  const unpaid = sales.filter(s => s.paymentStatus !== 'Paid');
  const totalSales = sales.reduce((s, r) => s + totalAmt(r), 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Sales</h1>
          <p className="text-gray-500 mt-1">{sales.length} total sales recorded</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
          <Plus size={18} /> Record Sale
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💰', label: 'Revenue This Month', value: `₦${monthRevenue.toLocaleString()}`, color: 'bg-purple-50' },
          { icon: '📦', label: 'Total Crates Sold', value: sales.reduce((s, r) => s + r.cratesSold, 0), color: 'bg-green-50' },
          { icon: '⚠️', label: 'Unpaid / Partial', value: unpaid.length, color: 'bg-red-50' },
          { icon: '🧾', label: 'All Time Sales', value: `₦${totalSales.toLocaleString()}`, color: 'bg-blue-50' },
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

      {sales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No sales yet</p>
          <p className="text-gray-400 text-sm mt-1">Record your first egg sale</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Customer', 'Crates', 'Total', 'Paid', 'Balance', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
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
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {new Date(s.saleDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{s.customerName}</div>
                      {s.customerPhone && <div className="text-xs text-gray-400">{s.customerPhone}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{s.cratesSold}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">₦{totalAmt(s).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-green-600 font-semibold">₦{s.amountPaid.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm font-bold" style={{ color: bal(s) > 0 ? '#dc2626' : '#16a34a' }}>
                      ₦{bal(s).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                        s.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-600'
                      }`}>{s.paymentStatus}</span>
                    </td>
                    <td className="px-5 py-4">
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
            <motion.div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">Record Sale</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                    <input placeholder="Mrs Adaeze" value={form.customerName}
                      onChange={e => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input placeholder="080..." value={form.customerPhone}
                      onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Crates Sold</label>
                    <input type="number" placeholder="10" value={form.cratesSold}
                      onChange={e => setForm({ ...form, cratesSold: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price/Crate (₦)</label>
                    <input type="number" placeholder="1800" value={form.pricePerCrate}
                      onChange={e => setForm({ ...form, pricePerCrate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid (₦)</label>
                    <input type="number" placeholder="10000" value={form.amountPaid}
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
                {form.cratesSold && form.pricePerCrate && (
                  <div className="bg-green-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                    <span className="text-green-700 font-semibold">
                      Total: ₦{(parseInt(form.cratesSold || 0) * parseFloat(form.pricePerCrate || 0)).toLocaleString()}
                    </span>
                    <span className="text-red-500 font-semibold">
                      Balance: ₦{Math.max(0, (parseInt(form.cratesSold || 0) * parseFloat(form.pricePerCrate || 0)) - parseFloat(form.amountPaid || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200">Save Sale</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}