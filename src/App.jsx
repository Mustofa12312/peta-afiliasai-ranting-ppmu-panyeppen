import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { fetchPondok } from "./services/pondok";
import { Toaster, toast } from "react-hot-toast";

import MapView from "./components/MapView";
import DetailSheet from "./components/DetailSheet";
import AddPondokSheet from "./components/AddPondokSheet";
import EditPondokSheet from "./components/EditPondokSheet";
import AdminLoginModal from "./components/AdminLoginModal";
import BottomNav from "./components/BottomNav";
import StatistikSheet from "./components/StatistikSheet";

export default function App() {
  const [pondoks, setPondoks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPondok, setSelectedPondok] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openStatistik, setOpenStatistik] = useState(false);
  const [targetFlyTo, setTargetFlyTo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
     🔒 BODY SCROLL LOCK
     ===================== */
  useEffect(() => {
    if (openAdd || editTarget || showLoginModal || selectedPondok || openStatistik) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openAdd, editTarget, showLoginModal, selectedPondok, openStatistik]);

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
     ⏳ LOADING SPLASH SCREEN
     ===================== */
  if (loading || authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center animate-pulse">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-gray-100 shadow-[#0000fe]/20">
            <svg className="w-10 h-10 text-[#0000fe]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-[#0000fe]">Kursus Tartil Al-Qur'an</h2>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Se-Madura</p>
          <div className="mt-8 flex gap-2">
            <div className="w-2 h-2 bg-[#0000fe] rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-[#0000fe] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-[#0000fe] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
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

      {/* 🏷️ BRANDING HEADER (DESKTOP) */}
      <div className="fixed top-6 left-4 z-[990] pt-[env(safe-area-inset-top)] pointer-events-none hidden md:flex">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-3 flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0000fe] to-blue-400 rounded-xl flex items-center justify-center text-white shadow-inner">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-800 tracking-tight leading-tight">Kursus Tartil Al-Qur'an</h1>
            <p className="text-[10px] font-semibold text-[#0000fe] uppercase tracking-wider">Se-Madura</p>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH BAR FLOATING DENGAN AUTOCOMPLETE */}
      <div className="fixed top-6 left-4 right-20 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[90%] md:max-w-md z-[990] pt-[env(safe-area-inset-top)]">
        <div className="relative shadow-lg rounded-2xl overflow-visible bg-white/90 backdrop-blur-md border border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="search" 
              placeholder="Cari Madrasah atau Pengasuh..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full py-4 pl-12 pr-4 bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>
          
          {/* SEARCH DROPDOWN */}
          {showDropdown && searchQuery && filteredPondoks.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto z-[1000] py-2 custom-scrollbar">
              {filteredPondoks.slice(0, 10).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setTargetFlyTo(p);
                    setSelectedPondok(p);
                    setSearchQuery(p.nama_madrasah);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col transition-colors border-b border-gray-50 last:border-0"
                >
                  <span className="font-bold text-gray-800">{p.nama_madrasah}</span>
                  <span className="text-xs text-gray-500">{p.nama_pengasuh} • {p.wilayah || 'Belum Diset'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔒 ADMIN TOGGLE */}
      <button 
        onClick={handleAdminToggle}
        className={`fixed top-6 right-4 z-[990] backdrop-blur-md p-3 rounded-xl shadow-lg border transition-all mt-[env(safe-area-inset-top)] ${
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
        <div className="fixed top-[4.5rem] right-4 z-[990] mt-[env(safe-area-inset-top)]">
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-600/30 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Admin Mode
          </span>
        </div>
      )}

      {/* COUNTER & LEGENDA */}
      <div className="fixed bottom-[100px] left-4 z-[990] flex flex-col gap-2 mb-[env(safe-area-inset-bottom)] pointer-events-none">
        
        {/* COUNTER (Tampil untuk semua) */}
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-xs font-bold text-gray-700 w-fit pointer-events-auto flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {filteredPondoks.length} Pondok
        </div>
        
        {/* LEGENDA & STATISTIK (Hanya Admin) */}
        {isAdmin && (
          <>
            <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-gray-200 text-xs font-medium text-gray-600 flex flex-col gap-2 w-fit pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0000fe] border border-white shadow-sm ring-1 ring-[#0000fe]/20"></div>
                Non-Ranting
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm ring-1 ring-amber-600/20"></div>
                Ranting
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm ring-1 ring-green-600/20"></div>
                PJGT / Guru Tugas
              </div>
            </div>

            <button 
              onClick={() => setOpenStatistik(true)}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl shadow-lg shadow-blue-600/30 text-xs font-bold pointer-events-auto flex items-center justify-center gap-1.5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Statistik Wilayah
            </button>
          </>
        )}
      </div>

      {/* 🗺️ MAP */}
      <MapView pondoks={filteredPondoks} gpsPin={gpsPin} onSelect={setSelectedPondok} targetFlyTo={targetFlyTo} />

      {/* 🖼️ DETAIL */}
      <DetailSheet
        pondok={selectedPondok}
        isAdmin={isAdmin}
        onClose={() => setSelectedPondok(null)}
        onEdit={(p) => {
          setSelectedPondok(null);
          setEditTarget(p);
        }}
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

      {/* ✏️ EDIT PONDOK */}
      <EditPondokSheet
        open={!!editTarget}
        pondok={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          loadPondoks();
          setEditTarget(null);
        }}
      />

      {/* 🔐 ADMIN LOGIN MODAL */}
      <AdminLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* 📊 STATISTIK WILAYAH */}
      <StatistikSheet
        open={openStatistik}
        pondoks={pondoks}
        onClose={() => setOpenStatistik(false)}
        onUpdated={loadPondoks}
      />

      {/* 📱 BOTTOM NAV */}
      <BottomNav onAdd={() => setOpenAdd(true)} onGPS={handleGPS} />
    </>
  );
}
