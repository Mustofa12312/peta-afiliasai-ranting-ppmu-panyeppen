import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const pondokCol = collection(db, "pondok_pesantren");

export async function fetchPondok() {
  const snap = await getDocs(pondokCol);
  // Hanya kembalikan yang tidak dihapus (soft delete)
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => !p.isDeleted);
}

export async function addPondok(data) {
  return await addDoc(pondokCol, {
    ...data,
    createdAt: Date.now(),
    isDeleted: false,
  });
}

export async function updatePondok(id, data) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

// SOFT DELETE: Tandai isDeleted = true, bukan menghapus dokumennya
export async function deletePondok(id) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await updateDoc(docRef, {
    isDeleted: true,
    deletedAt: Date.now(),
  });
}

// Mengambil data yang ada di keranjang sampah
export async function fetchDeletedPondok() {
  const snap = await getDocs(pondokCol);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.isDeleted === true);
}

// RESTORE: Kembalikan dari keranjang sampah
export async function restoreDeletedPondok(id) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await updateDoc(docRef, {
    isDeleted: false,
    deletedAt: null, // Hapus tanggal hapus
  });
}

// HAPUS PERMANEN
export async function permanentDeletePondok(id) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await deleteDoc(docRef);
}

// Untuk fitur restore backup lama
export async function restorePondok(id, data) {
  const docRef = doc(db, "pondok_pesantren", id);
  const { id: _, ...cleanData } = data;
  return await setDoc(docRef, cleanData);
}
