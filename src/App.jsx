import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { fetchPondok } from "./services/pondok";
import { Toaster, toast } from "react-hot-toast";

import MapView from "./components/MapView";
import DetailSheet from "./components/DetailSheet";
import AddPondokSheet from "./components/AddPondokSheet";
import AdminLoginModal from "./components/AdminLoginModal";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [pondoks, setPondoks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPondok, setSelectedPondok] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔒 Firebase Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isAdmin = !!currentUser;

  // 📍 GPS pin untuk map
  const [gpsPin, setGpsPin] = useState(null);

  /* =====================
     🔐 FIREBASE AUTH LISTENER
     ===================== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
     🔒 ADMIN LOGIN / LOGOUT
     ===================== */
  async function handleAdminToggle() {
    if (isAdmin) {
      try {
        await signOut(auth);
        toast.success("Berhasil keluar dari Mode Admin");
      } catch (err) {
        console.error("Logout error:", err);
        toast.error("Gagal logout");
      }
      return;
    }
    setShowLoginModal(true);
  }

  /* =====================
     ⏳ LOADING
     ===================== */
  if (loading || authLoading) {
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

      {/* 🔒 ADMIN TOGGLE */}
      <button 
        onClick={handleAdminToggle}
        className={`fixed top-6 right-6 z-[990] backdrop-blur-md p-3 rounded-xl shadow-lg border transition-all ${
          isAdmin 
            ? 'bg-green-50/90 border-green-200 text-green-600 hover:bg-green-100/90' 
            : 'bg-white/90 border-gray-200 text-gray-500 hover:text-green-600'
        }`}
        title={isAdmin ? `Admin: ${currentUser.email} — Klik untuk logout` : "Login Admin"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isAdmin ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          )}
        </svg>
      </button>

      {/* Admin indicator badge */}
      {isAdmin && (
        <div className="fixed top-[4.5rem] right-6 z-[990]">
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-600/30 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Admin Mode
          </span>
        </div>
      )}

      {/* 🗺️ MAP */}
      <MapView pondoks={filteredPondoks} gpsPin={gpsPin} onSelect={setSelectedPondok} />

      {/* 🖼️ DETAIL */}
      <DetailSheet
        pondok={selectedPondok}
        isAdmin={isAdmin}
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

      {/* 🔐 ADMIN LOGIN MODAL */}
      <AdminLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 📱 BOTTOM NAV */}
      <BottomNav onAdd={() => setOpenAdd(true)} onGPS={handleGPS} />
    </>
  );
}
