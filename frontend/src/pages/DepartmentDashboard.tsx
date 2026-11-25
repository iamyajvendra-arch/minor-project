import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { getStatusBadgeClass, getPriorityBadgeClass, getCategoryLabel } from '../utils';
import { Building2, FileText, CheckCircle2, Clock, MapPin } from 'lucide-react';

export const DepartmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.department_id) {
      fetchDeptData();
    }
  }, [user]);

  const fetchDeptData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        api.get(`/departments/${user?.department_id}/complaints`),
        api.get(`/departments/${user?.department_id}/stats`),
      ]);
      setComplaints(listRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EBF3FA] text-[#005A9C] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#005A9C] uppercase tracking-wider">
                Department Triage Workspace
              </span>
              <h1 className="text-lg font-bold text-[#1E293B]">
                {user?.full_name} &bull; Official Queue
              </h1>
              <p className="text-xs text-[#64748B]">
                Assigned jurisdiction: {user?.city || 'Local Municipal Ward'}
              </p>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Assigned Queue</p>
            <h3 className="text-xl font-bold text-[#1E293B] mt-0.5">{stats.total || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Pending Action</p>
            <h3 className="text-xl font-bold text-[#F1A23A] mt-0.5">{stats.pending || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Work in Progress</p>
            <h3 className="text-xl font-bold text-sky-600 mt-0.5">{stats.in_progress || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Successfully Resolved</p>
            <h3 className="text-xl font-bold text-[#239B69] mt-0.5">{stats.resolved || 0}</h3>
          </div>
        </div>

        {/* Assigned Complaints Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-cs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold text-[#1E293B]">Assigned Municipal Cases</h3>
          </div>

          <div className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <p className="p-6 text-center text-xs text-[#64748B]">Loading cases...</p>
            ) : complaints.length === 0 ? (
              <p className="p-6 text-center text-xs text-[#64748B]">No complaints assigned currently.</p>
            ) : (
              complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/complaints/${c.id}`)}
                  className="p-4 hover:bg-[#F4F6F9] transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-[#64748B]">{c.complaint_id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${getStatusBadgeClass(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{c.title}</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#005A9C]" />
                      {c.city || 'India'}, {c.state} &bull; {getCategoryLabel(c.category)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-sm capitalize ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority}
                    </span>
                    <button className="text-xs text-[#005A9C] font-semibold hover:underline">
                      Review &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
