import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Flame,
  Layers,
  Building,
  CheckCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col text-slate-800">
      {/* Official Government Header Topbar */}
      <div className="bg-[#0A1C2E] text-white px-6 md:px-12 py-1.5 text-[11px] flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span>🇮🇳</span>
          <span className="font-semibold text-slate-200">Government of India &bull; Ministry of Housing and Urban Affairs</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span>National Grievance Portal</span>
          <span className="hidden sm:inline">24x7 Citizen Assistance</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F2942] flex items-center justify-center text-white font-black text-xl shadow-xs border border-slate-700">
            सी
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                CIVIC-<span className="text-[#005A9C]">सेवा</span>
              </span>
              <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-sm border border-slate-300">
                GOV.IN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">National Grievance Redressal System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/map')}
            className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-[#005A9C] px-3 py-1.5 rounded-md transition-colors"
          >
            National Map
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-slate-700 hover:text-[#005A9C] px-3 py-1.5 rounded-md transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-[#005A9C] hover:bg-[#004780] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            Register Grievance &rarr;
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-20 max-w-5xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold text-[#005A9C]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E65100]" /> Integrated Public Grievance Redressal Portal
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Unified Municipal Grievance &amp; Redressal System
        </h1>

        <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Report municipal defects, monitor verifiable geo-tagged resolutions with guaranteed SLA timelines, 
          and empower urban local bodies across all 28 Indian States and 8 Union Territories.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={() => navigate('/report')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#005A9C] hover:bg-[#004780] text-white px-6 py-3 rounded-lg text-xs font-bold shadow-gov transition-all active:scale-95"
          >
            <span>Lodge a Grievance Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/map')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 hover:border-[#005A9C] text-slate-800 px-6 py-3 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <MapPin className="w-4 h-4 text-[#005A9C]" />
            <span>View National Map Surveillance</span>
          </button>
        </div>
      </section>

      {/* 4 Official Feature Highlights */}
      <section className="px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#005A9C] flex items-center justify-center mb-3 border border-blue-100">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Automated Department Routing</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Natural language models route complaints directly to registered zonal municipal corporations.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center mb-3 border border-red-100">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Severity Scoring (CSS)</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Formula evaluating public hazard, urgency, population impact, and proximity to sensitive infrastructure.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-[#EF6C00] flex items-center justify-center mb-3 border border-amber-100">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Geospatial Clustering</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Consolidates multiple reports within a 500m radius to eliminate duplicate vehicle dispatch.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#1B5E20] flex items-center justify-center mb-3 border border-emerald-100">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">SLA Auto-Escalation</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Timers escalate overdue cases to District Collectors and Municipal Commissioners automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CIVIC-सेवा &bull; National Civic Grievance Management System &bull; Government of India.</p>
        <p className="text-[10px] text-slate-400 mt-1">
          Developed in compliance with the National e-Governance Division (NeGD) guidelines.
        </p>
      </footer>
    </div>
  );
};
