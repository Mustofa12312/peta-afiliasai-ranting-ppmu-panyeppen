import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom cluster icon function using the CSS class already in index.css
const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: "custom-cluster-icon",
    iconSize: L.point(48, 48, true),
  });
};

/* =====================
   FIX ICON
   ===================== */
// Hapus setup default icon yang usang
// (Tidak dipakai lagi karena kita pakai divIcon)

/* =====================
   KOMPONEN MARKER PONDOK
   ===================== */
function PondokMarker({ pondok, onSelect }) {
  const map = useMap();
  
  // Ranting color differentiation logic (Optional styling)
  const isRanting = pondok.status?.toLowerCase() === 'ranting';

  // We could use custom marker icons based on isRanting here if desired.
  // For now using the default Leaflet marker with custom tooltip styling.

  // Buat icon kustom modern menggunakan HTML
  const customIcon = L.divIcon({
    className: 'bg-transparent border-none', // Hilangkan background default
    html: `<div class="custom-marker-dot ${isRanting ? 'marker-ranting' : 'marker-non-ranting'}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12], // Center it
  });

  return (
    <Marker
      position={[pondok.lat, pondok.lng]}
      icon={customIcon}
      eventHandlers={{
        click: () => {
          map.flyTo([pondok.lat, pondok.lng], 16, {
            animate: true,
            duration: 0.7,
          });
          onSelect(pondok);
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -12]} opacity={1} className="glass-tooltip">
        <div className="flex flex-col items-center gap-2 p-1 min-w-[100px]">
          {pondok.fotoUrl ? (
            <img 
              src={pondok.fotoUrl} 
              alt="Foto Pondok" 
              className="w-16 h-16 object-cover rounded-xl shadow-md border-2 border-white"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          <div className="flex flex-col items-center text-center">
            <span className="font-extrabold text-gray-800 text-sm leading-tight mb-0.5">{pondok.nama_madrasah}</span>
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{pondok.nama_pengasuh}</span>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

/* =====================
   KOMPONEN UNTUK AUTOPAN MAP KE GPS
   ===================== */
function GPSMarkerUpdater({ gpsPin }) {
  const map = useMap();
  
  if (gpsPin) {
    map.flyTo([gpsPin.lat, gpsPin.lng], 15, {
      animate: true,
      duration: 1.2
    });
  }
  return null;
}

/* =====================
   MAP UTAMA
   ===================== */
export default function MapView({ pondoks, onSelect, gpsPin }) {
  // Center of Madura roughly -7.05, 113.6
  return (
    <MapContainer
      center={[-7.05, 113.6]}
      zoom={9}
      style={{ height: "100vh", width: "100vw", zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* MARKER PONDOK (DENGAN CLUSTER) */}
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
      >
        {pondoks.map((p) => (
          <PondokMarker key={p.id} pondok={p} onSelect={onSelect} />
        ))}
      </MarkerClusterGroup>

      {/* MARKER GPS */}
      {gpsPin && (
        <>
          <GPSMarkerUpdater gpsPin={gpsPin} />
          <Marker position={[gpsPin.lat, gpsPin.lng]}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="custom-map-tooltip !border-blue-500">
              <span className="text-blue-500 font-bold">📍 Lokasi Anda</span>
            </Tooltip>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
