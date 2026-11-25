import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Header } from '../components/Header';
import { User, Mail, Phone, MapPin, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await api.patch(`/users/${user.id}`, {
        full_name: fullName,
        phone,
        city,
      });
      updateUser(res.data);
      toast.success('Profile details updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-3xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#005A9C] to-[#005A9C] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1E293B]">{user?.full_name}</h1>
            <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
              <span className="capitalize">{user?.role}</span> &bull; {user?.city || 'India'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs space-y-4">
          <h2 className="text-sm font-bold text-[#1E293B]">Account Information</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-1">Email Address (Locked)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#64748B] opacity-75"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">City / Municipal Area</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#005A9C] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#004780] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
