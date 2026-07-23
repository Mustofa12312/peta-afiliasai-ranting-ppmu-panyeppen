import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const SETTINGS_DOC_ID = "config";
const settingsRef = doc(db, "app_settings", SETTINGS_DOC_ID);

// Mengambil konfigurasi keamanan saat ini
export async function fetchSecuritySettings() {
  const snap = await getDoc(settingsRef);
  if (snap.exists()) {
    return snap.data();
  } else {
    // Default config jika belum ada di database
    const defaultSettings = { isFormLocked: false, formPin: "123456" };
    await setDoc(settingsRef, defaultSettings);
    return defaultSettings;
  }
}

// Memperbarui konfigurasi keamanan
export async function updateSecuritySettings(data) {
  return await setDoc(settingsRef, data, { merge: true });
}

// Listener realtime (opsional, berguna agar semua pengguna langsung ter-update jika gembok dinyalakan)
export function subscribeToSecuritySettings(callback) {
  return onSnapshot(settingsRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback({ isFormLocked: false, formPin: "123456" });
    }
  });
}
