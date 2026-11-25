import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Search, Bell, MapPin, ChevronDown, Check, Globe } from 'lucide-react';

interface HeaderProps {
  onSearch?: (term: string) => void;
  selectedState?: string;
  onSelectState?: (state: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, selectedState = '', onSelectState }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [states, setStates] = useState<{ name: string; code: string; lat: number; lng: number }[]>([]);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load states list
    api.get('/geo/states')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setStates(res.data);
        }
      })
      .catch((err) => console.error('Failed to load states', err));

    // Load unread notifications
    if (user) {
      api.get('/notifications/unread-count')
        .then((res) => setUnreadCount(res.data.count))
        .catch(() => {});
    }

    // Click outside listener for dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  const handleStateClick = (stateName: string) => {
    if (onSelectState) {
      onSelectState(stateName);
    }
    setIsStateOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search complaints, wards, or cities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#005A9C] focus:bg-white transition-all"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* National / State Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsStateOpen(!isStateOpen)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#005A9C]" />
            <span className="truncate max-w-[140px]">
              {selectedState || 'All India (National)'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isStateOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-gov-lg py-1.5 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Select Jurisdiction
              </div>

              {/* All India Option */}
              <button
                type="button"
                onClick={() => handleStateClick('')}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#005A9C]" /> All India (National Overview)
                </span>
                {!selectedState && <Check className="w-3.5 h-3.5 text-[#005A9C] font-bold" />}
              </button>

              <div className="h-[1px] bg-slate-100 my-1" />

              {/* 36 States & UTs */}
              {states.map((st) => (
                <button
                  type="button"
                  key={st.code}
                  onClick={() => handleStateClick(st.name)}
                  className={`w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005A9C] flex items-center justify-between transition-colors ${
                    selectedState === st.name ? 'bg-blue-50 font-bold text-[#005A9C]' : 'font-normal'
                  }`}
                >
                  <span>{st.name}</span>
                  {selectedState === st.name && <Check className="w-3.5 h-3.5 text-[#005A9C]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#C62828] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Mini Avatar & Name */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 cursor-pointer pl-2 pr-3 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <div className="w-7 h-7 rounded-full bg-[#0F2942] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              {user?.full_name?.split(' ')[0]}
            </p>
            <span className="text-[10px] text-slate-400 capitalize font-medium">
              {user?.role || 'Citizen'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
