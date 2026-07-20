import { deletePondok } from "../services/pondok";
import toast from "react-hot-toast";

export default function DetailSheet({ pondok, onClose, onDeleted }) {
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
        <div className="w-full h-64 bg-gray-100 relative rounded-t-3xl sm:rounded-t-3xl overflow-hidden">
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
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors backdrop-blur-sm"
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
          
          <div className="mt-8">
            <button onClick={handleDelete} className="ui-button-danger">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Data Pondok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
