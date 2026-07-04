import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { X, Camera, Upload, Keyboard, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export default function QRScanner({ onScan, onClose }) {
  const [mode, setMode]           = useState('choose'); // choose | camera | result | manual
  const [result, setResult]       = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scannerRef  = useRef(null);
  const scannedRef  = useRef(false);   // prevent double-fire
  const mountedRef  = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      safeStop();
    };
  }, []);

  // ── Safe stop — never throws ──────────────────────────────────────────
  const safeStop = useCallback(() => {
    const s = scannerRef.current;
    if (!s) return;
    scannerRef.current = null;
    try {
      const state = s.getState?.();
      // 2 = SCANNING, 3 = PAUSED
      if (state === 2 || state === 3) {
        s.stop().then(() => s.clear()).catch(() => {});
      } else {
        s.clear().catch(() => {});
      }
    } catch {
      try { s.clear(); } catch {}
    }
  }, []);

  // ── Extract batch from any QR payload ─────────────────────────────────
  const extractBatch = (raw) => {
    const text = (raw || '').trim();
    if (!text) return text;
    try {
      const parsed = JSON.parse(text);
      return parsed.batch || parsed.batchNumber || parsed.id || text;
    } catch {
      const urlMatch = text.match(/\/track\/([A-Z0-9-]+)/i);
      if (urlMatch) return urlMatch[1];
      return text;
    }
  };

  // ── Start camera (called via useEffect after mode='camera') ───────────
  useEffect(() => {
    if (mode !== 'camera') return;

    let cancelled = false;
    scannedRef.current = false;

    const boot = async () => {
      setLoading(true);
      setError('');

      // Give React one frame to paint the <div id="qr-camera-view">
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (cancelled || !mountedRef.current) return;

      const el = document.getElementById('qr-camera-view');
      if (!el) { setError('Camera container missing'); setLoading(false); return; }

      try {
        const qr = new Html5Qrcode('qr-camera-view');
        scannerRef.current = qr;

        const onSuccess = (decoded) => {
          if (scannedRef.current || cancelled) return;
          scannedRef.current = true;
          const batch = extractBatch(decoded);
          // Stop AFTER we have the data, in a microtask so the callback finishes first
          setTimeout(() => safeStop(), 0);
          if (mountedRef.current) {
            setResult(batch);
            setMode('result');
            setLoading(false);
          }
        };

        // Try rear camera first, fall back to any camera
        try {
          await qr.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onSuccess,
            () => {}
          );
        } catch {
          // Fallback: try any available camera
          const devices = await Html5Qrcode.getCameras();
          if (devices?.length) {
            await qr.start(
              devices[0].id,
              { fps: 10, qrbox: { width: 250, height: 250 } },
              onSuccess,
              () => {}
            );
          } else {
            throw new Error('No cameras found on this device');
          }
        }

        if (mountedRef.current && !cancelled) setLoading(false);
      } catch (err) {
        if (!mountedRef.current || cancelled) return;
        setLoading(false);
        const msg = typeof err === 'string' ? err : err?.message || '';
        if (msg.includes('NotAllowed') || msg.includes('Permission')) {
          setError('Camera permission denied. Allow camera access in browser settings and try again.');
        } else if (msg.includes('No cameras')) {
          setError('No camera found. Try uploading a QR image instead.');
        } else {
          setError(`Camera error: ${msg || 'Unknown'}. Try uploading an image.`);
        }
        setMode('choose');
      }
    };

    boot();

    return () => {
      cancelled = true;
      safeStop();
    };
  }, [mode, safeStop]);

  // ── Upload image ──────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      // Html5Qrcode needs a real, visible (but off-screen) container
      const tempId = 'qr-file-scan-' + Date.now();
      const el = document.createElement('div');
      el.id = tempId;
      // Off-screen but rendered (display:none breaks scanFile)
      el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:300px;height:300px;';
      document.body.appendChild(el);

      const qr = new Html5Qrcode(tempId);
      // showImage=false → don't try to render the image into the container
      const decoded = await qr.scanFile(file, /* showImage */ false);
      qr.clear().catch(() => {});
      el.remove();

      const batch = extractBatch(decoded);
      if (!batch) throw new Error('empty');
      setResult(batch);
      setMode('result');
    } catch {
      setError('No QR code found in this image. Make sure the QR code is clear and not blurry.');
    }
    setLoading(false);
    // Reset file input so the same file can be re-selected
    if (e.target) e.target.value = '';
  };

  // ── Confirm result → navigate ─────────────────────────────────────────
  const confirmResult = () => {
    if (!result) return;
    safeStop();
    onScan(result);
  };

  // ── Manual entry ──────────────────────────────────────────────────────
  const submitManual = (e) => {
    e.preventDefault();
    const batch = manualInput.trim();
    if (!batch) return;
    safeStop();
    onScan(batch);
  };

  // ── Close ─────────────────────────────────────────────────────────────
  const handleClose = () => {
    safeStop();
    onClose();
  };

  const goBack = () => {
    safeStop();
    setMode('choose');
    setError('');
    setResult('');
    scannedRef.current = false;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'choose' && 'Scan QR Code'}
            {mode === 'camera' && (loading ? 'Starting Camera…' : 'Point at QR Code')}
            {mode === 'result' && 'QR Code Found!'}
            {mode === 'manual' && 'Enter Batch Number'}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Choose ───────────────────────────────────────────── */}
          {mode === 'choose' && (
            <div className="space-y-3">
              <button
                onClick={() => setMode('camera')}
                className="w-full flex items-center gap-3 p-4 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition text-left"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Open Camera</p>
                  <p className="text-sm text-gray-500">Scan QR code using your camera</p>
                </div>
              </button>

              <label className="w-full flex items-center gap-3 p-4 border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition text-left cursor-pointer">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Upload QR Image</p>
                  <p className="text-sm text-gray-500">Choose a photo of the QR code</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <button
                onClick={() => { setMode('manual'); setError(''); }}
                className="w-full flex items-center gap-3 p-4 border-2 border-purple-500 rounded-xl hover:bg-purple-50 transition text-left"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Keyboard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Enter Batch Number</p>
                  <p className="text-sm text-gray-500">Type the batch code manually</p>
                </div>
              </button>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-3 text-blue-600 text-sm">
                  <Loader className="w-4 h-4 animate-spin" /> Scanning image…
                </div>
              )}
            </div>
          )}

          {/* ── Camera ───────────────────────────────────────────── */}
          {mode === 'camera' && (
            <div>
              <div
                id="qr-camera-view"
                className="rounded-xl overflow-hidden bg-black min-h-[300px] mb-4"
              />
              {loading && (
                <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 text-sm">
                  <Loader className="w-4 h-4 animate-spin" /> Accessing camera…
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mb-3">
                Hold the QR code steady inside the frame. It will auto-detect.
              </p>
              <button
                onClick={goBack}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Options
              </button>
            </div>
          )}

          {/* ── Result ───────────────────────────────────────────── */}
          {mode === 'result' && (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Batch Number Found</p>
              <p className="font-mono text-lg font-bold text-gray-900 bg-gray-50 rounded-xl px-4 py-3 mb-5 break-all select-all">
                {result}
              </p>
              <button
                onClick={confirmResult}
                className="w-full bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-600 transition mb-3 shadow-lg shadow-emerald-500/25"
              >
                Track This Product
              </button>
              <button
                onClick={goBack}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Scan Another
              </button>
            </div>
          )}

          {/* ── Manual ───────────────────────────────────────────── */}
          {mode === 'manual' && (
            <form onSubmit={submitManual}>
              <p className="text-sm text-gray-500 mb-3">
                Enter the batch number printed on the product packaging.
              </p>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. BATCH-20260529-2D8A9C88"
                autoFocus
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-40 mb-3"
              >
                Track Product
              </button>
              <button type="button" onClick={goBack}
                className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Back
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
