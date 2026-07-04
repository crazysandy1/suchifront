import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const ROLES = [
  { value: 'farmer', label: 'Farmer / Producer', icon: '🌾', desc: 'Grow and harvest organic products' },
  { value: 'manufacturer', label: 'Manufacturer', icon: '🏭', desc: 'Process and package organic products' },
  { value: 'distributor', label: 'Distributor', icon: '🚚', desc: 'Transport and distribute products' },
  { value: 'retailer', label: 'Retailer', icon: '🏪', desc: 'Sell products to consumers' },
  { value: 'consumer', label: 'Consumer', icon: '👤', desc: 'Purchase and track organic food' },
];

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', businessName: '', role: '', location: '', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((p) => ({ ...p, role }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) { setError('Please select your role'); return; }
    setLoading(true);
    setError('');
    const result = await signup(formData);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const needsBusiness = formData.role && formData.role !== 'consumer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-xl border border-gray-700/50 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join OrganicTrace</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Your Role</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r.value} type="button"
                  onClick={() => handleRoleSelect(r.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.role === r.value
                      ? 'border-emerald-500 bg-emerald-500/20 text-white'
                      : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-xl mb-1">{r.icon}</div>
                  <div className="text-xs font-semibold">{r.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleChange} required disabled={loading}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} required disabled={loading}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleChange}
                required minLength={6} disabled={loading}
                placeholder="Min. 6 characters"
                className="w-full px-4 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Business Name (not for consumer) */}
          {needsBusiness && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {formData.role === 'farmer' ? 'Farm Name' : 'Business Name'}
              </label>
              <input
                type="text" name="businessName" value={formData.businessName}
                onChange={handleChange} required={needsBusiness} disabled={loading}
                placeholder={formData.role === 'farmer' ? 'Your farm name' : 'Your business name'}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
            </motion.div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location (optional)</label>
            <input
              type="text" name="location" value={formData.location}
              onChange={handleChange} disabled={loading}
              placeholder="City, State or Region"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          <motion.button
            type="submit" disabled={loading || !formData.role}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition disabled:opacity-50 shadow-lg shadow-emerald-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
