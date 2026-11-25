import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Header } from '../components/Header';
import { Layers, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DuplicateGroups: React.FC = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/duplicate-groups')
      .then((res) => setGroups(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#EBF3FA] text-[#005A9C]">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#1E293B]">Duplicate Grievance Clusters</h1>
              <p className="text-xs text-[#64748B]">
                AI TF-IDF Text Cosine Similarity (&gt;0.85) + Haversine Radius (&le;500m) Clustering
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-center text-[#64748B] py-8">Checking duplicate groups...</p>
          ) : groups.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-[#E2E8F0] shadow-cs">
              <CheckCircle className="w-8 h-8 text-[#239B69] mx-auto mb-2" />
              <h3 className="text-xs font-bold text-[#1E293B]">No duplicate conflicts</h3>
              <p className="text-[11px] text-[#64748B] mt-1">
                All submitted complaints have passed unique spatial-text thresholds.
              </p>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.id} className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E293B]">Group #{g.id}</span>
                    <span className="text-[11px] bg-[#EBF3FA] text-[#005A9C] font-bold px-2 py-0.5 rounded-full">
                      {g.complaint_count} Linked Grievances
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748B] capitalize">
                    Category: {g.category ? g.category.replace('_', ' ') : 'Civic'}
                  </span>
                </div>

                <div className="p-3 bg-[#F4F6F9] rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
                  {g.complaints?.map((c: any) => (
                    <div key={c.id} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                      <div>
                        <span className="font-mono text-[10px] text-[#64748B] mr-2">{c.complaint_id}</span>
                        <span className="font-medium text-[#1E293B]">{c.title}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] capitalize">{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
