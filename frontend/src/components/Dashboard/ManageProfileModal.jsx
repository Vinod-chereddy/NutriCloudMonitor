import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import { X, AlertCircle, Check, User, Mail, Lock } from 'lucide-react';

const ManageProfileModal = ({ user, onClose, onUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { name, email };
      if (password) data.password = password;
      const res = await userAPI.updateProfile(data);
      onUpdate(res.data.user);
      onClose();
    } catch (error) {
      setToast({ show: true, message: error.response?.data?.message || 'Failed to update profile' });
      setTimeout(() => setToast({ show: false, message: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#f1f3f6] w-full max-w-md rounded-3xl shadow-[12px_12px_28px_#aab3c2,-12px_-12px_28px_#ffffff] border border-white p-6 md:p-8 relative text-[#212121]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">NutriKart Account Settings</h2>
            <p className="text-xs text-gray-500 font-medium">Update your personal & security details</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form with Neomorphic Inset Inputs */}
        <form onSubmit={handleSubmit} className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-[#2874f0]" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Mail size={13} className="text-[#2874f0]" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5 flex items-center gap-1.5">
              <Lock size={13} className="text-[#2874f0]" /> New Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              className="w-full bg-[#f1f3f6] text-[#212121] rounded-xl px-4 py-2.5 text-sm font-semibold shadow-[inset_2px_2px_5px_#c5cad3,inset_-2px_-2px_5px_#ffffff] border border-white/60 focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-black bg-[#f1f3f6] shadow-[2px_2px_5px_#c5cad3,-2px_-2px_5px_#ffffff] active:shadow-[inset_2px_2px_4px_#c5cad3,inset_-2px_-2px_4px_#ffffff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="neo-btn-blue px-6 py-2 text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-[#212121] text-white px-5 py-3 rounded-xl shadow-2xl z-[200] flex items-center gap-3 border border-gray-700">
          <AlertCircle className="text-[#fb641b]" size={20} />
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default ManageProfileModal;

