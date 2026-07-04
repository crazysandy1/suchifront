import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Check, Loader } from 'lucide-react';
import api from '../config/api';

/**
 * ImageUploader — reusable component for capturing or uploading a product image.
 *
 * Props:
 *   productId   — string   — product UUID or batch number (required after product is created)
 *   onUploaded  — fn       — called with { imageUrl } after a successful upload
 *   onSelect    — fn       — called with File object when user selects (before upload)
 *   className   — string
 *   compact     — bool     — smaller variant for inline use
 */
export default function ImageUploader({
  productId,
  onUploaded,
  onSelect,
  className = '',
  compact = false,
}) {
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError]       = useState('');
  const [dragging, setDragging] = useState(false);

  const fileInputRef    = useRef(null);
  const cameraInputRef  = useRef(null);

  const processFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10 MB.');
      return;
    }
    setError('');
    setUploaded(false);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (onSelect) onSelect(f);
  };

  const handleFileChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const clearImage = () => {
    setPreview(null);
    setFile(null);
    setUploaded(false);
    setError('');
    if (fileInputRef.current)   fileInputRef.current.value   = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const uploadNow = async () => {
    if (!file || !productId) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post(`/products/${productId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploaded(true);
      if (onUploaded) onUploaded({ imageUrl: data.imageUrl, sizeKB: data.sizeKB });
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Product preview"
              className="w-20 h-20 object-cover rounded-xl border border-gray-200"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
            >
              <X className="w-3 h-3" />
            </button>
            {uploaded && (
              <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 text-white text-[10px] text-center rounded-b-xl py-0.5">
                ✓ Saved
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:bg-emerald-50 transition group"
          >
            <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-emerald-400 transition" />
            <span className="text-[10px] text-gray-400 group-hover:text-emerald-500">Add Photo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drop zone / preview */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-52 object-cover rounded-2xl border border-gray-200"
          />
          {/* Clear button */}
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 border border-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
          {uploaded && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
              <Check className="w-3.5 h-3.5" /> Image saved successfully
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
            dragging
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
            dragging ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-5 h-5 transition ${dragging ? 'text-emerald-500' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium transition ${dragging ? 'text-emerald-600' : 'text-gray-600'}`}>
              {dragging ? 'Drop image here' : 'Click or drag to upload photo'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP — max 10 MB</p>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Camera capture — mobile only */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
        >
          <Upload className="w-4 h-4" />
          {preview ? 'Change Photo' : 'Upload Photo'}
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-sm text-emerald-700 hover:bg-emerald-100 transition"
        >
          <Camera className="w-4 h-4" />
          Use Camera
        </button>

        {/* Upload button — only show if productId is known & image selected & not yet uploaded */}
        {productId && preview && !uploaded && (
          <button
            type="button"
            onClick={uploadNow}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 transition"
          >
            {uploading
              ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Check className="w-4 h-4" /> Save Image</>
            }
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
