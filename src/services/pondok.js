import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const pondokCol = collection(db, "pondok_pesantren");

export async function fetchPondok() {
  const snap = await getDocs(pondokCol);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addPondok(data) {
  return await addDoc(pondokCol, {
    ...data,
    createdAt: Date.now(),
  });
}

export async function updatePondok(id, data) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
}

export async function deletePondok(id) {
  const docRef = doc(db, "pondok_pesantren", id);
  return await deleteDoc(docRef);
}
