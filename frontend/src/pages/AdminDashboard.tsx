import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { AnalyticsOverview } from '../types';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Layers,
  Flame,
  Building2,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOverview();
  }, [selectedState]);

  const fetchAdminOverview = async () => {
    setLoading(true);
    try {
      const stateParam = selectedState ? `?state=${encodeURIComponent(selectedState)}` : '';
      const res = await api.get(`/admin/overview${stateParam}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header
        selectedState={selectedState}
        onSelectState={(st) => setSelectedState(st)}
      />

      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">
        {/* Admin Hub Title Banner */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#EBF3FA] text-[#005A9C]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-[#005A9C] uppercase tracking-wider">
                National Command Console
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1E293B] mt-1">
              Admin Governance &amp; Municipal Operations
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Coordinating 28 States &amp; 8 Union Territory Municipal Corporations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="bg-[#005A9C] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#004780] transition-all"
            >
              All Complaints Hub
            </button>
            <button
              onClick={() => navigate('/admin/risk-heatmap')}
              className="bg-[#EBF3FA] text-[#005A9C] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#E2EEF8] transition-all"
            >
              Risk Heatmap
            </button>
          </div>
        </div>

        {/* 6 Key National Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">Total Filed</p>
            <h3 className="text-xl font-bold text-[#1E293B] mt-0.5">{stats.total_complaints || 0}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">Active Pending</p>
            <h3 className="text-xl font-bold text-[#F1A23A] mt-0.5">{stats.pending || 0}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">In Progress</p>
            <h3 className="text-xl font-bold text-sky-600 mt-0.5">{stats.in_progress || 0}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">Resolved Cases</p>
            <h3 className="text-xl font-bold text-[#239B69] mt-0.5">{stats.resolved || 0}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">Critical Escaped</p>
            <h3 className="text-xl font-bold text-[#E34B5D] mt-0.5">{stats.critical || 0}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-[11px] text-[#64748B]">Avg Resolution</p>
            <h3 className="text-xl font-bold text-[#1E293B] mt-0.5">
              {stats.avg_resolution_days || 0} <span className="text-xs font-normal">days</span>
            </h3>
          </div>
        </div>

        {/* Admin Navigation Quick-Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => navigate('/admin/duplicates')}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs hover:border-[#EBF3FA] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FA] text-[#005A9C] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1E293B]">Duplicate Clusters</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Review automated geospatial + TF-IDF duplicate groups to merge overlapping citizen grievances.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#005A9C] flex items-center gap-1 mt-4">
              Manage Duplicates ({stats.duplicate_groups || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => navigate('/admin/risk-heatmap')}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs hover:border-[#EBF3FA] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E34B5D] flex items-center justify-center mb-3">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1E293B]">Civic Risk Heatmap</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                State &amp; District vulnerability index computed by complaint frequency, unresolved age, and severity.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#E34B5D] flex items-center gap-1 mt-4">
              Open Heatmap Analysis <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => navigate('/admin/escalations')}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs hover:border-[#EBF3FA] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F1A23A] flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1E293B]">SLA Overdue Escalations</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Complaints that surpassed the guaranteed response deadline (24h Critical, 48h High).
              </p>
            </div>
            <span className="text-xs font-semibold text-[#F1A23A] flex items-center gap-1 mt-4">
              View Escalated ({stats.escalated || 0}) <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
