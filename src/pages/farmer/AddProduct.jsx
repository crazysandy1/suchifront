import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, CheckCircle, Shield, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import BlockchainStatus from '../../components/BlockchainStatus';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Herbs', 'Spices', 'Legumes', 'Other'];
const UNITS = ['kg', 'g', 'lbs', 'oz', 'units', 'boxes', 'bags', 'liters'];

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white';

export default function AddProduct() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(null);

  // Image state
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', description: '', category: '', quantity: '', unit: 'kg',
    originLocation: '', harvestDate: '', expiryDate: '',
    certificationStatus: 'pending', certificationNumber: '', certificationType: '',
    organicPractices: '',
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  // ── Image handling ─────────────────────────────────────────────────────────
  const handleImageFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { setError('Only image files allowed.'); return; }
    if (f.size > 10 * 1024 * 1024)    { setError('Image must be under 10 MB.'); return; }
    setError('');
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUploaded(false);
    if (fileInputRef.current)   fileInputRef.current.value   = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Register the product
      const { data } = await api.post('/products', form);
      const product  = data.product;

      // 2. Upload image if selected
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          await api.post(`/products/${product.id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setImageUploaded(true);
        } catch (imgErr) {
          console.warn('Image upload failed (product saved):', imgErr.message);
        }
      }

      setSuccess(product);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register product');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return (
      <div className="max-w-lg mx-auto mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
        >
          {imageUploaded && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
              <img
                src={`${apiBase}/products/${success.id}/image`}
                alt={success.name}
                className="w-28 h-28 object-cover rounded-2xl mx-auto border border-gray-100 shadow-sm"
                onError={(e) => { if (imagePreview) e.target.src = imagePreview; }}
              />
            </motion.div>
          )}

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Product Registered</h2>
          <p className="text-gray-500 text-sm mb-1">{success.name}</p>
          <p className="text-xs font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 inline-block mb-3">
            {success.batch_number}
          </p>

          {imageUploaded && (
            <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5 mb-4">
              ✓ Product image saved &amp; compressed
            </p>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-700">Blockchain Registration</span>
            </div>
            <BlockchainStatus productId={success.id} onConfirmed={() => {}} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSuccess(null);
                setImageFile(null); setImagePreview(null); setImageUploaded(false);
                setForm({
                  name: '', description: '', category: '', quantity: '', unit: 'kg',
                  originLocation: '', harvestDate: '', expiryDate: '',
                  certificationStatus: 'pending', certificationNumber: '', certificationType: '',
                  organicPractices: '',
                });
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Register Another
            </button>
            <button
              onClick={() => navigate(`/supply-chain/${success.id}`)}
              className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600"
            >
              View Supply Chain
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
            >
              My Products
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All registrations are permanently recorded on the Polygon blockchain
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* ── PRODUCT PHOTO ──────────────────────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-500" />
            Product Photo
            <span className="text-xs font-normal text-gray-400 ml-1">(optional — visible to all users)</span>
          </h3>

          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-52 object-cover rounded-2xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 border border-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg backdrop-blur">
                  {imageFile?.name} &bull; {Math.round(imageFile?.size / 1024)} KB raw (will be compressed)
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  <Upload className="w-4 h-4" /> Change Photo
                </button>
                <button type="button" onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2 border border-emerald-200 bg-emerald-50 rounded-xl text-sm text-emerald-700 hover:bg-emerald-100 transition">
                  <Camera className="w-4 h-4" /> Retake
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); handleImageFile(e.dataTransfer.files?.[0]); }}
                onDragOver={(e) => e.preventDefault()}
                className="h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-emerald-100 rounded-full flex items-center justify-center transition">
                  <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-600 transition">
                    Click or drag to upload a product photo
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP — up to 10 MB (auto-compressed to &lt;200 KB)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <Upload className="w-4 h-4" /> Upload from Device
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 border border-emerald-200 bg-emerald-50 rounded-xl text-sm text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <Camera className="w-4 h-4" /> Capture with Camera
                </button>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => handleImageFile(e.target.files?.[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => handleImageFile(e.target.files?.[0])} />
        </section>

        {/* ── Product Details ────────────────────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Product Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required placeholder="e.g. Organic Tomatoes" className={inputCls} />
            </Field>
            <Field label="Category">
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Description">
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={3} placeholder="Describe the product, growing methods, etc."
                className={inputCls + ' resize-none'} />
            </Field>
          </div>
        </section>

        {/* ── Quantity & Origin ──────────────────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Quantity &amp; Origin</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Quantity" required>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                required min="0.01" step="0.01" placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Unit" required>
              <select name="unit" value={form.unit} onChange={handleChange} className={inputCls}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Harvest Date">
              <input type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Origin Location">
              <input type="text" name="originLocation" value={form.originLocation} onChange={handleChange}
                placeholder="Farm / city / region" className={inputCls} />
            </Field>
            <Field label="Expiry Date">
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={inputCls} />
            </Field>
          </div>
        </section>

        {/* ── Certification ──────────────────────────────────────────────── */}
        <section>
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Certification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Status">
              <select name="certificationStatus" value={form.certificationStatus} onChange={handleChange} className={inputCls}>
                <option value="pending">Pending</option>
                <option value="certified">Certified</option>
                <option value="rejected">Rejected</option>
              </select>
            </Field>
            <Field label="Certification Type">
              <input type="text" name="certificationType" value={form.certificationType} onChange={handleChange}
                placeholder="e.g. USDA Organic" className={inputCls} />
            </Field>
            <Field label="Certificate Number">
              <input type="text" name="certificationNumber" value={form.certificationNumber} onChange={handleChange}
                placeholder="Certificate ID" className={inputCls} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Organic Practices">
              <textarea name="organicPractices" value={form.organicPractices} onChange={handleChange}
                rows={2} placeholder="Describe farming / processing practices used…"
                className={inputCls + ' resize-none'} />
            </Field>
          </div>
        </section>

        {/* ── Blockchain notice ──────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
          <Shield className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700">
            This product will be registered on the <strong>Polygon blockchain</strong> with a cryptographic
            data-integrity hash, creating a tamper-proof audit trail from farm to consumer.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                {imageFile ? 'Saving image & registering…' : 'Registering…'}
              </>
            ) : (
              <><Save className="w-4 h-4" /> Register Product</>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
