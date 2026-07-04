import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Leaf, Truck, ShoppingCart,
  History, LogOut, Menu, X, User, ChevronRight, QrCode,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_BY_ROLE = {
  farmer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Leaf, label: 'My Products' },
    { to: '/products/add', icon: Package, label: 'Add Product' },
    { to: '/entry', icon: Truck, label: 'Entry List' },
    { to: '/exit', icon: Truck, label: 'Exit List' },
  ],
  manufacturer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/products/add', icon: Package, label: 'Register Product' },
    { to: '/entry', icon: Truck, label: 'Entry List' },
    { to: '/exit', icon: Truck, label: 'Exit List' },
  ],
  distributor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/entry', icon: Truck, label: 'Receive Products' },
    { to: '/exit', icon: Truck, label: 'Dispatch Products' },
  ],
  retailer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Inventory' },
    { to: '/entry', icon: Truck, label: 'Receive Products' },
    { to: '/exit', icon: Truck, label: 'Dispatch' },
    { to: '/used-today', icon: ShoppingCart, label: 'Used Today' },
  ],
  consumer: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/track', icon: QrCode, label: 'Scan / Track' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/used-today', icon: History, label: 'My Food Log' },
  ],
};

const ROLE_COLORS = {
  farmer: 'from-emerald-500 to-green-600',
  manufacturer: 'from-blue-500 to-indigo-600',
  distributor: 'from-orange-500 to-amber-600',
  retailer: 'from-purple-500 to-violet-600',
  consumer: 'from-teal-500 to-cyan-600',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.consumer;
  const roleGradient = ROLE_COLORS[user?.role] || 'from-emerald-500 to-green-600';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`bg-gradient-to-r ${roleGradient} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">🌱</span>
          </div>
          <span className="text-white font-bold text-sm">OrganicTrace</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user?.name?.charAt(0)}</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-white/70 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 space-y-0.5">
        <Link to="/profile" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <User className="w-4 h-4 text-gray-400" />
          <span>Profile</span>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-white z-50 md:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 flex-1">OrganicTrace</span>
          <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
