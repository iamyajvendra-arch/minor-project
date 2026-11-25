import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapComplaintPoint } from '../types';
import { getPriorityBadgeClass, getCategoryLabel } from '../utils';

// Professional Priority marker icon generator
const createPriorityIcon = (priority: string) => {
  let color = '#EF6C00'; // Warning orange (medium)
  if (priority === 'critical') color = '#C62828'; // Deep red
  else if (priority === 'high') color = '#D84315'; // Saffron red-orange
  else if (priority === 'low') color = '#2E7D32'; // Forest green

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

interface CivicMapProps {
  points: MapComplaintPoint[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (complaint: MapComplaintPoint) => void;
}

// Controller component to smoothly fly/update center
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const CivicMap: React.FC<CivicMapProps> = ({
  points,
  center = [22.97, 78.65], // Center of India
  zoom = 5,
  height = '100%',
  onMarkerClick,
}) => {
  return (
    <div style={{ height, width: '100%' }} className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={center} zoom={zoom} />
        {/* OpenStreetMap public low-volume tiles - no paid key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {points.map((pt) => {
          if (!pt.lat || !pt.lng) return null;
          return (
            <Marker
              key={pt.id}
              position={[pt.lat, pt.lng]}
              icon={createPriorityIcon(pt.priority)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(pt);
                },
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{pt.complaint_id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm capitalize font-bold ${getPriorityBadgeClass(pt.priority)}`}>
                      {pt.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">{pt.title}</h4>
                  <p className="text-[10px] text-slate-600 mb-1">
                    📍 {pt.city || 'District Area'}, {pt.state || 'India'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-800 font-semibold pt-1 border-t border-slate-200">
                    <span>{getCategoryLabel(pt.category)}</span>
                    <span className="text-[#005A9C] font-bold">{pt.severity_score ? Math.round(pt.severity_score) : 50}/100</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-1.5 z-[400] text-[10px] shadow-gov flex items-center gap-3">
        <span className="font-bold text-slate-800">Priority:</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C62828] inline-block" />
          <span className="text-slate-600">Critical</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D84315] inline-block" />
          <span className="text-slate-600">High</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF6C00] inline-block" />
          <span className="text-slate-600">Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block" />
          <span className="text-slate-600">Low/Resolved</span>
        </div>
      </div>
    </div>
  );
};
