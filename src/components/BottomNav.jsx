export default function BottomNav({ onAdd, onGPS }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[990] w-full max-w-sm px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-1.5 flex gap-2 w-full transition-all">
        <button 
          onClick={onGPS}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[#0000fe] hover:bg-gray-50 transition-all font-medium group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#0000fe]/0 group-hover:bg-[#0000fe]/10 transition-colors"></div>
          <svg className="w-5 h-5 relative z-10 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-[10px] font-bold relative z-10">Lokasi Saya</span>
        </button>

        <button 
          onClick={onAdd}
          className="flex-[1.5] flex items-center justify-center gap-2 bg-[#0000fe] text-white py-2.5 px-4 rounded-xl hover:bg-[#0000d0] transition-all font-bold text-sm shadow-lg shadow-[#0000fe]/30 hover:shadow-[#0000fe]/50 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Data
        </button>
      </div>
    </div>
  );
}
