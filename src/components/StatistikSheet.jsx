import { useMemo } from "react";
import { WILAYAH_OPTIONS } from "../utils/constants";

export default function StatistikSheet({ open, pondoks, onClose }) {
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
            {WILAYAH_OPTIONS.map((wilayah, index) => {
              const count = stats.counts[wilayah];
              return (
                <li key={wilayah} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-gray-700">
                    {index + 1}. {wilayah}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
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
        
        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex justify-between items-center font-bold text-lg text-gray-800 p-2">
            <span>Total Keseluruhan:</span>
            <span className="text-green-600">{pondoks.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
