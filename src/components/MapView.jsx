import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Clustering removed as per request

/* =====================
   FIX ICON
   ===================== */
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

/* =====================
   KOMPONEN MARKER PONDOK (Minimalist Dot)
   ===================== */
function PondokMarker({ pondok, onSelect }) {
  const map = useMap();
  const isPJGT = pondok.petugas?.toLowerCase().includes("pjgt") || pondok.petugas?.toLowerCase().includes("guru tugas");
  const isRanting = pondok.status?.toLowerCase() === 'ranting';
  
  let pinColorClass = 'text-[#0000fe]';
  let shadowClass = 'bg-[#0000fe]/30';

  if (isPJGT) {
    pinColorClass = 'text-green-500';
    shadowClass = 'bg-green-500/30';
  } else if (isRanting) {
    pinColorClass = 'text-amber-500';
    shadowClass = 'bg-amber-900/30';
  }
  
  // Custom SVG Pin Icon
  const customIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div class="relative flex flex-col items-center justify-center group">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ${pinColorClass} drop-shadow-md transition-transform group-hover:scale-110 group-hover:-translate-y-1">
               <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
             </svg>
             <div class="absolute bottom-0 w-3 h-1 ${shadowClass} rounded-[100%] blur-[1px]"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // jangkar di ujung bawah pin
    tooltipAnchor: [16, -16], // jangkar tooltip di samping tengah pin
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
      <Tooltip permanent direction="right" offset={[8, 0]} opacity={1} className="compact-tooltip">
        <span className="font-semibold">{pondok.nama_madrasah}</span>
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
   KOMPONEN UNTUK FLY-TO SEARCH RESULT
   ===================== */
function TargetFlyToUpdater({ target }) {
  const map = useMap();
  
  if (target) {
    map.flyTo([target.lat, target.lng], 16, {
      animate: true,
      duration: 1.0
    });
  }
  return null;
}

/* =====================
   MAP UTAMA
   ===================== */
export default function MapView({ pondoks, onSelect, gpsPin, targetFlyTo }) {
  // Center of Madura roughly -7.05, 113.6
  return (
    <MapContainer
      center={[-7.08, 113.4]}
      zoom={10}
      style={{ height: "100vh", width: "100vw", zIndex: 0 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* MARKER PONDOK (TANPA CLUSTER) */}
      {pondoks.map((p) => (
        <PondokMarker key={p.id} pondok={p} onSelect={onSelect} />
      ))}

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

      {/* FLY TO TARGET DARI SEARCH */}
      {targetFlyTo && <TargetFlyToUpdater target={targetFlyTo} />}
    </MapContainer>
  );
}
