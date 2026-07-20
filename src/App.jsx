import { useEffect, useState, useCallback } from "react";
import { fetchPondok } from "./services/pondok";
import { Toaster, toast } from "react-hot-toast";

import MapView from "./components/MapView";
import DetailSheet from "./components/DetailSheet";
import AddPondokSheet from "./components/AddPondokSheet";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [pondoks, setPondoks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPondok, setSelectedPondok] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 📍 GPS pin untuk map
  const [gpsPin, setGpsPin] = useState(null);

  /* =====================
     🔥 LOAD / RELOAD FIRESTORE
     ===================== */
  const loadPondoks = useCallback(async () => {
    try {
      const list = await fetchPondok();
      setPondoks(list);
    } catch (err) {
      console.error("Gagal load pondok:", err);
      // Optional: Handle initial load failure if it's due to missing Firebase config
      if (err.code === 'failed-precondition' || err.message.includes('missing')) {
        toast.error("Konfigurasi Firebase belum lengkap. Silakan cek file .env", { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // load pertama kali
  useEffect(() => {
    loadPondoks();
  }, [loadPondoks]);

  /* =====================
     📍 GPS HANDLER
     ===================== */
  function handleGPS() {
    if (!navigator.geolocation) {
      toast.error("GPS tidak didukung di perangkat ini");
      return;
    }

    const toastId = toast.loading("Mencari lokasi...", { id: "gps" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // reset dulu supaya Leaflet pasti update
        setGpsPin(null);

        setTimeout(() => {
          setGpsPin({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          toast.success("Area lokasi Anda ditemukan!", { id: toastId });
        }, 50);
      },
      (err) => {
        console.error(err);
        toast.error(
          err.code === 1 ? "Izin lokasi ditolak" : "Gagal mengambil lokasi GPS", 
          { id: toastId }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  /* =====================
     ⏳ LOADING
     ===================== */
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Memuat Peta Madura...</h2>
      </div>
    );
  }

  const filteredPondoks = pondoks.filter((p) =>
    p.nama_madrasah?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.nama_pengasuh?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f2937',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6'
          },
        }} 
      />

      {/* 🔍 SEARCH BAR FLOATING */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[990] w-[90%] max-w-md">
        <div className="relative shadow-lg rounded-2xl overflow-hidden bg-white/90 backdrop-blur-md border border-gray-200">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="search" 
            placeholder="Cari Madrasah atau Pengasuh..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-12 pr-4 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      {/* 🗺️ MAP */}
      <MapView pondoks={filteredPondoks} gpsPin={gpsPin} onSelect={setSelectedPondok} />

      {/* 🖼️ DETAIL */}
      <DetailSheet
        pondok={selectedPondok}
        onClose={() => setSelectedPondok(null)}
        onDeleted={() => {
          setSelectedPondok(null);
          loadPondoks();
        }}
      />

      {/* ➕ ADD PONDOK */}
      <AddPondokSheet
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSaved={loadPondoks}
      />

      {/* 📱 BOTTOM NAV */}
      <BottomNav onAdd={() => setOpenAdd(true)} onGPS={handleGPS} />
    </>
  );
}
