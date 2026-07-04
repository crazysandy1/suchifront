import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Package, Leaf, BarChart3, QrCode, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
  </motion.div>
);

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        api.get('/products/stats'),
        api.get('/products?limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setProducts(productsRes.data.products || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const STATUS_COLORS = {
    harvested: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    packaged: 'bg-purple-100 text-purple-700',
    in_transit: 'bg-orange-100 text-orange-700',
    sold: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.business_name || user?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Farmer Dashboard — manage your organic products</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/products/add"
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-emerald-600 transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.total} icon={Package} color="bg-emerald-500" />
        <StatCard label="Harvested" value={stats?.harvested} icon={Leaf} color="bg-yellow-500" />
        <StatCard label="In Transit" value={stats?.in_transit} icon={BarChart3} color="bg-blue-500" />
        <StatCard label="Certified" value={stats?.certified} icon={QrCode} color="bg-green-600" />
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Products</h2>
          <Link to="/products" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No products yet</p>
            <Link to="/products/add"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
              <Plus className="w-4 h-4" /> Add your first product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.batch_number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[p.current_status] || 'bg-gray-100 text-gray-600'}`}>
                    {p.current_status?.replace('_', ' ')}
                  </span>
                  <Link to={`/supply-chain/${p.id}`}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    View chain
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
