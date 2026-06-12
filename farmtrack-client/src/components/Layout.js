import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Bird, Egg, ShoppingCart,
  Users, LogOut, Menu, X, ChevronRight,
  Home, Wallet, Drumstick, Skull, PackageOpen
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
  { to: '/dashboard/flocks', icon: <Bird size={20} />, label: 'Flocks' },
  { to: '/dashboard/eggs', icon: <Egg size={20} />, label: 'Egg Records' },
  { to: '/dashboard/sales', icon: <ShoppingCart size={20} />, label: 'Sales' },
  { to: '/dashboard/workers', icon: <Users size={20} />, label: 'Workers' },
  { to: '/dashboard/expenses', icon: <Wallet size={20} />, label: 'Expenses' },
  { to: '/dashboard/bird-sales', icon: <Drumstick size={20} />, label: 'Bird Sales' },
  { to: '/dashboard/manure-sales', icon: <PackageOpen size={20} />, label: 'Manure Sales' },
  { to: '/dashboard/mortality', icon: <Skull size={20} />, label: 'Mortality' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              🐔
            </div>
            <div>
              <div className="font-bold text-slate-900 text-2xl leading-none">FarmTrack</div>
              <div className="text-xs text-slate-500 mt-0.5">Poultry Management</div>
            </div>
          </div>
          <button onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-slate-100 transition-all" title="Go to home">
            <Home size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl px-4 py-4">
          <div className="w-10 h-10 bg-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 truncate">{user?.fullName}</div>
            <div className="text-xs text-emerald-700 font-medium">{user?.role}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={16} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 font-medium text-sm transition-all">
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl overflow-y-auto">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-all">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐔</span>
            <span className="font-bold text-emerald-700 text-lg">FarmTrack</span>
          </div>
          <div className="w-9 h-9 bg-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}