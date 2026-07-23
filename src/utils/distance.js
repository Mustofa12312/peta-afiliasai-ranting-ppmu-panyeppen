/**
 * Menghitung jarak antara 2 titik koordinat bumi (dalam Kilometer)
 * menggunakan rumus Haversine.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Pastikan parameter valid (bisa di-parse ke angka)
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Jari-jari rata-rata bumi dalam kilometer
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}
