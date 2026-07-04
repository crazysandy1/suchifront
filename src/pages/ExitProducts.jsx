import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, RefreshCw, Truck } from 'lucide-react';
import api from '../config/api';
import ProductImage from '../components/ProductImage';

export default function ExitProducts() {
  const [exits, setExits] = useState([]);
  const [products, setProducts] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', toUserId: '', quantity: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const [eR, pR, sR] = await Promise.all([
        api.get(`/supply-chain/exit?${params}`),
        api.get('/products?limit=100'),
        api.get('/supply-chain/stakeholders'),
      ]);
      setExits(eR.data.exits || []);
      setProducts(pR.data.products || []);
      setStakeholders(sR.data.stakeholders || []);
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/supply-chain/exit', form);
      setShowForm(false);
      setForm({ productId: '', toUserId: '', quantity: '', notes: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record dispatch');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exit Product List</h1>
          <p className="text-sm text-gray-500 mt-0.5">Products you have dispatched</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowForm((p) => !p)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
            <Plus className="w-4 h-4" /> Record Dispatch
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Dispatch Product</h2>
          {error && <p className="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-xl">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product</label>
              <select value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
                required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.batch_number}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Send To</label>
              <select value={form.toUserId} onChange={(e) => setForm((p) => ({ ...p, toUserId: e.target.value }))}
                required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select recipient...</option>
                {stakeholders.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role}) — {s.business_name || s.location || s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <input type="number" min="0.01" step="0.01" value={form.quantity} required
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Qty dispatched" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Optional notes" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
                {submitting ? 'Dispatching...' : 'Record Dispatch'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} placeholder="Search..." onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : exits.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No dispatches recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Photo', 'Product', 'Batch', 'Qty Sent', 'Sent To', 'Role', 'Dispatched At'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exits.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ProductImage productId={e.product_id} hasImage={e.has_image} alt={e.product_name} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">{e.product_name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{e.batch_number}</td>
                    <td className="px-4 py-3.5 text-gray-700">{e.quantity} {e.unit}</td>
                    <td className="px-4 py-3.5 text-gray-700">{e.to_name || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium capitalize">
                        {e.to_role || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(e.transferred_at).toLocaleDateString()}</td>
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
