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
   KOMPONEN MARKER PONDOK
   ===================== */
function PondokMarker({ pondok, onSelect }) {
  const map = useMap();
  
  return (
    <Marker
      position={[pondok.lat, pondok.lng]}
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
      <Tooltip permanent direction="top" offset={[0, -40]} opacity={1} className="glass-tooltip">
        <span className="font-extrabold text-gray-800 text-sm">{pondok.nama_madrasah}</span>
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
    </MapContainer>
  );
}
