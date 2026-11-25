import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { CivicMap } from '../components/CivicMap';
import { MapComplaintPoint } from '../types';
import { MapPin, Filter, Layers, Flame } from 'lucide-react';

export const CivicMapView: React.FC = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MapComplaintPoint[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, [selectedState, categoryFilter, priorityFilter]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get(`/complaints/map-data?${params.toString()}`);
      setPoints(res.data);
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

      <main className="p-6 flex-1 flex flex-col space-y-4 max-w-[1600px] mx-auto w-full">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-cs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#005A9C]" /> India-Wide Civic Geospatial Map
            </h1>
            <p className="text-[11px] text-[#64748B]">
              Showing {points.length} complaints &bull; OpenStreetMap Leaflet Engine (No paid key required)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
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

            <button
              onClick={() => navigate('/admin/risk-heatmap')}
              className="flex items-center gap-1 text-xs text-[#005A9C] bg-[#EBF3FA] px-3 py-1.5 rounded-xl font-semibold hover:bg-[#E2EEF8] transition-colors"
            >
              <Flame className="w-3.5 h-3.5" /> Risk Heatmap
            </button>
          </div>
        </div>

        {/* Full Interactive Map Container */}
        <div className="flex-1 min-h-[550px] w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-cs p-2">
          <CivicMap
            points={points}
            zoom={selectedState ? 7 : 5}
            height="100%"
            onMarkerClick={(pt) => navigate(`/complaints/${pt.id}`)}
          />
        </div>
      </main>
    </div>
  );
};
