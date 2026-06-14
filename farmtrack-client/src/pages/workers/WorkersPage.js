import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, ClipboardCheck, Calendar, Wallet } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const ROLES = [
  { label: 'Managing Director', icon: '👑', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { label: 'Manager', icon: '🧑‍💼', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { label: 'Supervisor', icon: '👷', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  { label: 'Farm Hand', icon: '🌾', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { label: 'Driver', icon: '🚗', color: 'bg-sky-50 text-sky-700 border-sky-100' },
  { label: 'Cleaner', icon: '🧹', color: 'bg-pink-50 text-pink-700 border-pink-100' },
  { label: 'Security', icon: '🔒', color: 'bg-red-50 text-red-700 border-red-100' },
];
const getRoleInfo = (role) => ROLES.find(r => r.label === role) || { icon: '👤', color: 'bg-slate-50 text-slate-700 border-slate-100' };
const tabs = ['Workers', 'Attendance', 'Salary'];

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState('Workers');
  const [workers, setWorkers] = useState([]);
  const [salarySummary, setSalarySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const ITEMS_PER_PAGE = 6;
  const [form, setForm] = useState({
    fullName: '', phone: '', role: '', monthlySalary: '', dateJoined: '',
    address: '', nextOfKin: '', nextOfKinPhone: ''
  });
  const [attendance, setAttendance] = useState({
    workerId: '', date: new Date().toISOString().split('T')[0], present: true, notes: ''
  });

  const load = async () => {
    try {
      const [workersRes, salaryRes] = await Promise.all([
        API.get('/worker'), API.get('/worker/salary/month')
      ]);
      setWorkers(workersRes.data);
      setSalarySummary(salaryRes.data);
      setCurrentPage(1);
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = (date) => {
    setAttendanceLoading(true);
    API.get(`/worker/attendance?date=${date}`)
      .then(res => setAttendanceData(res.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setAttendanceLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (activeTab === 'Attendance') loadAttendance(attendanceDate); }, [activeTab, attendanceDate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/worker', { ...form, monthlySalary: parseFloat(form.monthlySalary) });
      toast.success('Worker added! 👷');
      setShowAdd(false);
      setForm({ fullName: '', phone: '', role: '', monthlySalary: '', dateJoined: '', address: '', nextOfKin: '', nextOfKinPhone: '' });
      load();
    } catch {
      toast.error('Failed to add worker');
    }
  };

  const handleAttendance = async (e) => {
    e.preventDefault();
    try {
      await API.post('/worker/attendance', { ...attendance, workerId: parseInt(attendance.workerId) });
      toast.success('Attendance marked! ✅');
      setShowAttendance(false);
      if (activeTab === 'Attendance') loadAttendance(attendanceDate);
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const handleConfirmRemove = async () => {
    try {
      await API.put(`/worker/${confirmModal.id}/deactivate`);
      toast.success('Worker removed');
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

  const monthlySalaryTotal = workers.reduce((s, w) => s + (w.monthlySalary || 0), 0);
  const dailyTotal = workers.reduce((s, w) => s + (w.dailyRate || 0), 0);
  const totalPages = Math.ceil(workers.length / ITEMS_PER_PAGE);
  const paginatedWorkers = workers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Workers</h1>
          <p className="text-slate-500 mt-1">{workers.length} active worker{workers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAttendance(true)}
            className="flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 px-4 py-2.5 rounded-2xl font-bold hover:bg-emerald-50 transition-all">
            <ClipboardCheck size={18} /> Mark Attendance
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            <Plus size={18} /> Add Worker
          </motion.button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab === 'Workers' && <span className="flex items-center gap-2"><Users size={15} /> Workers</span>}
            {tab === 'Attendance' && <span className="flex items-center gap-2"><Calendar size={15} /> Attendance</span>}
            {tab === 'Salary' && <span className="flex items-center gap-2"><Wallet size={15} /> Salary</span>}
          </button>
        ))}
      </div>

      {activeTab === 'Workers' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: '👷', label: 'Total Workers', value: workers.length, color: 'bg-sky-50 border-sky-100' },
              { icon: '💵', label: 'Daily Wage Total', value: `₦${dailyTotal.toLocaleString()}`, color: 'bg-emerald-50 border-emerald-100' },
              { icon: '📅', label: 'Monthly Salary Total', value: `₦${monthlySalaryTotal.toLocaleString()}`, color: 'bg-violet-50 border-violet-100' },
              { icon: '👑', label: 'Roles', value: [...new Set(workers.map(w => w.role))].length, color: 'bg-amber-50 border-amber-100' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} className={`${s.color} rounded-3xl p-5 border`}>
                <div className="text-2xl mb-3">{s.icon}</div>
                <div className="text-xl font-black text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {workers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
              <Users size={32} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold">No workers yet</p>
              <p className="text-slate-400 text-sm mt-1">Add your first farm worker</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedWorkers.map((w, i) => {
                  const roleInfo = getRoleInfo(w.role);
                  return (
                    <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                          {w.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-slate-900 truncate">{w.fullName}</h3>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-1 border ${roleInfo.color}`}>
                            {roleInfo.icon} {w.role}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">📞 Phone</span>
                          <span className="font-semibold text-slate-800">{w.phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">📅 Monthly Salary</span>
                          <span className="font-black text-emerald-600">₦{(w.monthlySalary || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">💵 Daily Rate</span>
                          <span className="font-semibold text-slate-700">₦{(w.dailyRate || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">📅 Joined</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(w.dateJoined).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {w.nextOfKin && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">👤 Next of Kin</span>
                            <span className="font-semibold text-slate-800">{w.nextOfKin}</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => setConfirmModal({ isOpen: true, id: w.id })}
                        className="mt-5 w-full py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all">
                        Remove Worker
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4 mt-4">
                  <span className="text-sm text-slate-500 font-medium">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, workers.length)} of {workers.length} workers
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
            </>
          )}
        </>
      )}

      {activeTab === 'Attendance' && (
        <div>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <Calendar size={18} className="text-slate-400" />
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)}
                className="outline-none text-sm font-semibold text-slate-700 bg-transparent" />
            </div>
            {attendanceData?.records && (
              <div className="flex gap-3 text-sm font-medium flex-wrap">
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                  ✅ {attendanceData.records.filter(r => r.attendance?.present).length} present
                </span>
                <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100">
                  ❌ {attendanceData.records.filter(r => r.attendance && !r.attendance.present).length} absent
                </span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl">
                  ⬜ {attendanceData.records.filter(r => !r.attendance).length} not marked
                </span>
              </div>
            )}
          </div>
          {attendanceLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Worker', 'Role', 'Daily Rate', 'Status', 'Notes'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {attendanceData?.records?.map((r, i) => (
                      <motion.tr key={r.workerId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                              {r.workerName.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">{r.workerName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{r.role}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600">₦{(r.dailyRate || 0).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          {r.attendance === null
                            ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">Not Marked</span>
                            : r.attendance.present
                              ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">✅ Present</span>
                              : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-600">❌ Absent</span>
                          }
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400 italic">{r.attendance?.notes || '—'}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {attendanceData?.records && (
                <div className="px-5 py-4 bg-emerald-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Total Wages Due — {new Date(attendanceDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    ₦{attendanceData.records.filter(r => r.attendance?.present).reduce((s, r) => s + (r.dailyRate || 0), 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Salary' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white">
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Monthly Salary</p>
              <p className="text-3xl font-black">₦{(salarySummary?.totalMonthlySalary ?? 0).toLocaleString()}</p>
              <p className="text-emerald-200 text-xs mt-2">Across {salarySummary?.totalWorkers ?? 0} active workers</p>
            </div>
            <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-6 text-white">
              <p className="text-violet-100 text-sm font-medium mb-1">Total Daily Wage</p>
              <p className="text-3xl font-black">₦{(salarySummary?.totalDailyRate ?? 0).toLocaleString()}</p>
              <p className="text-violet-200 text-xs mt-2">If all workers present today</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Salary by Role</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {salarySummary?.byRole?.map((r, i) => {
                const roleInfo = getRoleInfo(r.role);
                const pct = salarySummary.totalMonthlySalary > 0 ? Math.round((r.totalSalary / salarySummary.totalMonthlySalary) * 100) : 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }} className="px-6 py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl border ${roleInfo.color}`}>{roleInfo.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-bold text-slate-800">{r.role}</span>
                        <span className="text-sm font-black text-emerald-600">₦{r.totalSalary.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.3, duration: 0.8 }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{r.count} worker{r.count !== 1 ? 's' : ''} · {pct}% of total</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Individual Salaries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Worker', 'Role', 'Monthly Salary', 'Daily Rate'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {salarySummary?.workers?.map((w, i) => {
                    const roleInfo = getRoleInfo(w.role);
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white font-black text-sm">
                              {w.fullName?.charAt(0) ?? '?'}
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">{w.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${roleInfo.color}`}>
                            {roleInfo.icon} {w.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-black text-emerald-600 text-sm">₦{(w.monthlySalary ?? 0).toLocaleString()}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700 text-sm">₦{(w.dailyRate ?? 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-emerald-50 border-t border-slate-100">
                  <tr>
                    <td colSpan={2} className="px-5 py-4 font-bold text-slate-700">Total</td>
                    <td className="px-5 py-4 font-black text-emerald-600 text-lg">₦{(salarySummary?.totalMonthlySalary ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-4 font-black text-slate-700">₦{(salarySummary?.totalDailyRate ?? 0).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-xl">👷</div>
                  <h2 className="font-black text-xl text-slate-900">Add Worker</h2>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                      <button key={r.label} type="button" onClick={() => setForm({ ...form, role: r.label })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 text-left transition-all text-sm font-semibold ${
                          form.role === r.label ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                        <span>{r.icon}</span> {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input placeholder="Emeka Obi" value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                    <input placeholder="080..." value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Salary (₦)</label>
                    <input type="number" placeholder="e.g. 45000" value={form.monthlySalary}
                      onChange={e => setForm({ ...form, monthlySalary: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                    {form.monthlySalary && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1.5">
                        = ₦{Math.round(parseFloat(form.monthlySalary) / 26).toLocaleString()} per day
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date Joined</label>
                    <input type="date" value={form.dateJoined}
                      onChange={e => setForm({ ...form, dateJoined: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address (optional)</label>
                  <input placeholder="Worker's home address" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Next of Kin</label>
                    <input placeholder="Name" value={form.nextOfKin}
                      onChange={e => setForm({ ...form, nextOfKin: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Next of Kin Phone</label>
                    <input placeholder="080..." value={form.nextOfKinPhone}
                      onChange={e => setForm({ ...form, nextOfKinPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Add Worker</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAttendance(false)}>
            <motion.div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl"
              initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-xl">✅</div>
                  <h2 className="font-black text-xl text-slate-900">Mark Attendance</h2>
                </div>
                <button onClick={() => setShowAttendance(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAttendance} className="p-7 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Worker</label>
                  <select value={attendance.workerId} onChange={e => setAttendance({ ...attendance, workerId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required>
                    <option value="">Select worker</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input type="date" value={attendance.date} onChange={e => setAttendance({ ...attendance, date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: true, label: '✅ Present' }, { val: false, label: '❌ Absent' }].map(opt => (
                      <button key={String(opt.val)} type="button" onClick={() => setAttendance({ ...attendance, present: opt.val })}
                        className={`py-3 rounded-2xl font-bold text-sm border-2 transition-all ${
                          attendance.present === opt.val ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any notes..." value={attendance.notes} onChange={e => setAttendance({ ...attendance, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowAttendance(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Mark Attendance</motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmRemove}
        title="Remove Worker?"
        message="This worker will be removed from active staff. Their records will still be kept."
        confirmText="Yes, Remove"
        type="danger"
      />
    </div>
  );
}