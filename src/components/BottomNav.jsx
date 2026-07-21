export default function BottomNav({ onAdd, onGPS }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[990] w-full max-w-sm px-4">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-green-900/10 rounded-3xl p-2 flex gap-2 w-full transition-all">
        <button 
          onClick={onGPS}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-2xl text-green-700 hover:bg-white/80 transition-all font-medium group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-green-100/0 group-hover:bg-green-100/50 transition-colors"></div>
          <svg className="w-6 h-6 relative z-10 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[11px] font-bold relative z-10">Lokasi Saya</span>
        </button>

        <button 
          onClick={onAdd}
          className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Data
        </button>
      </div>
    </div>
  );
}
