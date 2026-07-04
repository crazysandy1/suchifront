import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, QrCode, Eye, RefreshCw, Copy, Check, Upload, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import ProductImage from '../../components/ProductImage';

const STATUS_STYLES = {
  harvested: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  packaged: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-orange-100 text-orange-700',
  at_retailer: 'bg-cyan-100 text-cyan-700',
  sold: 'bg-green-100 text-green-700',
  used: 'bg-gray-100 text-gray-600',
};

const CERT_STYLES = {
  certified: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [qrModal, setQrModal] = useState(null);
  const [copied,  setCopied]  = useState(false);

  const copyBatch = (batch) => {
    navigator.clipboard.writeText(batch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canAdd = ['farmer', 'manufacturer'].includes(user?.role);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const loadQR = async (productId) => {
    try {
      const { data } = await api.get(`/products/${productId}/qr`);
      setQrModal({ qrCode: data.qrCode, batchNumber: data.batchNumber });
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total ?? '—'} products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canAdd && (
            <Link to="/products/add"
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} placeholder="Search name or batch number..."
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All statuses</option>
          {Object.keys(STATUS_STYLES).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No products found</p>
            {canAdd && (
              <Link to="/products/add"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium">
                <Plus className="w-4 h-4" /> Add first product
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Photo', 'Product', 'Batch Number', 'Quantity', 'Status', 'Cert.', 'Actions'].map((h) => (
                      <th key={h} className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <motion.tr key={p.id} whileHover={{ backgroundColor: '#f9fafb' }}>
                      <td className="px-4 py-3">
                        <ProductImage productId={p.id} hasImage={p.has_image} alt={p.name} size="sm" />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-500">{p.batch_number}</td>
                      <td className="px-4 py-3.5 text-gray-700">{p.quantity} {p.unit}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[p.current_status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.current_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${CERT_STYLES[p.certification_status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.certification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => loadQR(p.id)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                            <QrCode className="w-4 h-4" />
                          </button>
                          <Link to={`/supply-chain/${p.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                  <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-1">QR Code</h3>
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-xs text-gray-500 font-mono">{qrModal.batchNumber}</p>
              <button
                onClick={() => copyBatch(qrModal.batchNumber)}
                className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                title="Copy batch number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <img src={qrModal.qrCode} alt="QR" className="w-48 h-48 mx-auto" />
            <p className="text-xs text-gray-400 mt-3">Scan to verify authenticity on blockchain</p>
            <button onClick={() => setQrModal(null)}
              className="mt-4 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
