import { useState, useEffect } from "react";
import { updatePondok } from "../services/pondok";
import { compressImage } from "../utils/compressImage";
import { uploadToCloudinary } from "../utils/uploadCloudinary";
import { WILAYAH_OPTIONS } from "../utils/constants";
import toast from "react-hot-toast";

export default function EditPondokSheet({ open, pondok, onClose, onSaved }) {
  const [namaPengasuh, setNamaPengasuh] = useState("");
  const [namaMadrasah, setNamaMadrasah] = useState("");
  const [petugas, setPetugas] = useState("");
  const [status, setStatus] = useState("");
  const [wilayah, setWilayah] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [pos, setPos] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing data when modal opens
  useEffect(() => {
    if (pondok && open) {
      setNamaPengasuh(pondok.nama_pengasuh || "");
      setNamaMadrasah(pondok.nama_madrasah || "");
      setPetugas(pondok.petugas || "Panitia Distribusi Undangan"); // Default data lama ke Panitia
      setStatus(pondok.status || "");
      setWilayah(pondok.wilayah || "");
      setPos({ lat: pondok.lat, lng: pondok.lng });
      setFotoPreview(pondok.fotoUrl || null);
    }
  }, [pondok, open]);

  function ambilGPS() {
    if ("vibrate" in navigator) navigator.vibrate(50);
    if (!navigator.geolocation) {
      toast.error("GPS tidak didukung oleh browser Anda");
      return;
    }

    const toastId = toast.loading("Mencari lokasi...", { id: "gpsEdit" });

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });
        if ("vibrate" in navigator) navigator.vibrate([50, 50, 50]);
        toast.success("Lokasi terdeteksi", { id: toastId });
      },
      () => {
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
        toast.error("Gagal ambil lokasi, pastikan GPS aktif", { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit(e) {
    e.preventDefault();

    if (!namaPengasuh || !namaMadrasah || !pos || !petugas) {
      toast.error("Nama Pengasuh, Nama Madrasah, Petugas, dan lokasi (GPS) wajib diisi!", { duration: 4000 });
      return;
    }

    try {
      setLoading(true);
      let finalFotoUrl = pondok.fotoUrl || ""; // Default to existing photo

      // Only upload if a NEW photo was selected
      if (foto) {
        toast.loading("Mengunggah foto baru...", { id: "uploadEdit" });
        const compressed = await compressImage(foto, { maxSize: 1200, quality: 0.7 });
        finalFotoUrl = await uploadToCloudinary(compressed);
        toast.success("Foto baru berhasil diunggah", { id: "uploadEdit" });
      }

      await updatePondok(pondok.id, {
        nama_pengasuh: namaPengasuh.trim(),
        nama_madrasah: namaMadrasah.trim(),
        petugas: petugas,
        status: status || "", 
        wilayah: wilayah || "",
        lat: pos.lat,
        lng: pos.lng,
        fotoUrl: finalFotoUrl, 
      });

      onSaved?.();
      if ("vibrate" in navigator) navigator.vibrate([50, 100, 50]);
      toast.success("Berhasil memperbarui data pondok!");

      // Close and reset
      setFoto(null);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui data, periksa koneksi Anda.", { id: "uploadEdit" });
    } finally {
      setLoading(false);
    }
  }

  if (!open || !pondok) return null;

  return (
    <div className="ui-overlay" onClick={onClose}>
      <div className="ui-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drag-handle" />
        <h3 className="ui-title">Edit Data Pondok</h3>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Identitas Pengisi Data <span className="text-red-500">*</span></label>
            <select
              value={petugas}
              onChange={(e) => {
                setPetugas(e.target.value);
                if (e.target.value === "PJGT atau Guru Tugas") {
                  setStatus("");
                }
              }}
              className="ui-select !mb-0"
            >
              <option value="">Pilih Petugas (Wajib)</option>
              <option value="Panitia Distribusi Undangan">Panitia Distribusi Undangan</option>
              <option value="PJGT atau Guru Tugas">PJGT atau Guru Tugas</option>
            </select>
          </div>

          {/* Tampilkan kolom Status HANYA jika petugas bukan PJGT */}
          {petugas !== "PJGT atau Guru Tugas" && (
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
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah (Opsional)</label>
            <select
              value={wilayah}
              onChange={(e) => setWilayah(e.target.value)}
              className="ui-select !mb-0"
            >
              <option value="">Pilih Wilayah (Opsional)</option>
              {WILAYAH_OPTIONS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Lokasi</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="file-upload-edit"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFoto(file);
                    setFotoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <label 
                htmlFor="file-upload-edit" 
                className="ui-input !mb-0 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors border-dashed border-2"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-gray-600 font-medium">{fotoPreview ? "Ganti Foto Baru" : "Pilih Foto Baru"}</span>
              </label>
            </div>
          </div>

          {fotoPreview && (
            <div className="mb-4 flex justify-center relative">
              <img 
                src={fotoPreview} 
                alt="Preview" 
                className="h-32 w-auto rounded-xl border border-gray-200 object-cover shadow-sm"
              />
              {foto && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-md">
                  Baru
                </span>
              )}
            </div>
          )}

          <button type="button" onClick={ambilGPS} className={`ui-button-ghost mb-4 ${pos ? 'bg-green-50 border-green-200 text-green-700' : ''}`}>
            <svg className="icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
            {pos ? "Lokasi GPS Terisi ✅" : "Perbarui Lokasi GPS Saat Ini"}
          </button>

          <button disabled={loading} className="ui-button-primary">
            {loading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
