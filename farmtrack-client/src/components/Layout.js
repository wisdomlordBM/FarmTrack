import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Bird, Egg, ShoppingCart,
  Users, LogOut, Menu, X, ChevronRight,
  Home, Wallet, Drumstick, Skull
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', end: true },
  { to: '/dashboard/flocks', icon: <Bird size={20} />, label: 'Flocks' },
  { to: '/dashboard/eggs', icon: <Egg size={20} />, label: 'Egg Records' },
  { to: '/dashboard/sales', icon: <ShoppingCart size={20} />, label: 'Sales' },
  { to: '/dashboard/workers', icon: <Users size={20} />, label: 'Workers' },
  { to: '/dashboard/expenses', icon: <Wallet size={20} />, label: 'Expenses' },
  { to: '/dashboard/bird-sales', icon: <Drumstick size={20} />, label: 'Bird Sales' },
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
    {/* Logo */}
<div className="p-6 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-xl">
        🐔
      </div>
      <div>
        <div className="font-extrabold text-gray-900 text-lg leading-none">FarmTrack</div>
        <div className="text-xs text-gray-400 mt-0.5">Farm Management</div>
      </div>
    </div>
    <button onClick={() => navigate('/')}
      className="p-2 rounded-xl hover:bg-gray-100 transition-all" title="Go to home">
      <Home size={18} className="text-gray-400" />
    </button>
  </div>
</div>

      {/* User */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-3">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm truncate">{user?.fullName}</div>
            <div className="text-xs text-green-600 font-medium">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={14} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-all"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile Topbar */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐔</span>
            <span className="font-bold text-green-600">FarmTrack</span>
          </div>
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}