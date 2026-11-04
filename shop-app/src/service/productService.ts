import {
  collection, addDoc, onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

export function listenProducts(
  cb: (products: Product[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(collection(db, 'products'), where('isActive', '==', true));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs.map((d) => {
          const { createdAt, ...rest } = d.data(); // bỏ Timestamp để truyền qua navigation
          return { id: d.id, ...rest } as Product;
        })
      ),
    onError
  );
}

export async function addProduct(data: Omit<Product, 'id'>) {
  await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
}