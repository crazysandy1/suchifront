import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Package, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

export default function RetailerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sR, uR] = await Promise.all([
        api.get('/products/stats'),
        api.get('/supply-chain/used-today?limit=5'),
      ]);
      setStats(sR.data.stats);
      setUsages(uR.data.usages || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.business_name || user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Retailer Dashboard — manage your store</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Products Received', value: stats?.total_received, icon: Package, color: 'bg-purple-500' },
          { label: 'Used Today', value: usages.length, icon: ShoppingCart, color: 'bg-emerald-500' },
          { label: 'Active Lines', value: stats?.total_received, icon: Star, color: 'bg-yellow-500' },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{s.label}</span>
              <div className={`w-9 h-9 ${s.color} rounded-xl flex items-center justify-center`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value ?? '—'}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { to: '/entry', title: 'Receive Products', desc: 'Log incoming products from distributors' },
          { to: '/used-today', title: 'Used Today', desc: 'Record products sold or consumed today' },
          { to: '/products', title: 'View Inventory', desc: 'Browse all products you carry' },
          { to: '/exit', title: 'Dispatch', desc: 'Send products to customers' },
        ].map((a) => (
          <Link key={a.to} to={a.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition" />
            </div>
          </Link>
        ))}
      </div>

      {usages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Usage</h2>
            <Link to="/used-today" className="text-sm text-purple-600 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {usages.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{u.product_name}</p>
                  <p className="text-xs text-gray-400">{u.batch_number} · {u.quantity} {u.unit}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(u.used_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
