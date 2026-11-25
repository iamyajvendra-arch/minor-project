import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { haptics } from '../utils';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.user);
      haptics.success();
      toast.success(`Welcome back, ${res.data.user.full_name}!`);

      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'department') navigate('/department');
      else navigate('/dashboard');
    } catch (err: any) {
      haptics.error();
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'citizen' | 'admin' | 'dept') => {
    if (role === 'admin') {
      setEmail('admin@civicseva.in');
      setPassword('Admin@123');
    } else if (role === 'dept') {
      setEmail('road@civicseva.in');
      setPassword('Dept@123');
    } else {
      setEmail('priya@example.com');
      setPassword('Citizen@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-gov-md space-y-6">
        {/* National Portal Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#0F2942] text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-sm border border-slate-700">
            सी
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              CIVIC-<span className="text-[#005A9C]">सेवा</span>
            </span>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm border border-slate-300">
              GOV.IN
            </span>
          </div>
          <p className="text-xs text-slate-500">
            National Smart Civic Grievance Management System
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Select Role for Demonstration
          </span>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('citizen')}
              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-[#005A9C] rounded-md text-slate-800 transition-all shadow-2xs"
            >
              Citizen Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 border border-blue-200 text-[#005A9C] rounded-md transition-all shadow-2xs"
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => fillDemo('dept')}
              className="px-2.5 py-1 text-[11px] font-bold bg-white border border-slate-300 hover:border-[#005A9C] rounded-md text-slate-800 transition-all shadow-2xs"
            >
              Road Department
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Registered Email ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#005A9C] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#005A9C] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#005A9C] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all disabled:opacity-50 shadow-gov active:scale-95"
          >
            {loading ? 'Authenticating Credentials...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          New citizen user?{' '}
          <Link to="/register" className="font-bold text-[#005A9C] hover:underline">
            Register New Account
          </Link>
        </div>
      </div>
    </div>
  );
};
