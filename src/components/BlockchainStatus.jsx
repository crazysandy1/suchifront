/**
 * BlockchainStatus — real-time on-chain confirmation tracker.
 *
 * Usage modes:
 *   1. Provide `txHash`   — polls /api/blockchain/tx/:txHash for receipt status.
 *   2. Provide `productId` + no txHash — polls /api/products/:productId until
 *      blockchain_tx_hash is populated, then switches to mode 1.
 *
 * States: queued → pending → confirmed | failed | unavailable
 *
 * Props:
 *   txHash      {string}  Ethereum transaction hash (optional)
 *   productId   {string}  Product UUID for indirect polling (optional)
 *   compact     {bool}    Render as inline badge instead of full card (default false)
 *   onConfirmed {fn}      Called with { txHash, blockNumber, explorerUrl } on confirm
 *   className   {string}  Extra Tailwind classes
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, CheckCircle, XCircle, Clock, Loader, Shield } from 'lucide-react';
import api from '../config/api';

const POLL_INTERVAL_MS = 5_000;   // 5 s while pending
const TIMEOUT_MS       = 300_000; // 5 min before giving up

const STATES = {
  queued:      { label: 'Queued for Polygon',          color: 'gray',   Icon: Clock       },
  pending:     { label: 'Broadcasting to Polygon…',    color: 'yellow', Icon: Loader      },
  confirmed:   { label: 'Confirmed on Polygon',         color: 'green',  Icon: CheckCircle },
  failed:      { label: 'Transaction failed',           color: 'red',    Icon: XCircle     },
  unavailable: { label: 'Blockchain not configured',    color: 'gray',   Icon: Shield      },
};

const COLOR_MAP = {
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-600',   dot: 'bg-gray-400'   },
  yellow: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-400'  },
  green:  { bg: 'bg-emerald-50',border: 'border-emerald-200',text:'text-emerald-700', dot: 'bg-emerald-500'},
  red:    { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',    dot: 'bg-red-500'    },
};

export default function BlockchainStatus({
  txHash:      initialTxHash,
  productId,
  compact      = false,
  onConfirmed,
  className    = '',
}) {
  const [phase,    setPhase]    = useState(initialTxHash ? 'pending' : 'queued');
  const [txHash,   setTxHash]   = useState(initialTxHash || null);
  const [details,  setDetails]  = useState(null);   // { blockNumber, confirmations, explorerUrl }
  const [elapsed,  setElapsed]  = useState(0);

  const startedAt = useRef(Date.now());
  const timer     = useRef(null);

  const stopPolling = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }, []);

  // ── Polling logic ─────────────────────────────────────────────────────────
  const poll = useCallback(async (currentTxHash, currentProductId) => {
    setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));

    // Timeout safety valve
    if (Date.now() - startedAt.current > TIMEOUT_MS) {
      stopPolling();
      return;   // stay in "pending" — user can check explorer manually
    }

    try {
      // Phase 1: no tx hash yet → poll product record
      if (!currentTxHash && currentProductId) {
        const { data } = await api.get(`/products/${currentProductId}`);
        const hash = data.product?.blockchain_tx_hash;
        if (hash) {
          setTxHash(hash);
          setPhase('pending');
          // next poll cycle will check the receipt
        }
        return;
      }

      // Phase 2: have tx hash → check receipt
      if (currentTxHash) {
        const { data } = await api.get(`/blockchain/tx/${currentTxHash}`);

        if (data.status === 'confirmed') {
          setPhase('confirmed');
          setDetails({
            blockNumber:   data.blockNumber,
            confirmations: data.confirmations,
            explorerUrl:   data.explorerUrl,
            gasUsed:       data.gasUsed,
          });
          stopPolling();
          onConfirmed?.({
            txHash:      currentTxHash,
            blockNumber: data.blockNumber,
            explorerUrl: data.explorerUrl,
          });
        } else if (data.status === 'failed') {
          setPhase('failed');
          stopPolling();
        } else if (data.status === 'unavailable') {
          setPhase('unavailable');
          stopPolling();
        }
        // 'pending' → keep polling
      }
    } catch {
      // Network error — silently continue polling
    }
  }, [stopPolling, onConfirmed]);

  // ── Mount / prop change → start polling ──────────────────────────────────
  useEffect(() => {
    if (!initialTxHash && !productId) return;

    let latestTxHash = initialTxHash || null;

    // Subscribe to txHash state changes so the closure stays fresh
    const pollStep = async () => {
      await poll(latestTxHash, productId);
      // After poll, check if txHash state updated
      latestTxHash = txHash || latestTxHash;
    };

    timer.current = setInterval(pollStep, POLL_INTERVAL_MS);

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTxHash, productId]);

  // Sync latestTxHash when txHash state changes
  useEffect(() => {
    if (txHash) {
      // Re-trigger a fresh poll cycle immediately once we have a hash
      poll(txHash, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  // ── Render ────────────────────────────────────────────────────────────────
  const { label, color, Icon } = STATES[phase] || STATES.queued;
  const { bg, border, text, dot } = COLOR_MAP[color];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text} ${className}`}>
        {phase === 'pending' ? (
          <Loader className="w-3 h-3 animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        )}
        {phase === 'confirmed' && txHash ? (
          <a
            href={details?.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            On-chain ↗
          </a>
        ) : (
          <span>{label}</span>
        )}
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className={`rounded-xl border ${bg} ${border} px-4 py-3 ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`mt-0.5 flex-shrink-0 ${text}`}>
            {phase === 'pending' || phase === 'queued' ? (
              <motion.div
                animate={{ rotate: phase === 'pending' ? 360 : 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ) : (
              <Icon className="w-4 h-4" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${text}`}>{label}</p>

            {phase === 'pending' && (
              <p className="text-xs text-gray-500 mt-0.5">
                Polygon block time ~2 s — confirmation in seconds to a minute
                {elapsed > 10 && ` (${elapsed}s elapsed)`}
              </p>
            )}

            {phase === 'queued' && (
              <p className="text-xs text-gray-500 mt-0.5">
                Waiting for the database write to complete before sending to chain
              </p>
            )}

            {phase === 'confirmed' && details && (
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-gray-600">
                  Block <span className="font-mono font-medium">#{details.blockNumber}</span>
                  {details.confirmations > 1 && ` · ${details.confirmations} confirmations`}
                  {details.gasUsed && ` · ${parseInt(details.gasUsed).toLocaleString()} gas`}
                </p>
                {txHash && (
                  <p className="text-xs font-mono text-gray-500 truncate">
                    {txHash}
                  </p>
                )}
              </div>
            )}

            {phase === 'failed' && (
              <p className="text-xs text-gray-500 mt-0.5">
                The on-chain write reverted. Your data is safe in the database.
              </p>
            )}
          </div>

          {/* Explorer link */}
          {phase === 'confirmed' && details?.explorerUrl && (
            <a
              href={details.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-shrink-0 flex items-center gap-1 text-xs ${text} hover:opacity-75 transition`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Polygonscan</span>
            </a>
          )}
        </div>

        {/* Progress bar for pending */}
        {phase === 'pending' && (
          <motion.div
            className="mt-2.5 h-0.5 rounded-full bg-amber-200 overflow-hidden"
          >
            <motion.div
              className="h-full bg-amber-400"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline badge variant — use when space is tight (tables, lists).
 * Shows: pending spinner | green "On-chain ↗" | gray dash
 */
export function BlockchainBadge({ txHash }) {
  if (!txHash) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  const network = import.meta.env.VITE_POLYGON_NETWORK || 'amoy';
  const url = network === 'polygon'
    ? `https://polygonscan.com/tx/${txHash}`
    : `https://amoy.polygonscan.com/tx/${txHash}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
      {txHash.slice(0, 8)}…
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}
