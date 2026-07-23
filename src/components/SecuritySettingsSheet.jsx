import { useState, useEffect } from "react";
import { fetchSecuritySettings, updateSecuritySettings } from "../services/settings";
import toast from "react-hot-toast";

export default function SecuritySettingsSheet({ open, onClose }) {
  const [isFormLocked, setIsFormLocked] = useState(false);
  const [formPin, setFormPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchSecuritySettings();
      setIsFormLocked(data.isFormLocked || false);
      setFormPin(data.formPin || "123456");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat pengaturan keamanan");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isFormLocked && formPin.length !== 6) {
      return toast.error("PIN harus tepat 6 angka!");
    }
    if (isFormLocked && !/^\d+$/.test(formPin)) {
      return toast.error("PIN hanya boleh berisi angka!");
    }

    try {
      toast.loading("Menyimpan pengaturan...", { id: "sec_save" });
      await updateSecuritySettings({ isFormLocked, formPin });
      toast.success("Pengaturan keamanan berhasil disimpan", { id: "sec_save" });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan pengaturan", { id: "sec_save" });
    }
  };

  if (!open) return null;

  return (
    <div className="ui-overlay z-[2000]" onClick={onClose}>
      <div className="ui-sheet max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drag-handle" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="ui-title !mb-0 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Pengaturan Keamanan
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-4">
              <div className="pt-1">
                <input 
                  type="checkbox" 
                  id="lockToggle"
                  checked={isFormLocked}
                  onChange={(e) => setIsFormLocked(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <label htmlFor="lockToggle" className="flex-1 cursor-pointer">
                <p className="font-bold text-indigo-900 text-lg">Aktifkan Gembok Formulir</p>
                <p className="text-sm text-indigo-700 mt-1">
                  Jika diaktifkan, siapapun yang menekan tombol (+) Tambah Pondok harus memasukkan PIN 6 Angka terlebih dahulu.
                </p>
              </label>
            </div>

            {isFormLocked && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-bold text-gray-700 mb-2">PIN Rahasia (6 Angka)</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Contoh: 123456"
                  value={formPin}
                  onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ''))} // Hanya angka
                  className="w-full text-center text-3xl tracking-[1em] font-mono font-bold py-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required={isFormLocked}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Bagikan PIN ini secara manual (misal via WhatsApp) kepada panitia atau petugas yang bertugas mengisi data.
                </p>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Simpan Pengaturan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
