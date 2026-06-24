import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CreditCard, FileText, Eye, Trash2 } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { generateBirdSaleReceipt } from '../../utils/generateReceipt';
import ConfirmModal from '../../components/ConfirmModal';

const REASONS = [
  { label: 'Old Layers', icon: '🐔', desc: 'Layers that stopped producing' },
  { label: 'Sick Birds', icon: '🤒', desc: 'Birds too sick to recover' },
  { label: 'Excess Stock', icon: '📦', desc: 'Too many birds in flock' },
  { label: 'End of Cycle', icon: '🔄', desc: 'End of production cycle' },
];

export default function BirdSalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, sale: null });
  const [ownerNotes, setOwnerNotes] = useState('');
  const [generatingId, setGeneratingId] = useState(null);
  const [receipts, setReceipts] = useState({});
  const [farmProfile, setFarmProfile] = useState({});
  const [payModal, setPayModal] = useState({ isOpen: false, id: null, amount: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const ITEMS_PER_PAGE = 7;
  const [form, setForm] = useState({
    flockId: '', saleDate: '', customerName: '', customerPhone: '',
    numberOfBirds: '', pricePerBird: '', amountPaid: '', reason: 'Old Layers', notes: ''
  });

  const load = async () => {
    setCurrentPage(1);
    try {
      const [salesRes, flocksRes, revenueRes, profileRes] = await Promise.all([
        API.get('/birdsale'), API.get('/flock'), API.get('/birdsale/revenue/month'), API.get('/farmprofile')
      ]);
      setSales(salesRes.data);
      setFlocks(flocksRes.data);
      setMonthRevenue(revenueRes.data.revenueThisMonth);
      setFarmProfile(profileRes.data);
      const stored = {};
      salesRes.data.forEach(sale => {
        if (localStorage.getItem(`farmtrack_receipt_birdsale_${sale.id}`)) stored[sale.id] = true;
      });
      setReceipts(stored);
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
      toast.error(`Only ${selectedFlock.aliveBirds} birds available`); return;
    }
    setSubmitting(true);
    try {
      await API.post('/birdsale', {
        ...form, flockId: parseInt(form.flockId),
        numberOfBirds: parseInt(form.numberOfBirds),
        pricePerBird: parseFloat(form.pricePerBird),
        amountPaid: parseFloat(form.amountPaid)
      });
      toast.success('Bird sale recorded! 🐔');
      setShowModal(false);
      setForm({ flockId: '', saleDate: '', customerName: '', customerPhone: '', numberOfBirds: '', pricePerBird: '', amountPaid: '', reason: 'Old Layers', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaySubmit = async () => {
    const amount = parseFloat(payModal.amount);
    if (!payModal.amount || isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount'); return;
    }
    try {
      await API.put(`/birdsale/${payModal.id}/pay`, amount, { headers: { 'Content-Type': 'application/json' } });
      toast.success('Payment updated!');
      setPayModal({ isOpen: false, id: null, amount: '' });
      load();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await API.delete(`/birdsale/${confirmModal.id}`);
      toast.success('Bird sale deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleReceiptClick = (sale) => {
    if (!farmProfile.isSetup) {
      toast.error('Please set up your Farm Profile first');
      navigate('/dashboard/settings'); return;
    }
    setOwnerNotes('');
    setReceiptModal({ isOpen: true, sale });
  };

  const handleGenerateReceipt = async (sale, notes) => {
    setGeneratingId(sale.id);
    try {
      const doc = await generateBirdSaleReceipt(sale, { ...farmProfile, notes });
      doc.save(`bird-sale-receipt-${sale.id}.pdf`);
      window.open(doc.output('bloburl'), '_blank');
      localStorage.setItem(`farmtrack_receipt_birdsale_${sale.id}`, 'true');
      setReceipts(prev => ({ ...prev, [sale.id]: true }));
      toast.success('Receipt downloaded! 🧾');
      setReceiptModal({ isOpen: false, sale: null });
    } catch {
      toast.error('Failed to generate receipt');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleViewReceipt = async (sale) => {
    if (!farmProfile.isSetup) {
      toast.error('Please set up your Farm Profile first');
      navigate('/dashboard/settings'); return;
    }
    setGeneratingId(sale.id);
    try {
      const doc = await generateBirdSaleReceipt(sale, farmProfile);
      window.open(doc.output('bloburl'), '_blank');
    } catch {
      toast.error('Failed to open receipt');
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalBirdsSold = sales.reduce((s, r) => s + r.numberOfBirds, 0);
  const totalRevenue = sales.reduce((s, r) => s + r.totalAmount, 0);
  const unpaid = sales.filter(s => s.paymentStatus !== 'Paid');
  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);
  const paginatedSales = sales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Bird Sales</h1>
          <p className="text-slate-500 mt-1">Track sales of old layers and retired birds</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
          <Plus size={18} /> Record Bird Sale
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '🐔', label: 'Birds Sold (All Time)', value: totalBirdsSold.toLocaleString(), color: 'bg-orange-50 border-orange-100' },
          { icon: '💰', label: 'Revenue This Month', value: `₦${monthRevenue.toLocaleString()}`, color: 'bg-emerald-50 border-emerald-100' },
          { icon: '🧾', label: 'Total Revenue', value: `₦${totalRevenue.toLocaleString()}`, color: 'bg-sky-50 border-sky-100' },
          { icon: '⚠️', label: 'Unpaid / Partial', value: unpaid.length, color: 'bg-rose-50 border-rose-100' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className={`${s.color} rounded-3xl p-5 border`}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="text-xl font-black text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {sales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-4xl">🐔</div>
          <p className="text-slate-600 font-semibold">No bird sales yet</p>
          <p className="text-slate-400 text-sm mt-1">Record sales when old layers stop producing</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date', 'Flock', 'Customer', 'Birds', 'Price/Bird', 'Total', 'Paid', 'Balance', 'Reason', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSales.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                      {new Date(s.saleDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">{s.flockName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900 text-sm">{s.customerName}</div>
                      {s.customerPhone && <div className="text-xs text-slate-400 mt-0.5">{s.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900">{s.numberOfBirds}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">₦{s.pricePerBird.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900">₦{s.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-emerald-600 font-bold">₦{s.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-bold" style={{ color: s.balance > 0 ? '#dc2626' : '#16a34a' }}>₦{s.balance.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-lg border border-orange-100">{s.reason}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                        s.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'
                      }`}>{s.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {s.paymentStatus !== 'Paid' && (
                          <button onClick={() => setPayModal({ isOpen: true, id: s.id, amount: '' })}
                            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-100 transition-all">
                            <CreditCard size={13} /> Pay
                          </button>
                        )}
                        {receipts[s.id] ? (
                          <button onClick={() => handleViewReceipt(s)} disabled={generatingId === s.id}
                            className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-100 transition-all disabled:opacity-60">
                            {generatingId === s.id
                              ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                              : <><Eye size={13} /> View Receipt</>
                            }
                          </button>
                        ) : (
                          <button onClick={() => handleReceiptClick(s)}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all">
                            <FileText size={13} /> Receipt
                          </button>
                        )}
                        <button onClick={() => setConfirmModal({ isOpen: true, id: s.id })}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 border-t border-slate-100">
                <tr>
                  <td colSpan={3} className="px-4 py-4 font-bold text-slate-700">Total</td>
                  <td className="px-4 py-4 font-black text-slate-900">{totalBirdsSold}</td>
                  <td />
                  <td className="px-4 py-4 font-black text-slate-900">₦{totalRevenue.toLocaleString()}</td>
                  <td colSpan={5} />
                </tr>
              </tfoot>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <span className="text-sm text-slate-500 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sales.length)} of {sales.length} records
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
        </div>
      )}

      {/* Pay Modal */}
      <AnimatePresence>
        {payModal.isOpen && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPayModal({ isOpen: false, id: null, amount: '' })}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-xl">💳</div>
                  <h2 className="font-black text-xl text-slate-900">Record Payment</h2>
                </div>
                <button onClick={() => setPayModal({ isOpen: false, id: null, amount: '' })}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <div className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid (₦)</label>
                  <input type="number" placeholder="e.g. 5000" value={payModal.amount}
                    onChange={e => setPayModal(p => ({ ...p, amount: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handlePaySubmit()}
                    autoFocus
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 bg-slate-50 text-slate-900 text-lg font-bold" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPayModal({ isOpen: false, id: null, amount: '' })}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={handlePaySubmit}
                    className="flex-1 py-3 rounded-2xl bg-sky-500 text-white font-bold hover:bg-sky-600 shadow-lg shadow-sky-200 flex items-center justify-center gap-2">
                    <CreditCard size={16} /> Confirm
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Bird Sale Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowModal(false)}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl shadow-slate-300/40 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-xl">🐔</div>
                  <h2 className="font-black text-xl text-slate-900">Record Bird Sale</h2>
                </div>
                <button onClick={() => !submitting && setShowModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Flock</label>
                  <select value={form.flockId} onChange={e => setForm({ ...form, flockId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required>
                    <option value="">Choose flock</option>
                    {flocks.map(f => <option key={f.id} value={f.id}>{f.batchName} — {f.aliveBirds} birds alive</option>)}
                  </select>
                  {selectedFlock && <p className="text-xs text-emerald-600 font-semibold mt-1.5">✅ {selectedFlock.aliveBirds} birds currently alive</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Sale</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REASONS.map(r => (
                      <button key={r.label} type="button" onClick={() => setForm({ ...form, reason: r.label })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${
                          form.reason === r.label ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                        <span className="text-xl">{r.icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${form.reason === r.label ? 'text-emerald-700' : 'text-slate-700'}`}>{r.label}</div>
                          <div className="text-xs text-slate-400">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Name</label>
                    <input placeholder="e.g. Alhaji Musa" value={form.customerName}
                      onChange={e => setForm({ ...form, customerName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input placeholder="080..." value={form.customerPhone}
                      onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Birds</label>
                    <input type="number" placeholder="e.g. 50" value={form.numberOfBirds}
                      onChange={e => setForm({ ...form, numberOfBirds: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900 ${
                        selectedFlock && parseInt(form.numberOfBirds) > selectedFlock.aliveBirds ? 'border-rose-400' : 'border-slate-200'
                      }`} required />
                    {selectedFlock && parseInt(form.numberOfBirds) > selectedFlock.aliveBirds && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">⚠️ Exceeds available birds ({selectedFlock.aliveBirds})</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Price Per Bird (₦)</label>
                    <input type="number" placeholder="e.g. 3500" value={form.pricePerBird}
                      onChange={e => setForm({ ...form, pricePerBird: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid (₦)</label>
                    <input type="number" placeholder="e.g. 100000" value={form.amountPaid}
                      onChange={e => setForm({ ...form, amountPaid: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sale Date</label>
                    <input type="date" value={form.saleDate}
                      onChange={e => setForm({ ...form, saleDate: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                </div>
                {form.numberOfBirds && form.pricePerBird && (
                  <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl px-4 py-4 border border-emerald-100">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><div className="text-xs text-slate-500 mb-1 font-medium">Total Amount</div><div className="font-black text-slate-900">₦{totalAmount.toLocaleString()}</div></div>
                      <div><div className="text-xs text-slate-500 mb-1 font-medium">Paid</div><div className="font-black text-emerald-600">₦{parseFloat(form.amountPaid || 0).toLocaleString()}</div></div>
                      <div><div className="text-xs text-slate-500 mb-1 font-medium">Balance</div><div className={`font-black ${balance > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>₦{Math.max(0, balance).toLocaleString()}</div></div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any extra details..." value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
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
                      : 'Record Sale'
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptModal.isOpen && receiptModal.sale && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setReceiptModal({ isOpen: false, sale: null })}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-xl">🧾</div>
                  <h2 className="font-black text-xl text-slate-900">Generate Receipt</h2>
                </div>
                <button onClick={() => setReceiptModal({ isOpen: false, sale: null })}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <div className="p-7 space-y-4">
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="text-sm font-bold text-orange-700 mb-2">{farmProfile.farmName}</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="font-semibold">{receiptModal.sale.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Birds</span><span className="font-semibold">{receiptModal.sale.numberOfBirds}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-black text-orange-600">₦{receiptModal.sale.totalAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Flock</span><span className="font-semibold">{receiptModal.sale.flockName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span>
                      <span className={`font-bold ${receiptModal.sale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'}`}>{receiptModal.sale.paymentStatus}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Note (optional)</label>
                  <input placeholder="e.g. Thank you for your patronage" value={ownerNotes}
                    onChange={e => setOwnerNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setReceiptModal({ isOpen: false, sale: null })}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    disabled={generatingId === receiptModal.sale.id}
                    onClick={() => handleGenerateReceipt(receiptModal.sale, ownerNotes)}
                    className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-60">
                    {generatingId === receiptModal.sale.id
                      ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <><FileText size={18} /> Download PDF</>
                    }
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Bird Sale?"
        message="This bird sale will be permanently deleted. Note: the birds will NOT be restored to the flock automatically."
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
}