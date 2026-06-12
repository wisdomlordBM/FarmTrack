import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CreditCard, PackageOpen } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManureSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;
  const [form, setForm] = useState({
    customerName: '', customerPhone: '',
    numberOfBags: '', pricePerBag: '',
    amountPaid: '', saleDate: '', notes: ''
  });

  const load = async () => {
    setCurrentPage(1);
    try {
      const [salesRes, revenueRes] = await Promise.all([
        API.get('/manuresale'),
        API.get('/manuresale/revenue/month')
      ]);
      setSales(salesRes.data);
      setMonthRevenue(revenueRes.data.revenueThisMonth);
    } catch {
      toast.error('Failed to load manure sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalAmt = (s) => s.numberOfBags * s.pricePerBag;
  const bal = (s) => totalAmt(s) - s.amountPaid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/manuresale', {
        ...form,
        numberOfBags: parseInt(form.numberOfBags),
        pricePerBag: parseFloat(form.pricePerBag),
        amountPaid: parseFloat(form.amountPaid)
      });
      toast.success('Manure sale recorded! 💰');
      setShowModal(false);
      setForm({ customerName: '', customerPhone: '', numberOfBags: '', pricePerBag: '', amountPaid: '', saleDate: '', notes: '' });
      load();
    } catch {
      toast.error('Failed to record sale');
    }
  };

  const markPaid = async (id) => {
    const amount = prompt('Enter amount paid (₦):');
    if (!amount || isNaN(amount)) return;
    try {
      await API.put(`/manuresale/${id}/pay`, parseFloat(amount), {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Payment updated!');
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const deleteSale = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/manuresale/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  
  const totalBags = sales.reduce((s, r) => s + r.numberOfBags, 0);
  const totalRevenue = sales.reduce((s, r) => s + totalAmt(r), 0);
  const unpaid = sales.filter(s => s.paymentStatus !== 'Paid');
  const liveTotal = parseInt(form.numberOfBags || 0) * parseFloat(form.pricePerBag || 0);
  const liveBalance = liveTotal - parseFloat(form.amountPaid || 0);
    const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);
    const paginatedSales = sales.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage * ITEMS_PER_PAGE
    );
  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Manure Sales</h1>
          <p className="text-slate-500 mt-1">Track sales of poultry manure by bag</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          <Plus size={18} /> Record Sale
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🌿', label: 'Revenue This Month', value: `₦${monthRevenue.toLocaleString()}`, color: 'bg-emerald-50 border-emerald-100' },
          { icon: '📦', label: 'Total Bags Sold', value: totalBags.toLocaleString(), color: 'bg-amber-50 border-amber-100' },
          { icon: '💰', label: 'All Time Revenue', value: `₦${totalRevenue.toLocaleString()}`, color: 'bg-sky-50 border-sky-100' },
          { icon: '⚠️', label: 'Unpaid / Partial', value: unpaid.length, color: 'bg-red-50 border-red-100' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`${s.color} rounded-3xl p-5 border`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <PackageOpen size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">No manure sales yet</p>
          <p className="text-slate-400 text-sm mt-1">Record your first manure sale</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date', 'Customer', 'Bags', 'Price/Bag', 'Total', 'Paid', 'Balance', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                
                {paginatedSales.map((s, i) => (
                  <motion.tr key={s.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {new Date(s.saleDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{s.customerName}</div>
                      {s.customerPhone && <div className="text-xs text-slate-400">{s.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-4 font-black text-slate-900 text-sm">{s.numberOfBags}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">₦{s.pricePerBag.toLocaleString()}</td>
                    <td className="px-4 py-4 font-bold text-slate-900 text-sm">₦{totalAmt(s).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-emerald-600">₦{s.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-bold"
                      style={{ color: bal(s) > 0 ? '#dc2626' : '#16a34a' }}>
                      ₦{bal(s).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        s.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-600'
                      }`}>{s.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {s.paymentStatus !== 'Paid' && (
                          <button onClick={() => markPaid(s.id)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition-all">
                            <CreditCard size={12} /> Pay
                          </button>
                        )}
                        <button onClick={() => deleteSale(s.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-xl transition-all">
                          ✕
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 border-t border-slate-100">
                <tr>
                  <td colSpan={2} className="px-4 py-4 font-bold text-slate-700">Total</td>
                  <td className="px-4 py-4 font-black text-slate-900">{totalBags}</td>
                  <td />
                  <td className="px-4 py-4 font-black text-slate-900">₦{totalRevenue.toLocaleString()}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>

          </div>
          {/* Pagination */}
        {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl">
            <span className="text-sm text-slate-500 font-medium">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sales.length)} of {sales.length} records
            </span>
            <div className="flex items-center gap-2">
            <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                ← Previous
            </button>
            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                    currentPage === page
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {page}
                </button>
                ))}
            </div>
            <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                Next →
            </button>
            </div>
        </div>
        )}

        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div
              className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">🌿</div>
                  <h2 className="font-black text-xl text-slate-900">Record Manure Sale</h2>
                </div>
                <button onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                    <input placeholder="e.g. Farmer Joe" value={form.customerName}
                      onChange={e => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input placeholder="080..." value={form.customerPhone}
                      onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Bags</label>
                    <input type="number" placeholder="e.g. 20" value={form.numberOfBags}
                      onChange={e => setForm({ ...form, numberOfBags: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price Per Bag (₦)</label>
                    <input type="number" placeholder="e.g. 500" value={form.pricePerBag}
                      onChange={e => setForm({ ...form, pricePerBag: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50"
                      required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid (₦)</label>
                    <input type="number" placeholder="e.g. 5000" value={form.amountPaid}
                      onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50"
                      required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sale Date</label>
                    <input type="date" value={form.saleDate}
                      onChange={e => setForm({ ...form, saleDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50"
                      required />
                  </div>
                </div>

                {form.numberOfBags && form.pricePerBag && (
                  <div className="bg-emerald-50 rounded-2xl px-4 py-3 flex justify-between text-sm border border-emerald-100">
                    <span className="text-emerald-700 font-bold">Total: ₦{liveTotal.toLocaleString()}</span>
                    <span className={`font-bold ${liveBalance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      Balance: ₦{Math.max(0, liveBalance).toLocaleString()}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any extra details..." value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50" />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                    Cancel
                  </button>
                  <motion.button type="submit"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                    Save Sale
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