import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Header } from '../components/Header';
import { Flame, MapPin, AlertOctagon, TrendingUp } from 'lucide-react';

export const RiskHeatmap: React.FC = () => {
  const [riskData, setRiskData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/risk-heatmap')
      .then((res) => setRiskData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-[#E34B5D] bg-rose-50 border-rose-200';
      case 'high':
        return 'text-[#005A9C] bg-[#EBF3FA] border-[#EBF3FA]';
      case 'medium':
        return 'text-[#F1A23A] bg-amber-50 border-amber-200';
      default:
        return 'text-[#239B69] bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-rose-50 text-[#E34B5D]">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#1E293B]">National Civic Risk Heatmap Index</h1>
              <p className="text-xs text-[#64748B]">
                Data-driven vulnerability index combining complaint density, average severity score, and unresolved case age
              </p>
            </div>
          </div>
        </div>

        {/* Risk Zones Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-cs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]">Monitored Jurisdiction Zones</span>
            <span className="text-[11px] text-[#64748B]">Ranked by Composite Risk Score</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F6F9] text-[#64748B] border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Jurisdiction / City</th>
                  <th className="py-3 px-4 font-semibold">State</th>
                  <th className="py-3 px-4 font-semibold">Active Complaints</th>
                  <th className="py-3 px-4 font-semibold">Avg Severity</th>
                  <th className="py-3 px-4 font-semibold">Risk Index</th>
                  <th className="py-3 px-4 font-semibold">Risk Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      Computing risk matrix...
                    </td>
                  </tr>
                ) : riskData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#64748B]">
                      No risk anomalies detected.
                    </td>
                  </tr>
                ) : (
                  riskData.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F4F6F9] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#1E293B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#005A9C]" />
                        {row.city || row.district || 'Metro Region'}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">{row.state}</td>
                      <td className="py-3 px-4 font-bold text-[#1E293B]">{row.complaint_count}</td>
                      <td className="py-3 px-4 text-[#64748B]">{row.avg_severity} / 100</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#1E293B]">{row.risk_score}</span>
                          <div className="w-16 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#F1A23A] to-[#E34B5D]"
                              style={{ width: `${Math.min(100, row.risk_score)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] border ${getRiskColor(row.risk_level)}`}>
                          {row.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
