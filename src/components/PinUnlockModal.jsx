import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function PinUnlockModal({ open, onClose, expectedPin, onSuccess }) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setPin(["", "", "", "", "", ""]);
      setError(false);
      // Focus first input automatically if possible, otherwise rely on user tap
      setTimeout(() => document.getElementById("pin-0")?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newPin = [...pin];
    // Ambil karakter terakhir jika ngetik banyak (misal paste)
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    // Auto focus to next
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }

    // Check if complete
    if (index === 5 && value !== "") {
      const enteredPin = newPin.join("");
      if (enteredPin === expectedPin) {
        // Berhasil!
        toast.success("PIN Benar! Gembok Terbuka.", { icon: "🔓" });
        onSuccess();
      } else {
        // Gagal
        setError(true);
        toast.error("PIN Salah!", { icon: "🔒" });
        // Reset after short delay
        setTimeout(() => {
          setPin(["", "", "", "", "", ""]);
          document.getElementById("pin-0")?.focus();
          setError(false);
        }, 800);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className={`bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative flex flex-col items-center ${error ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
          {error ? (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          )}
        </div>

        <h2 className="text-2xl font-black text-gray-800 text-center mb-2">Formulir Terkunci</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Masukkan 6 digit PIN akses untuk mengisi data pondok. Hubungi Admin jika Anda belum memiliki PIN.
        </p>

        <div className="flex justify-center gap-2 mb-4 w-full">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none 
                ${error ? 'border-red-500 text-red-500 bg-red-50' : 
                  digit ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'}
              `}
            />
          ))}
        </div>

      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
