import { useMemo, useRef, useState } from "react";
import { WILAYAH_OPTIONS } from "../utils/constants";
import toast from "react-hot-toast";
import { restorePondok } from "../services/pondok";

export default function StatistikSheet({ open, pondoks, onClose, onUpdated }) {
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  const stats = useMemo(() => {
    // Inisialisasi semua wilayah dengan 0 agar tetap tampil meski kosong
    const counts = {};
    WILAYAH_OPTIONS.forEach((w) => {
      counts[w] = 0;
    });
    
    let belumDitentukan = 0;

    pondoks.forEach((p) => {
      const w = p.wilayah;
      if (w && counts[w] !== undefined) {
        counts[w]++;
      } else {
        belumDitentukan++;
      }
    });

    return { counts, belumDitentukan };
  }, [pondoks]);

  // Fungsi Ekspor CSV (Excel)
  const handleExportCSV = () => {
    if (!pondoks || pondoks.length === 0) return toast.error("Data kosong");
    
    // Header CSV
    const headers = ["Nama Madrasah", "Nama Pengasuh", "Petugas Pengisi", "Status", "Wilayah", "Latitude", "Longitude"];
    const rows = pondoks.map(p => [
      `"${p.nama_madrasah || ''}"`,
      `"${p.nama_pengasuh || ''}"`,
      `"${p.petugas || ''}"`,
      `"${p.status || ''}"`,
      `"${p.wilayah || ''}"`,
      p.lat || '',
      p.lng || ''
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Pondok_Madura_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berhasil didownload");
  };

  // Fungsi Ekspor Backup JSON
  const handleExportJSON = () => {
    if (!pondoks || pondoks.length === 0) return toast.error("Data kosong");
    
    const jsonString = JSON.stringify(pondoks, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Backup_Data_Pondok_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berhasil didownload");
  };

  // Fungsi Import JSON
  const handleImportJSON = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm("PERINGATAN: Proses ini akan memulihkan data dari file Backup. Lanjutkan?")) {
      e.target.value = "";
      return;
    }

    try {
      setIsImporting(true);
      toast.loading("Mengimpor data...", { id: "import" });
      
      const fileText = await file.text();
      const parsedData = JSON.parse(fileText);

      if (!Array.isArray(parsedData)) {
        throw new Error("Format data tidak valid");
      }

      // Loop and restore each document using its original ID
      let successCount = 0;
      for (const item of parsedData) {
        if (item.id) {
          await restorePondok(item.id, item);
          successCount++;
        }
      }

      toast.success(`Berhasil memulihkan ${successCount} data`, { id: "import" });
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengimpor: file rusak atau format salah", { id: "import" });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  if (!open) return null;

  return (
    <div className="ui-overlay" onClick={onClose}>
      <div className="ui-sheet max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drag-handle" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Statistik Wilayah</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar">
          <p className="text-gray-500 text-sm mb-4">
            Jumlah Lembaga Afiliasi PPMU Panyeppen Wilayah Madura berdasarkan data di peta:
          </p>
          
          <ul className="space-y-3">
            {WILAYAH_OPTIONS
              .filter(wilayah => stats.counts[wilayah] > 0)
              .map((wilayah, index) => {
                const count = stats.counts[wilayah];
                return (
                  <li key={wilayah} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-medium text-gray-700">
                      {index + 1}. {wilayah}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                      {count}
                    </span>
                  </li>
                );
              })}
            
            {stats.belumDitentukan > 0 && (
              <li className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100 mt-4">
                <span className="font-medium text-red-700">
                  Lainnya (Belum Diset)
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-200 text-red-800">
                  {stats.belumDitentukan}
                </span>
              </li>
            )}
          </ul>
        </div>
        
        <div className="pt-4 border-t border-gray-100 mt-auto shrink-0 bg-white">
          <div className="flex justify-between items-center font-bold text-lg text-gray-800 p-2 mb-4">
            <span>Total Keseluruhan:</span>
            <span className="text-green-600">{pondoks.length}</span>
          </div>

          {/* MANAJEMEN DATA SECTION */}
          <div className="border border-blue-100 bg-blue-50/50 p-4 rounded-xl flex flex-col gap-3">
            <h4 className="font-bold text-gray-700 text-sm mb-1 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Manajemen Data (Admin)
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleExportCSV}
                className="flex flex-col items-center justify-center p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors gap-1 shadow-sm"
              >
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="text-[10px] font-bold text-gray-600">Ekspor Laporan (CSV)</span>
              </button>
              
              <button 
                onClick={handleExportJSON}
                className="flex flex-col items-center justify-center p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors gap-1 shadow-sm"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="text-[10px] font-bold text-gray-600">Backup Data (JSON)</span>
              </button>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full flex items-center justify-center p-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-lg transition-colors gap-2 shadow-sm disabled:opacity-50 mt-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-xs font-bold">{isImporting ? 'Memulihkan...' : 'Impor & Pulihkan Backup (JSON)'}</span>
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImportJSON} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
