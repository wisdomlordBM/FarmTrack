import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Phone, Mail, MapPin, Edit3, Lock, Camera } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const resizeImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 300;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = reject;
    img.src = event.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function FarmProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ farmName: '', phone: '', email: '', address: '', logoUrl: '' });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    API.get('/farmprofile')
      .then(res => {
        const data = {
          farmName: res.data.farmName || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          address: res.data.address || '',
          logoUrl: res.data.logoUrl || ''
        };
        setProfile({ ...data, isSetup: res.data.isSetup });
        setForm(data);
        setEditMode(!res.data.isSetup); // first-time setup goes straight to edit
      })
      .catch(() => toast.error('Failed to load farm profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setForm(f => ({ ...f, logoUrl: dataUrl }));
    } catch {
      toast.error('Could not load image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/farmprofile', form);
      setProfile({ ...form, isSetup: true });
      setEditMode(false);
      toast.success('Farm profile saved! 🎉');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setChangingPw(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      toast.success('Password changed successfully! 🔒');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Farm Profile</h1>
        <p className="text-slate-500 mt-1">This information appears on every receipt you generate</p>
      </div>

      {/* VIEW MODE */}
      {!editMode && profile && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-start justify-between mb-5 gap-4">
            <div className="flex items-center gap-4">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Farm logo" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl border border-emerald-100">🐔</div>
              )}
              <div>
                <div className="font-black text-lg text-slate-900">{profile.farmName}</div>
                {profile.phone && <div className="text-sm text-slate-500">{profile.phone}</div>}
                {profile.email && <div className="text-sm text-slate-500">{profile.email}</div>}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-2xl border border-emerald-100 transition-all flex-shrink-0">
              <Edit3 size={15} /> Edit
            </motion.button>
          </div>
          {profile.address && (
            <div className="flex items-start gap-2 text-sm text-slate-500 border-t border-slate-100 pt-4">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" />
              {profile.address}
            </div>
          )}
        </motion.div>
      )}

      {/* EDIT MODE */}
      {editMode && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo preview" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl border border-slate-200">🐔</div>
                )}
                <label className="absolute -bottom-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white cursor-pointer shadow-lg hover:bg-emerald-700 transition-all">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              </div>
              <div className="text-sm text-slate-500">
                Tap the camera icon to choose a logo from your gallery.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Building2 size={14} className="inline mr-1.5 -mt-0.5" />
                Farm Name
              </label>
              <input placeholder="e.g. Grace Poultry Farm" value={form.farmName}
                onChange={e => setForm({ ...form, farmName: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900"
                required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Phone size={14} className="inline mr-1.5 -mt-0.5" />
                  Phone Number
                </label>
                <input placeholder="e.g. 08012345678" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail size={14} className="inline mr-1.5 -mt-0.5" />
                  Email
                </label>
                <input placeholder="e.g. farm@gmail.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={14} className="inline mr-1.5 -mt-0.5" />
                Farm Address
              </label>
              <input placeholder="e.g. Km 5, Lagos-Ibadan Expressway, Lagos" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" />
            </div>

            <div className="flex gap-3 pt-1">
              {profile?.isSetup && (
                <button type="button" onClick={() => { setForm(profile); setEditMode(false); }}
                  className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">
                  Cancel
                </button>
              )}
              <motion.button type="submit" disabled={saving}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-60">
                {saving
                  ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <><Save size={18} /> {profile?.isSetup ? 'Update Profile' : 'Save Farm Profile'}</>
                }
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {!editMode && (
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sm text-sky-700">
          💡 Every receipt you generate (egg, bird, and manure sales) automatically shows this information at the top, along with a QR code customers can scan to verify the receipt is genuine.
        </div>
      )}

      {/* CHANGE PASSWORD */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
            <Lock size={18} />
          </div>
          <h2 className="font-black text-lg text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
            <input type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input type="password" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <input type="password" value={pwForm.confirmPassword}
                onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-slate-50 text-slate-900" required minLength={6} />
            </div>
          </div>
          <motion.button type="submit" disabled={changingPw}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-all disabled:opacity-60">
            {changingPw
              ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <><Lock size={18} /> Change Password</>
            }
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}