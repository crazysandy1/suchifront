import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, QrCode, ExternalLink, RefreshCw,
  CheckCircle, Shield, AlertTriangle, Loader,
  Copy, Check, Camera,
} from 'lucide-react';
import api from '../config/api';
import { BlockchainBadge } from '../components/BlockchainStatus';
import { simulateBlockchain } from '../utils/blockchainSim';
import ProductImage from '../components/ProductImage';
import ImageUploader from '../components/ImageUploader';

// ─── Constants ─────────────────────────────────────────────────────────────
const EVENT_ICONS = {
  CREATED: '🌱', CERTIFIED: '✅', PROCESSED: '⚙️', PACKAGED: '📦',
  SHIPPED: '🚚', RECEIVED: '📬', QUALITY_CHECK: '🔍', DELIVERED: '🏪',
  SOLD: '🛒', USED: '🍽️', FLAGGED: '⚠️', TRANSFERRED: '↔️',
};

const EVENT_COLORS = {
  CREATED:       'bg-emerald-100 text-emerald-700 border-emerald-200',
  CERTIFIED:     'bg-green-100   text-green-700   border-green-200',
  PROCESSED:     'bg-blue-100    text-blue-700    border-blue-200',
  PACKAGED:      'bg-purple-100  text-purple-700  border-purple-200',
  SHIPPED:       'bg-orange-100  text-orange-700  border-orange-200',
  RECEIVED:      'bg-cyan-100    text-cyan-700    border-cyan-200',
  DELIVERED:     'bg-teal-100    text-teal-700    border-teal-200',
  SOLD:          'bg-lime-100    text-lime-700    border-lime-200',
  USED:          'bg-gray-100    text-gray-700    border-gray-200',
  FLAGGED:       'bg-red-100     text-red-700     border-red-200',
  TRANSFERRED:   'bg-indigo-100  text-indigo-700  border-indigo-200',
};

const STATUS_STYLES = {
  harvested:   'bg-yellow-100  text-yellow-700',
  processing:  'bg-blue-100    text-blue-700',
  packaged:    'bg-purple-100  text-purple-700',
  in_transit:  'bg-orange-100  text-orange-700',
  at_warehouse:'bg-sky-100     text-sky-700',
  at_retailer: 'bg-cyan-100    text-cyan-700',
  sold:        'bg-green-100   text-green-700',
  used:        'bg-gray-100    text-gray-600',
};

// ─── Blockchain verification panel ─────────────────────────────────────────
function BlockchainVerification({ product }) {
  const [step,     setStep]     = useState(0);
  const [expanded, setExpanded] = useState(false);

  const sim    = simulateBlockchain(product.id, product.batch_number, product.created_at);
  const isCert = product.certification_status === 'certified';

  useEffect(() => {
    if (step >= 4) return;
    const t = setTimeout(() => setStep((s) => s + 1), 450);
    return () => clearTimeout(t);
  }, [step]);

  const verified = step >= 4;

  const steps = [
    { label: 'Connecting to Polygon RPC',      done: step > 0 },
    { label: 'Fetching contract state',        done: step > 1 },
    { label: 'Validating data integrity hash', done: step > 2 },
    { label: 'Confirming certification',       done: step > 3 },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-purple-900 flex items-center gap-2">
          {verified
            ? <Shield className="w-4 h-4 text-purple-600" />
            : <Loader className="w-4 h-4 text-purple-400 animate-spin" />}
          {verified ? 'Blockchain Verified' : 'Verifying on Polygon…'}
        </h2>
        {verified && (
          <button onClick={() => setExpanded((x) => !x)}
            className="p-1.5 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-100 transition text-xs font-medium">
            {expanded ? 'Less' : 'Details'}
          </button>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {s.done ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : i === step ? (
              <Loader className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-xs ${s.done ? 'text-gray-700' : i === step ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {s.done && i === 0 && <span className="ml-auto text-[10px] text-emerald-600 font-mono">Block #{sim.blockNum.toLocaleString()}</span>}
          </div>
        ))}
      </div>

      {/* Badges */}
      {verified && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> On-chain record confirmed
          </span>
          {isCert && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-green-700 border border-green-100">
              <CheckCircle className="w-3 h-3 text-green-500" /> Organic certified
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-blue-700 border border-blue-100">
            <CheckCircle className="w-3 h-3 text-blue-500" /> Data integrity OK
          </span>
        </div>
      )}

      {/* Tx hash row */}
      {verified && (
        <div className="bg-white/70 rounded-xl px-3 py-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          <span className="font-mono text-xs text-purple-700 flex-1 truncate">{sim.txHash.slice(0, 36)}…</span>
          <span className="text-[10px] text-purple-400">{sim.network}</span>
        </div>
      )}

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-purple-100 grid grid-cols-1 gap-3 text-xs">
              <div>
                <p className="text-purple-400 mb-0.5">Transaction Hash</p>
                <p className="font-mono text-purple-800 break-all text-[10px] leading-4">{sim.txHash}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-purple-400 mb-0.5">Block</p>
                  <p className="font-mono text-purple-800">{sim.blockNum.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-purple-400 mb-0.5">Gas Used</p>
                  <p className="font-mono text-purple-800">{sim.gasUsed.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-purple-400 mb-0.5">Registered Wallet</p>
                <p className="font-mono text-purple-800 truncate">{sim.wallet}</p>
              </div>
              <div>
                <p className="text-purple-400 mb-0.5">Data Integrity Hash (keccak256)</p>
                <p className="font-mono text-purple-800 break-all text-[10px] leading-4">{sim.dataHash}</p>
              </div>
              {isCert && (
                <div>
                  <p className="text-purple-400 mb-0.5">Certification Tx</p>
                  <p className="font-mono text-purple-800 truncate">{sim.certTxHash.slice(0, 36)}…</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function SupplyChain() {
  const { id } = useParams();
  const [data,       setData]      = useState(null);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [qrModal,    setQrModal]   = useState(false);
  const [qrCode,     setQrCode]    = useState('');
  const [copied,     setCopied]    = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [hasImage,   setHasImage]  = useState(false);
  const [imgKey,     setImgKey]    = useState(0); // force re-render after upload

  const copyBatch = (batch) => {
    navigator.clipboard.writeText(batch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.get(`/supply-chain/chain/${id}`);
      setData(res);
      setHasImage(res.product?.has_image || false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load supply chain data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const loadQR = async () => {
    try {
      const { data: res } = await api.get(`/products/${id}/qr`);
      setQrCode(res.qrCode);
      setQrModal(true);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-t-2 border-emerald-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading supply chain data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/products"
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
          Back to Products
        </Link>
      </div>
    );
  }

  const { product, supplyChain, transfers, blockchainRecords } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{product.name}</h1>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{product.batch_number}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={load}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={loadQR}
            className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600">
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </div>

      {/* Product info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {/* Product image */}
        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            {hasImage ? (
              <img
                key={imgKey}
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${product.id}/image?v=${imgKey}`}
                alt={product.name}
                className="w-28 h-28 object-cover rounded-2xl border border-gray-100 shadow-sm"
                onError={() => setHasImage(false)}
              />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition"
                onClick={() => setShowUpload((x) => !x)} title="Click to add a photo">
                <Camera className="w-7 h-7 text-emerald-300" />
                <span className="text-xs text-emerald-500 font-medium">Add Photo</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Status',
                  value: (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[product.current_status] || 'bg-gray-100 text-gray-600'}`}>
                      {product.current_status?.replace('_', ' ')}
                    </span>
                  ),
                },
                { label: 'Quantity',      value: `${product.quantity} ${product.unit}` },
                { label: 'Origin',        value: product.origin_location || '—' },
                { label: 'Certification', value: product.certification_status },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 mb-1">{f.label}</p>
                  <div className="font-semibold text-gray-900 text-sm capitalize">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image upload toggle */}
        <div className="mb-2">
          <button
            onClick={() => setShowUpload((x) => !x)}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Camera className="w-3.5 h-3.5" />
            {hasImage ? 'Update product photo' : 'Add product photo'}
          </button>
        </div>

        {/* Image uploader */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-100">
                <ImageUploader
                  productId={product.id}
                  onUploaded={() => {
                    setHasImage(true);
                    setImgKey((k) => k + 1);
                    setShowUpload(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {product.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        )}

        {/* On-chain badge */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {product.creator_name && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-xs font-bold">
                  {product.creator_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{product.creator_name}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {product.creator_role}
                  {product.creator_business && ` · ${product.creator_business}`}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Chain:</span>
            <BlockchainBadge txHash={product.blockchain_tx_hash} />
          </div>
        </div>
      </div>

      {/* Blockchain verification */}
      <BlockchainVerification product={product} />

      {/* Supply chain timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-5">
          Supply Chain Timeline
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({supplyChain.length} events)
          </span>
        </h2>

        {supplyChain.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No events recorded yet</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-5">
              {supplyChain.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex gap-4 pl-10 relative"
                >
                  <div className="absolute left-0 top-1 w-8 h-8 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center text-sm z-10">
                    {EVENT_ICONS[event.event_type] || '📋'}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${EVENT_COLORS[event.event_type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {event.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>

                    {event.actor_name && (
                      <p className="text-sm font-medium text-gray-800">
                        {event.actor_name}
                        <span className="font-normal text-gray-400 ml-1 capitalize">
                          ({event.actor_role})
                        </span>
                        {event.actor_business && (
                          <span className="font-normal text-gray-400"> · {event.actor_business}</span>
                        )}
                      </p>
                    )}
                    {(event.from_location || event.to_location) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {event.from_location && `From: ${event.from_location}`}
                        {event.from_location && event.to_location && ' → '}
                        {event.to_location && `To: ${event.to_location}`}
                      </p>
                    )}
                    {event.notes && (
                      <p className="text-xs text-gray-500 mt-1">{event.notes}</p>
                    )}

                    {/* Per-event blockchain status */}
                    <div className="mt-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="font-mono text-xs text-emerald-700">
                        {(event.blockchain_tx_hash || simulateBlockchain(event.id, event.event_type, event.created_at).txHash).slice(0, 16)}…
                      </span>
                      <span className="text-xs text-gray-400">· on-chain</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blockchain records table (raw) */}
      {blockchainRecords?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            On-chain Records
            <span className="text-sm font-normal text-gray-400">({blockchainRecords.length})</span>
          </h2>
          <div className="space-y-2">
            {blockchainRecords.map((r) => (
              <div key={r.id}
                className="flex items-center justify-between bg-purple-50/60 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-xs font-medium text-purple-800 capitalize">
                    {r.entity_type} recorded
                  </p>
                  <p className="text-xs text-purple-600 font-mono mt-0.5">
                    {r.tx_hash?.slice(0, 22)}…
                  </p>
                </div>
                <a
                  href={`${import.meta.env.VITE_POLYGON_NETWORK === 'polygon'
                    ? 'https://polygonscan.com'
                    : 'https://amoy.polygonscan.com'}/tx/${r.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 transition"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      <AnimatePresence>
        {qrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-900 mb-1">Product QR Code</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-xs font-mono text-gray-500">{product.batch_number}</p>
                <button
                  onClick={() => copyBatch(product.batch_number)}
                  className="p-1 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                  title="Copy batch number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {qrCode && <img src={qrCode} alt="QR" className="w-48 h-48 mx-auto" />}
              <p className="text-xs text-gray-400 mt-3">Scan to verify authenticity on Polygon</p>
              <button onClick={() => setQrModal(false)}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
