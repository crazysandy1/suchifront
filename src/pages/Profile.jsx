import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Building2, Phone, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

const ROLE_COLORS = {
  farmer:       'from-emerald-500 to-green-600',
  manufacturer: 'from-blue-500 to-indigo-600',
  distributor:  'from-orange-500 to-amber-600',
  retailer:     'from-purple-500 to-violet-600',
  consumer:     'from-teal-500 to-cyan-600',
};

const ROLE_ICONS = {
  farmer: '🌾', manufacturer: '🏭', distributor: '🚚', retailer: '🏪', consumer: '👤',
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState('');
  const [form, setForm] = useState({
    name:         user?.name         || '',
    businessName: user?.business_name || '',
    location:     user?.location      || '',
    phone:        user?.phone         || '',
  });

  const gradient = ROLE_COLORS[user?.role] || ROLE_COLORS.consumer;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/auth/profile', form);
      if (data.success) {
        updateUser(data.user);
        setSuccess(true);
        setEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
            {ROLE_ICONS[user?.role] || '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-white/80 text-sm capitalize mt-0.5">{user?.role}</p>
            {user?.business_name && (
              <p className="text-white/70 text-sm">{user.business_name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle className="w-4 h-4" /> Profile updated successfully
        </motion.div>
      )}

      {/* Account info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Account Information</h2>
          <button
            onClick={() => { setEditing((p) => !p); setError(''); }}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            {error && <p className="text-red-600 text-sm p-3 bg-red-50 rounded-xl">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              {user?.role !== 'consumer' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {user?.role === 'farmer' ? 'Farm Name' : 'Business Name'}
                  </label>
                  <input name="businessName" value={form.businessName} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Location</label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="City, State" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {[
              { icon: User,      label: 'Full Name',     value: user?.name },
              { icon: Mail,      label: 'Email',         value: user?.email },
              { icon: Shield,    label: 'Role',          value: user?.role,          capitalize: true },
              { icon: Building2, label: user?.role === 'farmer' ? 'Farm Name' : 'Business', value: user?.business_name },
              { icon: MapPin,    label: 'Location',      value: user?.location },
              { icon: Phone,     label: 'Phone',         value: user?.phone },
            ].filter((f) => f.value).map((f) => (
              <div key={f.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{f.label}</p>
                  <p className={`text-sm font-medium text-gray-900 ${f.capitalize ? 'capitalize' : ''}`}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role badge */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Your Role in OrganicTrace</h2>
        <div className={`bg-gradient-to-r ${gradient} rounded-xl p-4 text-white`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ROLE_ICONS[user?.role]}</span>
            <div>
              <p className="font-semibold capitalize">{user?.role}</p>
              <p className="text-white/80 text-xs mt-0.5">
                {{
                  farmer:       'Register and manage organic products from harvest',
                  manufacturer: 'Process and package organic products for distribution',
                  distributor:  'Receive and dispatch products across the supply chain',
                  retailer:     'Manage store inventory and sales of organic products',
                  consumer:     'Track and verify the authenticity of your organic food',
                }[user?.role]}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Role is assigned at registration and cannot be changed. Contact support to request a role change.
        </p>
      </div>
    </div>
  );
}
