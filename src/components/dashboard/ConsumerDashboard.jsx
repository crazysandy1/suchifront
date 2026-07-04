import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, History, Search, Shield, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import QRScanner from '../QRScanner';

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchInput, setBatchInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (result) => {
    setShowScanner(false);
    let batch = result.trim();
    try {
      const parsed = JSON.parse(batch);
      batch = parsed.batch || parsed.batchNumber || parsed.id || batch;
    } catch {
      const urlMatch = batch.match(/\/track\/([A-Z0-9-]+)/i);
      if (urlMatch) batch = urlMatch[1];
    }
    navigate(`/track/${batch}`);
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/supply-chain/used-today?limit=10');
      setHistory(r.data.usages || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500 text-sm mt-1">Verify the authenticity of your organic food</p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Track by batch number or QR */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-1">Track Your Food</h2>
        <p className="text-emerald-100 text-sm mb-4">Scan a QR code or enter a batch number to verify authenticity</p>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition text-sm shadow-md"
          >
            <QrCode className="w-4 h-4" /> Scan QR Code
          </button>
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (batchInput.trim()) navigate(`/track/${batchInput.trim()}`); }}>
          <input
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Or enter batch number manually…"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 text-white placeholder-emerald-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
          <button
            type="submit"
            disabled={!batchInput.trim()}
            className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" /> Track
          </button>
        </form>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/used-today', icon: History, title: 'My Food Log', desc: 'View your food usage history', color: 'bg-blue-500' },
          { to: '/track', icon: QrCode, title: 'Scan & Verify', desc: 'Scan QR code to verify food authenticity', color: 'bg-emerald-500' },
          { to: '/products', icon: Shield, title: 'Verified Products', desc: 'Browse certified organic products', color: 'bg-purple-500' },
        ].map((a) => (
          <Link key={a.title} to={a.to}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition group">
            <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center mb-3`}>
              <a.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold text-gray-900">{a.title}</p>
            <p className="text-sm text-gray-500 mt-1">{a.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-sm text-gray-400 group-hover:text-emerald-500 transition">
              Open <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Food history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">My Food Log</h2>
          <Link to="/used-today" className="text-sm text-emerald-600 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center">
            <History className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No food logged yet. Start by scanning a QR code or tracking a batch number.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-gray-900">{h.product_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {h.batch_number} · {h.origin_location && `Origin: ${h.origin_location}`}
                  </p>
                </div>
                <div className="text-right">
                  <Link to={`/track/${h.batch_number}`}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Verify
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(h.used_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
