import { useState, useMemo } from "react";
import { calculateDistance } from "../utils/distance";

export default function NearbySheet({ open, pondoks, gpsPin, onClose, onSelect }) {
  const [radiusFilter, setRadiusFilter] = useState(10); // Default 10 KM

  // Hitung jarak dan urutkan
  const nearbyPondoks = useMemo(() => {
    if (!gpsPin || !pondoks) return [];

    const withDistance = pondoks.map(p => {
      const dist = calculateDistance(gpsPin.lat, gpsPin.lng, p.lat, p.lng);
      return { ...p, distance: dist };
    });

    // Filter berdasarkan radius
    const filtered = radiusFilter === 'all' 
      ? withDistance 
      : withDistance.filter(p => p.distance <= radiusFilter);

    // Urutkan dari yang terdekat
    return filtered.sort((a, b) => a.distance - b.distance);
  }, [pondoks, gpsPin, radiusFilter]);

  if (!open) return null;

  return (
    <div className="ui-overlay" onClick={onClose}>
      <div className="ui-sheet !p-0 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-3xl shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Pondok Terdekat
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Dari lokasi Anda saat ini
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* RADIUS FILTER TABS */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {[5, 10, 20, 'all'].map((rad) => {
              const isActive = radiusFilter === rad;
              const label = rad === 'all' ? 'Semua Jarak' : `< ${rad} KM`;
              return (
                <button
                  key={rad}
                  onClick={() => setRadiusFilter(rad)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors border ${
                    isActive 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50">
          {!gpsPin ? (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">Mencari lokasi Anda...</p>
            </div>
          ) : nearbyPondoks.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-500 font-medium text-sm">Tidak ada pondok dalam radius ini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {nearbyPondoks.map((p) => {
                const isPJGT = p.petugas?.toLowerCase().includes("pjgt") || p.petugas?.toLowerCase().includes("guru tugas");
                const isRanting = p.status?.toLowerCase() === 'ranting';
                
                let bgColor = 'bg-blue-50';
                let textColor = 'text-blue-600';
                let hoverBgColor = 'group-hover:bg-blue-500';
                let borderColor = 'hover:border-blue-200';
                
                if (isPJGT) {
                  bgColor = 'bg-green-50';
                  textColor = 'text-green-600';
                  hoverBgColor = 'group-hover:bg-green-500';
                  borderColor = 'hover:border-green-200';
                } else if (isRanting) {
                  bgColor = 'bg-amber-50';
                  textColor = 'text-amber-600';
                  hoverBgColor = 'group-hover:bg-amber-500';
                  borderColor = 'hover:border-amber-200';
                }

                return (
                  <button 
                    key={p.id}
                    onClick={() => {
                      onSelect(p);
                      onClose();
                    }}
                    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md ${borderColor} transition-all text-left flex gap-4 items-center group`}
                  >
                    <div className={`w-12 h-12 ${bgColor} rounded-xl flex flex-col items-center justify-center ${textColor} shrink-0 ${hoverBgColor} group-hover:text-white transition-colors`}>
                      <span className="text-[10px] font-bold leading-none mt-1">KM</span>
                      <span className="font-extrabold text-sm leading-none">{p.distance.toFixed(1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate uppercase text-sm">{p.nama_madrasah}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{p.nama_pengasuh}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{p.wilayah}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
