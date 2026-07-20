export default function BottomNav({ onAdd, onGPS }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[990]">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl p-2 flex gap-2">
        <button 
          onClick={onGPS}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-green-700 hover:bg-green-50 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          Lokasi Saya
        </button>

        <button 
          onClick={onAdd}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-600/30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Data
        </button>
      </div>
    </div>
  );
}
