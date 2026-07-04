import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'farmer',       email: 'farmer@demo.com',       icon: '🌾', color: 'emerald' },
  { role: 'manufacturer', email: 'manufacturer@demo.com', icon: '🏭', color: 'blue' },
  { role: 'distributor',  email: 'distributor@demo.com',  icon: '🚚', color: 'orange' },
  { role: 'retailer',     email: 'retailer@demo.com',     icon: '🏪', color: 'purple' },
  { role: 'consumer',     email: 'consumer@demo.com',     icon: '👤', color: 'teal' },
];

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginAsDemo = async (email) => {
    setFormData({ email, password: 'Demo@1234' });
    setLoading(true);
    setError('');
    const result = await login(email, 'Demo@1234');
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Demo login failed');
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.email.trim().toLowerCase(), formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-gray-700/50 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <span className="text-white text-2xl">🌱</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to OrganicTrace</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required disabled={loading}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'} name="password"
                value={formData.password} onChange={handleChange}
                required disabled={loading} placeholder="Enter password"
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              />
              <button type="button" onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 transition disabled:opacity-50 shadow-lg shadow-emerald-500/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </motion.button>
        </form>

        {/* Demo accounts */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowDemo((p) => !p)}
            className="w-full py-2.5 border border-gray-600/50 rounded-xl text-gray-400 text-sm hover:border-emerald-500/50 hover:text-emerald-400 transition font-medium"
          >
            {showDemo ? '▲ Hide' : '▼ Try Demo Accounts'}
          </button>
          {showDemo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2"
            >
              <p className="text-xs text-gray-500 text-center mb-2">Click any role to sign in instantly</p>
              {DEMO_ACCOUNTS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  disabled={loading}
                  onClick={() => loginAsDemo(d.email)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-700/40 hover:bg-gray-700/70 border border-gray-600/30 rounded-xl transition text-left disabled:opacity-40"
                >
                  <span className="text-lg">{d.icon}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium capitalize">{d.role}</p>
                    <p className="text-gray-400 text-xs">{d.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">Demo@1234</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-gray-700/50 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            No account?{' '}
            <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign up
            </Link>
          </p>
          <span className="text-gray-600 text-xs">
            Default: Demo@1234
          </span>
        </div>

        <div className="mt-4 p-3 bg-gray-700/30 rounded-xl">
          <p className="text-xs text-gray-400 text-center">
            JWT-secured · PostgreSQL · Polygon blockchain
          </p>
        </div>
      </motion.div>
    </div>
  );
}
