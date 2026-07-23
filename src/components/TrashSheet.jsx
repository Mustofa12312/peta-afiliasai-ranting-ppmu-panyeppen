import { useState, useEffect } from "react";
import { fetchDeletedPondok, restoreDeletedPondok, permanentDeletePondok } from "../services/pondok";
import toast from "react-hot-toast";

export default function TrashSheet({ open, onClose, onDataChanged }) {
  const [deletedData, setDeletedData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDeletedData();
    }
  }, [open]);

  const loadDeletedData = async () => {
    setLoading(true);
    try {
      const data = await fetchDeletedPondok();
      setDeletedData(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data sampah");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Pulihkan data ini kembali ke peta?")) return;
    try {
      toast.loading("Memulihkan...", { id: "restore" });
      await restoreDeletedPondok(id);
      toast.success("Berhasil dipulihkan", { id: "restore" });
      await loadDeletedData();
      onDataChanged?.();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memulihkan data", { id: "restore" });
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Peringatan: Data akan dihapus permanen dan tidak bisa dikembalikan. Lanjutkan?")) return;
    try {
      toast.loading("Menghapus permanen...", { id: "perm_del" });
      await permanentDeletePondok(id);
      toast.success("Berhasil dihapus permanen", { id: "perm_del" });
      await loadDeletedData();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus permanen", { id: "perm_del" });
    }
  };

  if (!open) return null;

  return (
    <div className="ui-overlay z-[2000]" onClick={onClose}>
      <div className="ui-sheet max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drag-handle" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="ui-title !mb-0 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Tong Sampah
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pb-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : deletedData.length === 0 ? (
            <div className="text-center text-gray-500 p-8 flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <p>Tong sampah kosong.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedData.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-gray-800 uppercase">{item.nama_madrasah}</h4>
                    <p className="text-xs text-gray-500 mt-1">Dihapus pada: {item.deletedAt ? new Date(item.deletedAt).toLocaleString('id-ID') : 'Tidak diketahui'}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleRestore(item.id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Pulihkan
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(item.id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Permanen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
