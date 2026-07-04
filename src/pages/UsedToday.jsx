import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, RefreshCw, ShoppingCart } from 'lucide-react';
import api from '../config/api';

export default function UsedToday() {
  const [usages, setUsages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: '', purpose: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (dateFilter) params.append('date', dateFilter);
      const [uR, pR] = await Promise.all([
        api.get(`/supply-chain/used-today?${params}`),
        api.get('/products?limit=200'),
      ]);
      setUsages(uR.data.usages || []);
      setProducts(pR.data.products || []);
    } catch {}
    setLoading(false);
  }, [search, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/supply-chain/used-today', form);
      setShowForm(false);
      setForm({ productId: '', quantity: '', purpose: '', notes: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record usage');
    }
    setSubmitting(false);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayCount = usages.filter((u) => new Date(u.used_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Used Today</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today} · {todayCount} items logged today</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
            <Plus className="w-4 h-4" /> Log Usage
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Log Product Usage</h2>
          {error && <p className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
              <select value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
                required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.batch_number} ({p.current_status})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity Used</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} required
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
              <input type="text" value={form.purpose}
                onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Sold to customer, Personal consumption" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Optional additional notes" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                {submitting ? 'Logging...' : 'Log Usage'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} placeholder="Search by product..." onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : usages.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No usage records yet. Start by logging what you used today.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Product', 'Batch', 'Qty Used', 'Purpose', 'Origin', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usages.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900">{u.product_name}</p>
                      {u.category && <p className="text-xs text-gray-400">{u.category}</p>}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{u.batch_number}</td>
                    <td className="px-4 py-3.5 text-gray-700">{u.quantity} {u.unit}</td>
                    <td className="px-4 py-3.5 text-gray-600">{u.purpose || '—'}</td>
                    <td className="px-4 py-3.5 text-gray-500">{u.origin_location || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{new Date(u.used_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
