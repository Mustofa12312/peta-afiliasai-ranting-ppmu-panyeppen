import { useState } from "react";
import { addPondok } from "../services/pondok";
import { compressImage } from "../utils/compressImage";
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import toast from "react-hot-toast";

export default function AddPondokSheet({ open, onClose, onSaved }) {
  const [namaPengasuh, setNamaPengasuh] = useState("");
  const [namaMadrasah, setNamaMadrasah] = useState("");
  const [status, setStatus] = useState(""); // Ranting / Non-Ranting (Opsional)
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [pos, setPos] = useState(null);
  const [loading, setLoading] = useState(false);

  function ambilGPS() {
    if (!navigator.geolocation) {
      toast.error("GPS tidak didukung oleh browser Anda");
      return;
    }

    const toastId = toast.loading("Mencari lokasi...", { id: "gpsAdd" });

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });
        toast.success("Lokasi terdeteksi", { id: toastId });
      },
      () => toast.error("Gagal ambil lokasi, pastikan GPS aktif", { id: toastId }),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!namaPengasuh || !namaMadrasah || !pos) {
      toast.error("Nama Pengasuh, Nama Madrasah, dan lokasi (GPS) wajib diisi!", { duration: 4000 });
      return;
    }

    try {
      setLoading(true);
      let fotoUrl = null;

      if (foto) {
        toast.loading("Mengunggah foto...", { id: "upload" });
        const compressed = await compressImage(foto, { maxSize: 1200, quality: 0.7 });
        fotoUrl = await uploadToCloudinary(compressed);
        toast.success("Foto berhasil diunggah", { id: "upload" });
      }

      await addPondok({
        nama_pengasuh: namaPengasuh.trim(),
        nama_madrasah: namaMadrasah.trim(),
        status: status || "", // Kosong jika tidak dipilih
        lat: pos.lat,
        lng: pos.lng,
        fotoUrl: fotoUrl || "", // Opsional (atau set null jika tidak ada)
      });

      onSaved?.();
      toast.success("Berhasil menambahkan data pondok!");

      // Reset
      setNamaPengasuh("");
      setNamaMadrasah("");
      setStatus("");
      setFoto(null);
      setFotoPreview(null);
      setPos(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data, periksa koneksi Anda.", { id: "upload" });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="ui-overlay" onClick={onClose}>
      <div className="ui-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drag-handle" />
        <h3 className="ui-title">Tambah Data Pondok</h3>

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Madrasah <span className="text-red-500">*</span></label>
            <input
              placeholder="Contoh: Madrasah Diniyah Al-Falah"
              value={namaMadrasah}
              onChange={(e) => setNamaMadrasah(e.target.value)}
              className="ui-input !mb-0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengasuh <span className="text-red-500">*</span></label>
            <input
              placeholder="Contoh: KH. Ahmad Syafi'i"
              value={namaPengasuh}
              onChange={(e) => setNamaPengasuh(e.target.value)}
              className="ui-input !mb-0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status (Opsional)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ui-select !mb-0"
            >
              <option value="">Pilih Status (Opsional)</option>
              <option value="Ranting">Ranting</option>
              <option value="Non-Ranting">Non-Ranting</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Lokasi (Opsional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFoto(file);
                  setFotoPreview(URL.createObjectURL(file));
                }
              }}
              className="ui-input !mb-0"
            />
          </div>

          {fotoPreview && (
            <div className="mb-4 flex justify-center">
              <img 
                src={fotoPreview} 
                alt="Preview" 
                className="h-32 w-auto rounded-xl border border-gray-200 object-cover shadow-sm"
              />
            </div>
          )}

          <button type="button" onClick={ambilGPS} className={`ui-button-ghost mb-4 ${pos ? 'bg-green-50 border-green-200 text-green-700' : ''}`}>
            <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
            {pos ? "Lokasi GPS Tersimpan ✅" : "Ambil Lokasi GPS Saat Ini"}
          </button>

          <button disabled={loading} className="ui-button-primary">
            {loading ? "Menyimpan Data..." : "Simpan Data Pondok"}
          </button>
        </form>
      </div>
    </div>
  );
}
