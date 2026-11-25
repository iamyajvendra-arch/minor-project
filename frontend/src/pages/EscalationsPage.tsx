import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { Complaint } from '../types';
import { getStatusBadgeClass, getPriorityBadgeClass, getCategoryLabel } from '../utils';
import { AlertTriangle, Clock, MapPin, Search } from 'lucide-react';

export const EscalationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEscalated();
  }, []);

  const fetchEscalated = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/escalated');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-[1400px] mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-cs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#E34B5D] flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#E34B5D] uppercase tracking-wider">
                SLA Breached Interventions
              </span>
              <h1 className="text-lg font-bold text-[#1E293B]">
                Escalated Complaints Hub
              </h1>
              <p className="text-xs text-[#64748B]">
                Grievances that exceeded the guaranteed resolution deadline (24h Critical, 48h High)
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search escalated grievances..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
            />
          </div>
          <span className="text-xs font-bold text-[#E34B5D]">
            {filtered.length} Overdue Cases
          </span>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-3 text-center py-8 text-xs text-[#64748B]">Loading escalated cases...</p>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-cs p-8">
              <Clock className="w-10 h-10 text-[#239B69] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#1E293B]">All SLAs in Compliance</h3>
              <p className="text-xs text-[#64748B] mt-1">No overdue escalations currently pending intervention.</p>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/complaints/${c.id}`)}
                className="bg-white p-5 rounded-2xl border border-rose-200 shadow-cs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-[#64748B] font-semibold">{c.complaint_id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-bold bg-rose-50 text-[#E34B5D] border border-rose-200">
                      Escalated
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1E293B] line-clamp-2 mb-2">{c.title}</h3>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mb-3 leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-[#005A9C]" />
                      {c.city || 'India'}, {c.state || ''}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm capitalize font-bold ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#1E293B] font-medium pt-1">
                    <span>{getCategoryLabel(c.category)}</span>
                    <span className="text-[#E34B5D] font-bold">Severity: {Math.round(c.severity_score || 70)}/100</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
