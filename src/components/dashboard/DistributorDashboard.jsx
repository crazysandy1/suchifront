import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Package, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

export default function DistributorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/products/stats');
      setStats(r.data.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.business_name || user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Distributor Dashboard — track shipments</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Handled', value: stats?.total_handled, icon: Package, color: 'bg-orange-500' },
          { label: 'Received', value: stats?.received, icon: Truck, color: 'bg-blue-500' },
          { label: 'Dispatched', value: stats?.dispatched, icon: ArrowRight, color: 'bg-green-500' },
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { to: '/entry', title: 'Receive Products', desc: 'Record incoming deliveries from manufacturers', color: 'emerald' },
          { to: '/exit', title: 'Dispatch Products', desc: 'Send products to retailers', color: 'orange' },
          { to: '/products', title: 'View Products', desc: 'Browse all products in your custody', color: 'blue' },
          { to: '/products', title: 'Track Shipment', desc: 'Search and view full supply chain for any product', color: 'purple' },
        ].map((a) => (
          <Link key={a.to} to={a.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">Blockchain Traceability Active</h3>
        <p className="text-sm text-amber-700">
          All product transfers are recorded on the Polygon blockchain, creating a tamper-proof audit trail visible to all stakeholders.
        </p>
      </div>
    </div>
  );
}
