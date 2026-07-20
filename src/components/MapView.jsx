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

/* =====================
   FIX ICON
   ===================== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* =====================
   KOMPONEN MARKER PONDOK
   ===================== */
function PondokMarker({ pondok, onSelect }) {
  const map = useMap();
  
  // Ranting color differentiation logic (Optional styling)
  const isRanting = pondok.status?.toLowerCase() === 'ranting';

  // We could use custom marker icons based on isRanting here if desired.
  // For now using the default Leaflet marker with custom tooltip styling.

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
      <Tooltip permanent direction="top" offset={[0, -10]} opacity={1} className={`custom-map-tooltip ${isRanting ? 'border-amber-500 text-amber-700' : 'border-green-600 text-green-800'}`}>
        <div className="flex flex-col items-center">
          <span className="font-bold">{pondok.nama_madrasah}</span>
          <span className="text-xs font-normal opacity-80">{pondok.nama_pengasuh}</span>
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

      {/* MARKER PONDOK DENGAN CLUSTER */}
      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={(cluster) => {
          return L.divIcon({
            html: `<div><span>${cluster.getChildCount()}</span></div>`,
            className: "custom-cluster-icon",
            iconSize: L.point(40, 40, true),
          });
        }}
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
