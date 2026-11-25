import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Header } from '../components/Header';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  PieChart as PieIcon,
  Flame,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const DeepAnalytics: React.FC = () => {
  const [selectedState, setSelectedState] = useState('');
  const [overview, setOverview] = useState<any>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [stateData, setStateData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedState]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const stateParam = selectedState ? `?state=${encodeURIComponent(selectedState)}` : '';
      const [ovRes, catRes, statRes, prioRes, stRes, trRes, deptRes] = await Promise.all([
        api.get(`/analytics/overview${stateParam}`),
        api.get(`/analytics/by-category${stateParam}`),
        api.get(`/analytics/by-status`),
        api.get(`/analytics/by-priority`),
        api.get(`/analytics/by-state`),
        api.get(`/analytics/monthly-trend`),
        api.get(`/analytics/department-performance`),
      ]);
      setOverview(ovRes.data);
      setCategoryData(catRes.data);
      setStatusData(statRes.data);
      setPriorityData(prioRes.data);
      setStateData(stRes.data.slice(0, 10));
      setTrendData(trRes.data);
      setDeptData(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    critical: '#E34B5D',
    high: '#005A9C',
    medium: '#F1A23A',
    low: '#239B69',
  };

  const STATUS_COLORS: Record<string, string> = {
    resolved: '#239B69',
    in_progress: '#3B82F6',
    pending: '#F1A23A',
    submitted: '#F1A23A',
    escalated: '#E34B5D',
  };

  const COLORS = ['#005A9C', '#239B69', '#F1A23A', '#3B82F6', '#8B5CF6', '#F43F5E', '#10B981'];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header selectedState={selectedState} onSelectState={setSelectedState} />

      <main className="p-6 max-w-[1500px] mx-auto w-full space-y-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EBF3FA] text-[#005A9C] flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#005A9C] uppercase tracking-wider">
                Geospatial &amp; Municipal Intelligence
              </span>
              <h1 className="text-lg font-bold text-[#1E293B]">
                Deep Analytics &amp; Performance Reporting
              </h1>
              <p className="text-xs text-[#64748B]">
                Data-driven tracking across 28 Indian States &amp; 8 Union Territories
              </p>
            </div>
          </div>
        </div>

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Total Registered</p>
            <h3 className="text-2xl font-bold text-[#1E293B] mt-1">{overview.total_complaints || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Active Unresolved</p>
            <h3 className="text-2xl font-bold text-[#F1A23A] mt-1">{overview.open || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Successfully Resolved</p>
            <h3 className="text-2xl font-bold text-[#239B69] mt-1">{overview.resolved || 0}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <p className="text-xs text-[#64748B]">Critical Hazard Cases</p>
            <h3 className="text-2xl font-bold text-[#E34B5D] mt-1">{overview.critical || 0}</h3>
          </div>
        </div>

        {/* Charts Row 1: Category Bar + Priority Pie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <h3 className="text-xs font-bold text-[#1E293B] mb-3">Complaints by Civic Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
                  <Bar dataKey="count" fill="#005A9C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs">
            <h3 className="text-xs font-bold text-[#1E293B] mb-3">Severity &amp; Priority Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={80} label>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Department Performance Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-cs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1E293B] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#005A9C]" /> Departmental Resolution Metrics
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Code</th>
                  <th className="py-3 px-4 font-semibold">Total Assigned</th>
                  <th className="py-3 px-4 font-semibold">Pending</th>
                  <th className="py-3 px-4 font-semibold">Resolved</th>
                  <th className="py-3 px-4 font-semibold">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {deptData.map((d, i) => (
                  <tr key={i} className="hover:bg-[#F4F6F9]">
                    <td className="py-3 px-4 font-semibold text-[#1E293B]">{d.department}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">{d.code}</td>
                    <td className="py-3 px-4 text-[#1E293B] font-bold">{d.total}</td>
                    <td className="py-3 px-4 text-[#F1A23A] font-medium">{d.pending}</td>
                    <td className="py-3 px-4 text-[#239B69] font-medium">{d.resolved}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1E293B]">{d.resolution_rate}%</span>
                        <div className="w-16 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#239B69] rounded-full"
                            style={{ width: `${Math.min(100, d.resolution_rate)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
