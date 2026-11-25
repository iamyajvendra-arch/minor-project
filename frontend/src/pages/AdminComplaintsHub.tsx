import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { Complaint } from '../types';
import { getStatusBadgeClass, getPriorityBadgeClass, getCategoryLabel } from '../utils';
import { FileText, MapPin, Search, Filter, ShieldCheck } from 'lucide-react';

export const AdminComplaintsHub: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/admin/complaints?${params.toString()}`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EBF3FA] text-[#005A9C] flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#005A9C] uppercase tracking-wider">
                National Database
              </span>
              <h1 className="text-lg font-bold text-[#1E293B]">
                All Complaints &amp; Grievances Hub
              </h1>
              <p className="text-xs text-[#64748B]">
                Complete India-wide grievance registry across all jurisdictions
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="road_pothole">Road &amp; Potholes</option>
              <option value="garbage_sanitation">Garbage &amp; Sanitation</option>
              <option value="water_supply">Water Supply</option>
              <option value="drainage_sewage">Drainage &amp; Sewage</option>
              <option value="electricity_streetlight">Electricity &amp; Lighting</option>
              <option value="public_infrastructure">Public Infrastructure</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-3 text-center py-8 text-xs text-[#64748B]">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-cs p-8">
              <FileText className="w-10 h-10 text-[#64748B]/40 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1E293B]">No Complaints Found</h3>
              <p className="text-xs text-[#64748B] mt-1">Try adjusting the filter criteria above.</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/complaints/${c.id}`)}
                className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs hover:shadow-md hover:border-[#EBF3FA] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-[#64748B] font-semibold">{c.complaint_id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${getStatusBadgeClass(c.status)}`}>
                      {c.status.replace('_', ' ')}
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
                    <span className={`px-1.5 py-0.5 rounded-sm capitalize ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#1E293B] font-medium pt-1">
                    <span>{getCategoryLabel(c.category)}</span>
                    {c.severity_score && (
                      <span className="text-[#005A9C] font-bold">Severity: {Math.round(c.severity_score)}/100</span>
                    )}
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
