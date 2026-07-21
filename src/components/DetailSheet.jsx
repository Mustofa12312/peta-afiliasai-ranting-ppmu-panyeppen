import { deletePondok } from "../services/pondok";
import toast from "react-hot-toast";

export default function DetailSheet({ pondok, isAdmin, onClose, onDeleted }) {
  if (!pondok) return null;

  async function handleDelete() {
    if (!window.confirm(`Hapus data pondok ${pondok.nama_madrasah}?`)) return;

    try {
      toast.loading("Menghapus...", { id: "del" });
      await deletePondok(pondok.id);
      toast.success("Berhasil dihapus", { id: "del" });
      onDeleted?.();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data", { id: "del" });
    }
  }

  const isRanting = pondok.status?.toLowerCase() === 'ranting';

  return (
    <div className="ui-overlay" onClick={onClose}>
      <div className="ui-sheet !p-0" onClick={(e) => e.stopPropagation()}>
        {/* GAMBAR FULL LEBAR */}
        <div className="w-full h-48 sm:h-64 bg-gray-100 relative rounded-t-3xl sm:rounded-t-3xl overflow-hidden shrink-0">
          {pondok.fotoUrl ? (
            <img
              src={pondok.fotoUrl}
              alt={pondok.nama_madrasah}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <span className="text-xl font-medium">Tidak ada foto</span>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors backdrop-blur-sm shadow-md"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* KONTEN DETAIL */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{pondok.nama_madrasah}</h2>
              <p className="text-gray-600 mt-1">Pengasuh: <span className="font-semibold text-gray-800">{pondok.nama_pengasuh}</span></p>
            </div>
            {pondok.status && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${isRanting ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {pondok.status}
              </span>
            )}
          </div>

          {/* TOMBOL BUKA DI GOOGLE MAPS */}
          <div className="mt-6">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${pondok.lat},${pondok.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 py-3 px-4 rounded-xl font-semibold transition-colors border border-blue-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Buka di Google Maps
            </a>
          </div>
          
          {isAdmin && (
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={() => onEdit?.(pondok)} className="ui-button-primary !bg-blue-600 hover:!bg-blue-700 !shadow-blue-600/30">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Data Pondok
              </button>
              
              <button onClick={handleDelete} className="ui-button-danger">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Data Pondok
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
