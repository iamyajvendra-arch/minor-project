export const vibrate = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked
    }
  }
};

export const haptics = {
  success: () => vibrate([30, 50, 30]),
  error: () => vibrate([80, 50, 80]),
  light: () => vibrate(25),
  warning: () => vibrate([50, 30, 50]),
};

export const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    road_pothole: 'Road & Potholes',
    garbage_sanitation: 'Garbage & Sanitation',
    water_supply: 'Water Supply',
    drainage_sewage: 'Drainage & Sewage',
    electricity_streetlight: 'Electricity & Lighting',
    public_infrastructure: 'Public Infrastructure',
    other: 'General Civic Grievance',
  };
  return map[category] || category;
};

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-800 border border-blue-200';
    case 'pending':
    case 'submitted':
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'escalated':
      return 'bg-rose-50 text-rose-800 border border-rose-300 font-bold';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-50 text-red-700 border border-red-200 font-bold';
    case 'high':
      return 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'low':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-200';
  }
};
