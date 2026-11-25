import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { Complaint, MapComplaintPoint, AnalyticsOverview } from '../types';
import { getStatusBadgeClass, getPriorityBadgeClass } from '../utils';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  ChevronRight,
  MapPin,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AnalyticsOverview>({
    total_complaints: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    critical: 0,
    open: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [mapPoints, setMapPoints] = useState<MapComplaintPoint[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.97, 78.65]);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  // When selected state changes, update center/zoom and reload data
  useEffect(() => {
    fetchDashboardData();
  }, [selectedState]);

  const fetchDashboardData = async () => {
    try {
      const stateParam = selectedState ? `?state=${encodeURIComponent(selectedState)}` : '';

      const [statsRes, complaintsRes, mapRes, hotspotsRes, catRes, statesRes] = await Promise.all([
        api.get(`/analytics/overview${stateParam}`),
        api.get(`/complaints${stateParam ? stateParam + '&limit=6' : '?limit=6'}`),
        api.get(`/complaints/map-data${stateParam}`),
        api.get('/analytics/hotspot-prediction'),
        api.get(`/analytics/by-category${stateParam}`),
        api.get('/geo/states'),
      ]);

      setStats(statsRes.data);
      setRecentComplaints(complaintsRes.data);
      setMapPoints(mapRes.data);
      setHotspots(hotspotsRes.data.slice(0, 4));
      setCategoryData(catRes.data);

      // Dynamically reposition map if a specific state is chosen
      if (selectedState && Array.isArray(statesRes.data)) {
        const found = statesRes.data.find((s: any) => s.name.toLowerCase() === selectedState.toLowerCase());
        if (found && found.lat && found.lng) {
          setMapCenter([found.lat, found.lng]);
          setMapZoom(7);
        }
      } else {
        setMapCenter([22.97, 78.65]);
        setMapZoom(5);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header
        selectedState={selectedState}
        onSelectState={(st) => setSelectedState(st)}
        onSearch={(term) => {
          if (term) navigate(`/my-complaints?search=${encodeURIComponent(term)}`);
        }}
      />

      <main className="p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Government Official Banner */}
        <div className="relative rounded-xl overflow-hidden shadow-gov border border-slate-200 bg-gradient-to-r from-[#0F2942] via-[#1B3F63] to-[#0A1C2E] text-white p-7">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-blue-900/60 border border-blue-400/40 text-blue-200 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF9800]" /> Ministry of Housing &amp; Urban Affairs Portal
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.full_name || 'Citizen'}
              </h1>
              <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
                National Smart Civic Grievance Redressal System. Integrated across Municipal Corporations, 
                Districts, and State Urban Development Authorities for accountable citizen service.
              </p>
            </div>
            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 bg-[#005A9C] hover:bg-[#004780] text-white px-5 py-2.5 rounded-lg font-semibold text-xs transition-all shadow-gov active:scale-95 flex-shrink-0 border border-blue-400/30"
            >
              <span>Lodge New Grievance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Complaints */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Registered Cases</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total_complaints}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-[#005A9C] font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>{selectedState ? `${selectedState} Registry` : 'All India Registry'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#005A9C]">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Pending Review */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Under Triage</p>
              <h3 className="text-2xl font-bold text-[#E65100] mt-1">{stats.pending}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                <span>Awaiting department inspection</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[#E65100]">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Resolved */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Redressed Solutions</p>
              <h3 className="text-2xl font-bold text-[#1B5E20] mt-1">{stats.resolved}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-[#1B5E20] font-semibold">
                <span>
                  {stats.total_complaints > 0
                    ? `${Math.round((stats.resolved / stats.total_complaints) * 100)}% resolution rate`
                    : '100% resolution rate'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-[#1B5E20]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Critical Severity */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Critical Priority Alerts</p>
              <h3 className="text-2xl font-bold text-[#C62828] mt-1">{stats.critical}</h3>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-[#C62828] font-medium">
                <span>Immediate emergency action</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center text-[#C62828]">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Proportional Layout: Live Civic Map + Recent Complaints + Civic Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Area: Large Live Civic Map (6 cols) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col h-[490px]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005A9C] animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Geospatial Live Surveillance Map {selectedState && `(${selectedState})`}
                </h3>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="text-xs font-bold text-[#005A9C] hover:underline flex items-center gap-1"
              >
                <span>Full Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 w-full relative">
              <CivicMap
                points={mapPoints}
                center={mapCenter}
                zoom={mapZoom}
                height="100%"
                onMarkerClick={(pt) => navigate(`/complaints/${pt.id}`)}
              />
            </div>
          </div>

          {/* Centre Area: Recent Complaints List (3 cols) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col h-[490px]">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Grievances</h3>
              <button
                onClick={() => navigate('/my-complaints')}
                className="text-[11px] text-[#005A9C] font-bold hover:underline"
              >
                View all
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {recentComplaints.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <FileText className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">No grievances filed in this jurisdiction.</p>
                </div>
              ) : (
                recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{c.complaint_id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm capitalize font-bold ${getStatusBadgeClass(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <MapPin className="w-3 h-3 text-[#005A9C]" />
                        {c.city || 'District Area'}
                      </span>
                      <span className={`px-1 py-0.5 rounded-xs text-[9px] font-bold capitalize ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Area: Civic Intelligence & Predicted Hotspots (3 cols) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col h-[490px]">
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <Flame className="w-4 h-4 text-[#E65100]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Predictive Hotspots</h3>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>Infrastructure Stress Zones</span>
                <span className="text-[10px] font-bold text-[#C62828] bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                  {hotspots.length} Priority Areas
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Time-series frequency analysis predicting recurrence risk before public distress escalates.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {hotspots.map((h, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                      {h.city}, {h.state}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#C62828]">{h.predicted_risk}% Risk</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#EF6C00] to-[#C62828] rounded-full"
                      style={{ width: `${h.predicted_risk}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{h.unresolved_count} Unresolved</span>
                    <span className="font-semibold text-slate-700">{h.prediction_label}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/admin/risk-heatmap')}
              className="mt-3 w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <span>Explore National Heatmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Lower Dashboard: Complaints By Category & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complaints by Category Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Complaints Distribution by Municipal Category
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                  />
                  <Bar dataKey="count" fill="#005A9C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Citizen Responsibility & Citizen Charter Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-[#005A9C]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Citizen Charter &amp; Service Standards
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Under the National Citizen Charter, critical grievances involving drinking water safety, open 
                manholes, live electric wires, and deep roadway collapses must be inspected within 24 hours. 
                Our AI classification system automatically routes submissions directly to registered zonal engineers.
              </p>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Encountered an infrastructure fault?</p>
                <p className="text-[11px] text-slate-500">Provide photos &amp; GPS coordinates for immediate triage.</p>
              </div>
              <button
                onClick={() => navigate('/report')}
                className="bg-[#005A9C] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all shadow-xs"
              >
                Report Problem
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
