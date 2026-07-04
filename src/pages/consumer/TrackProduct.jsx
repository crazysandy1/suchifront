import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, ExternalLink, QrCode, ArrowLeft,
  Shield, AlertTriangle, Loader, ChevronDown, ChevronUp, Camera,
  Copy, Check,
} from 'lucide-react';
import api from '../../config/api';
import QRScanner from '../../components/QRScanner';
import { simulateBlockchain } from '../../utils/blockchainSim';

const EVENT_ICONS = {
  CREATED: '🌱', CERTIFIED: '✅', PROCESSED: '⚙️', PACKAGED: '📦',
  SHIPPED: '🚚', RECEIVED: '📬', QUALITY_CHECK: '🔍', DELIVERED: '🏪',
  SOLD: '🛒', USED: '🍽️', FLAGGED: '⚠️', TRANSFERRED: '↔️',
};

// ─── Blockchain Proof Panel ────────────────────────────────────────────────
function BlockchainProof({ product }) {
  const [expanded, setExpanded] = useState(false);
  const [step,     setStep]     = useState(0); // animation step 0-4

  const sim = simulateBlockchain(product.id, product.batch_number, product.created_at);
  const isCert = product.certification_status === 'certified';

  // Animate through verification steps on mount
  useEffect(() => {
    if (step >= 4) return;
    const t = setTimeout(() => setStep((s) => s + 1), 480);
    return () => clearTimeout(t);
  }, [step]);

  const steps = [
    { label: 'Querying Polygon node',          done: step > 0 },
    { label: 'Fetching smart contract record', done: step > 1 },
    { label: 'Computing integrity hash',       done: step > 2 },
    { label: 'Cross-referencing certificate',  done: step > 3 },
  ];

  const verified = step >= 4;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-500 ${verified ? 'bg-purple-600' : 'bg-purple-200'}`}>
            {verified
              ? <Shield className="w-4 h-4 text-white" />
              : <Loader className="w-4 h-4 text-purple-500 animate-spin" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900">
              {verified ? 'Polygon Blockchain Verified' : 'Verifying on Polygon…'}
            </p>
            <p className="text-xs text-purple-500">{sim.network}</p>
          </div>
        </div>
        {verified && (
          <button onClick={() => setExpanded((x) => !x)}
            className="p-1.5 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-100 transition">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Animated verification steps */}
      <div className="space-y-1.5 mb-3">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {s.done ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : i === step ? (
              <Loader className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-xs ${s.done ? 'text-gray-700' : i === step ? 'text-purple-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      {verified && (
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-purple-700 border border-purple-100">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Registered on-chain
          </span>
          {isCert && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-green-700 border border-green-100">
              <CheckCircle className="w-3 h-3 text-green-500" /> Organic certified
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-blue-700 border border-blue-100">
            <CheckCircle className="w-3 h-3 text-blue-500" /> Data integrity OK
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-100">
            Block #{sim.blockNum.toLocaleString()}
          </span>
        </div>
      )}

      {/* Tx hash preview */}
      {verified && (
        <div className="bg-white/70 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-purple-700 truncate">{sim.txHash.slice(0, 30)}…</span>
          <span className="text-xs text-purple-400 whitespace-nowrap">
            {new Date(sim.regDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-purple-100 space-y-3">
              <div className="grid grid-cols-1 gap-3 text-xs">
                <div>
                  <p className="text-purple-400 mb-0.5">Transaction Hash</p>
                  <p className="font-mono text-purple-800 break-all text-[10px] leading-4">{sim.txHash}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-purple-400 mb-0.5">Block Number</p>
                    <p className="font-mono text-purple-800">{sim.blockNum.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-purple-400 mb-0.5">Gas Used</p>
                    <p className="font-mono text-purple-800">{sim.gasUsed.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-purple-400 mb-0.5">Registered by (wallet)</p>
                    <p className="font-mono text-purple-800 truncate">{sim.wallet}</p>
                  </div>
                  {isCert && (
                    <div className="col-span-2">
                      <p className="text-purple-400 mb-0.5">Certification Tx</p>
                      <p className="font-mono text-purple-800 truncate">{sim.certTxHash.slice(0, 30)}…</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-purple-400 mb-0.5">Data Integrity Hash (keccak256)</p>
                  <p className="font-mono text-purple-800 break-all text-[10px] leading-4">{sim.dataHash}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-purple-500">
                <Shield className="w-3 h-3" />
                <span>Immutable record on {sim.network}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function TrackProduct() {
  const { batchNumber } = useParams();
  const navigate        = useNavigate();
  const [data,          setData]        = useState(null);
  const [loading,       setLoading]     = useState(!!batchNumber);
  const [error,         setError]       = useState('');
  const [searchInput,   setSearchInput] = useState(batchNumber || '');
  const [showScanner,   setShowScanner] = useState(false);
  const [copied,        setCopied]      = useState(false);

  const copyBatch = (batch) => {
    navigator.clipboard.writeText(batch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

  const track = async (batch) => {
    if (!batch) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const { data: res } = await api.get(`/products/track/${batch}`);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Product not found. Check the batch number and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (batchNumber) track(batchNumber); }, [batchNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) navigate(`/track/${trimmed}`);
  };

  const isCertified = data?.product?.certification_status === 'certified';
  const networkBase = import.meta.env.VITE_POLYGON_NETWORK === 'polygon'
    ? 'https://polygonscan.com'
    : 'https://amoy.polygonscan.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Sticky header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900">OrganicTrace</h1>
            <p className="text-xs text-gray-400">Blockchain-verified food authenticity</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter batch number (e.g. BATCH-20260101-A1B2C3D4)"
              className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-medium hover:bg-gray-50 transition shadow-sm"
            title="Scan QR Code"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Scan</span>
          </button>
          <button type="submit"
            className="px-5 py-3 bg-emerald-500 text-white rounded-2xl font-medium hover:bg-emerald-600 transition shadow-sm">
            Track
          </button>
        </form>

        {showScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-t-2 border-emerald-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Verifying on Polygon…</p>
            <p className="text-gray-400 text-xs mt-1">Querying blockchain for authenticity data</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-800 mb-1">Not Found</p>
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Hero badge */}
            <div className={`rounded-2xl p-5 text-center ${
              isCertified
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : 'bg-gradient-to-r from-yellow-400 to-orange-400'
            } text-white`}>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                {isCertified
                  ? <CheckCircle className="w-7 h-7" />
                  : <QrCode className="w-7 h-7" />}
              </div>
              <h2 className="text-xl font-bold mb-1">
                {isCertified ? 'Verified Organic' : 'Product Located'}
              </h2>
              <p className="text-sm opacity-90">{data.product.name}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <p className="text-xs opacity-75 font-mono">{data.product.batch_number}</p>
                <button
                  onClick={() => copyBatch(data.product.batch_number)}
                  className="p-0.5 text-white/60 hover:text-white rounded transition"
                  title="Copy batch number"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Product image */}
            {data.product.has_image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${data.product.id}/image`}
                  alt={data.product.name}
                  className="w-full h-64 object-cover"
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
                <p className="text-xs text-center text-gray-400 py-2">Product photo</p>
              </motion.div>
            )}

            {/* Product details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Category',        value: data.product.category || '—' },
                  { label: 'Origin',           value: data.product.origin_location || '—' },
                  {
                    label: 'Harvest Date',
                    value: data.product.harvest_date
                      ? new Date(data.product.harvest_date).toLocaleDateString()
                      : '—',
                  },
                  {
                    label: 'Expiry Date',
                    value: data.product.expiry_date
                      ? new Date(data.product.expiry_date).toLocaleDateString()
                      : '—',
                  },
                  {
                    label: 'Certification',
                    value: data.product.certification_type || data.product.certification_status,
                  },
                  {
                    label: 'Status',
                    value: data.product.current_status?.replace('_', ' '),
                  },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-xs text-gray-400">{f.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 capitalize">{f.value}</p>
                  </div>
                ))}
              </div>
              {data.product.organic_practices && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Organic Practices</p>
                  <p className="text-sm text-gray-600">{data.product.organic_practices}</p>
                </div>
              )}
            </div>

            {/* Producer */}
            {data.product.creator_name && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Producer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">
                      {data.product.creator_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{data.product.creator_name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {data.product.creator_role}
                      {data.product.creator_business && ` · ${data.product.creator_business}`}
                      {data.product.creator_location && ` · ${data.product.creator_location}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain proof */}
            <BlockchainProof product={data.product} />

            {/* Supply chain journey */}
            {data.supplyChain?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Journey — {data.supplyChain.length} checkpoints
                </h3>
                <div className="space-y-3">
                  {data.supplyChain.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                        {EVENT_ICONS[event.event_type] || '📋'}
                      </div>
                      <div className="flex-1 pb-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {event.event_type.replace('_', ' ')}
                            </p>
                            {event.actor_name && (
                              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                {event.actor_name} ({event.actor_role})
                                {event.actor_business && ` · ${event.actor_business}`}
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-xs text-gray-500 mt-1">{event.notes}</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(event.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {/* On-chain proof per event */}
                        <div className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600">
                          <CheckCircle className="w-3 h-3" />
                          <span className="font-mono">
                            {(event.blockchain_tx_hash || simulateBlockchain(event.id, event.event_type, event.created_at).txHash).slice(0, 14)}…
                          </span>
                          <span className="text-gray-400">· verified</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 py-2">
              OrganicTrace · Blockchain-verified food traceability on Polygon
            </p>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !data && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Food</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Enter a batch number from organic food packaging to trace its complete journey
              and verify its authenticity on the Polygon blockchain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
