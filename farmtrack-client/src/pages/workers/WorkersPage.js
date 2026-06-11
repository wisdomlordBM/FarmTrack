import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, ClipboardCheck, Calendar } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const tabs = ['Workers', 'Attendance'];

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState('Workers');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', role: '', dailyRate: '', dateJoined: ''
  });
  const [attendance, setAttendance] = useState({
    workerId: '', date: new Date().toISOString().split('T')[0],
    present: true, notes: ''
  });

  const load = () => {
    API.get('/worker')
      .then(res => setWorkers(res.data))
      .catch(() => toast.error('Failed to load workers'))
      .finally(() => setLoading(false));
  };

  const loadAttendance = (date) => {
    setAttendanceLoading(true);
    API.get(`/worker/attendance?date=${date}`)
      .then(res => setAttendanceData(res.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setAttendanceLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (activeTab === 'Attendance') {
      loadAttendance(attendanceDate);
    }
  }, [activeTab, attendanceDate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post('/worker', { ...form, dailyRate: parseFloat(form.dailyRate) });
      toast.success('Worker added! 👷');
      setShowAdd(false);
      setForm({ fullName: '', phone: '', role: '', dailyRate: '', dateJoined: '' });
      load();
    } catch {
      toast.error('Failed to add worker');
    }
  };

  const handleAttendance = async (e) => {
    e.preventDefault();
    try {
      await API.post('/worker/attendance', {
        ...attendance, workerId: parseInt(attendance.workerId)
      });
      toast.success('Attendance marked! ✅');
      setShowAttendance(false);
      if (activeTab === 'Attendance') loadAttendance(attendanceDate);
    } catch {
      toast.error('Failed to mark attendance');
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Remove this worker?')) return;
    try {
      await API.put(`/worker/${id}/deactivate`);
      toast.success('Worker removed');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalDaily = workers.reduce((s, w) => s + w.dailyRate, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Workers</h1>
          <p className="text-gray-500 mt-1">{workers.length} active worker{workers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAttendance(true)}
            className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-green-50 transition-all">
            <ClipboardCheck size={18} /> Mark Attendance
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
            <Plus size={18} /> Add Worker
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'Workers' ? <span className="flex items-center gap-2"><Users size={15} /> Workers</span>
              : <span className="flex items-center gap-2"><Calendar size={15} /> Attendance</span>}
          </button>
        ))}
      </div>

      {/* Workers Tab */}
      {activeTab === 'Workers' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: '👷', label: 'Total Workers', value: workers.length, color: 'bg-blue-50' },
              { icon: '💵', label: 'Daily Wage Total', value: `₦${totalDaily.toLocaleString()}`, color: 'bg-green-50' },
              { icon: '📅', label: 'Monthly Estimate', value: `₦${(totalDaily * 26).toLocaleString()}`, color: 'bg-purple-50' },
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

          {workers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No workers yet</p>
              <p className="text-gray-400 text-sm mt-1">Add your first farm worker</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workers.map((w, i) => (
                <motion.div key={w.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                      {w.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{w.fullName}</h3>
                      <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                        {w.role}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">📞 Phone</span>
                      <span className="font-medium text-gray-800">{w.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">💵 Daily Rate</span>
                      <span className="font-bold text-green-600">₦{w.dailyRate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">📅 Joined</span>
                      <span className="font-medium text-gray-800">
                        {new Date(w.dateJoined).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => deactivate(w.id)}
                    className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                    Remove Worker
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === 'Attendance' && (
        <div>
          {/* Date picker */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="outline-none text-sm font-medium text-gray-700 bg-transparent" />
            </div>
            <span className="text-sm text-gray-500">
              {attendanceData?.records
                ? `${attendanceData.records.filter(r => r.attendance?.present).length} present, ${attendanceData.records.filter(r => r.attendance && !r.attendance.present).length} absent, ${attendanceData.records.filter(r => !r.attendance).length} not marked`
                : ''}
            </span>
          </div>

          {attendanceLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Worker', 'Role', 'Daily Rate', 'Status', 'Notes'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceData?.records?.map((r, i) => (
                    <motion.tr key={r.workerId}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {r.workerName.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{r.workerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{r.role}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-green-600">₦{r.dailyRate.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        {r.attendance === null ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                            Not Marked
                          </span>
                        ) : r.attendance.present ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            ✅ Present
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                            ❌ Absent
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 italic">
                        {r.attendance?.notes || '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Daily wage summary */}
              {attendanceData?.records && (
                <div className="px-5 py-4 bg-green-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Wages Due for {new Date(attendanceDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-lg font-extrabold text-green-600">
                    ₦{attendanceData.records
                      .filter(r => r.attendance?.present)
                      .reduce((s, r) => s + r.dailyRate, 0)
                      .toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Worker Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">Add Worker</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input placeholder="Emeka Obi" value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input placeholder="080..." value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required>
                      <option value="">Select role</option>
                      <option>Farm Hand</option>
                      <option>Supervisor</option>
                      <option>Driver</option>
                      <option>Cleaner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate (₦)</label>
                    <input type="number" placeholder="3000" value={form.dailyRate}
                      onChange={e => setForm({ ...form, dailyRate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Joined</label>
                  <input type="date" value={form.dateJoined}
                    onChange={e => setForm({ ...form, dateJoined: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200">Add Worker</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {showAttendance && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAttendance(false)}
          >
            <motion.div className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="font-bold text-xl text-gray-900">Mark Attendance</h2>
                <button onClick={() => setShowAttendance(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
              </div>
              <form onSubmit={handleAttendance} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Worker</label>
                  <select value={attendance.workerId}
                    onChange={e => setAttendance({ ...attendance, workerId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required>
                    <option value="">Select worker</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input type="date" value={attendance.date}
                    onChange={e => setAttendance({ ...attendance, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ val: true, label: '✅ Present' }, { val: false, label: '❌ Absent' }].map(opt => (
                      <button key={String(opt.val)} type="button"
                        onClick={() => setAttendance({ ...attendance, present: opt.val })}
                        className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                          attendance.present === opt.val
                            ? 'border-green-600 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                  <input placeholder="Any notes..." value={attendance.notes}
                    onChange={e => setAttendance({ ...attendance, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-gray-50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAttendance(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-200">Mark Attendance</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}