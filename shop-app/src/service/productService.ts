import {
  collection, addDoc, onSnapshot, query, where, serverTimestamp,
  doc, getDoc, writeBatch, updateDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

// Bỏ các Timestamp để truyền qua navigation không bị cảnh báo
const clean = (id: string, data: any) => {
  const { createdAt, updatedAt, ...rest } = data;
  return { id, ...rest } as Product;
};

export function listenProducts(
  cb: (products: Product[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(collection(db, 'products'), where('isActive', '==', true));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => clean(d.id, d.data()))), onError);
}

// Nghe realtime một sản phẩm (null nếu đã bị xóa)
export function listenProduct(id: string, cb: (p: Product | null) => void) {
  return onSnapshot(
    doc(db, 'products', id),
    (snap) => cb(snap.exists() ? clean(snap.id, snap.data()) : null),
    (e) => console.warn('listenProduct', e.message)
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? clean(snap.id, snap.data()) : null;
}

export async function addProduct(data: Omit<Product, 'id'>) {
  await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
}

export type ProductEdit = Pick<
  Product, 'name' | 'description' | 'price' | 'stock' | 'category' | 'images'
>;

export const updateProduct = (id: string, data: ProductEdit) =>
  updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });

export const deleteProduct = (id: string) => deleteDoc(doc(db, 'products', id));

export async function addProductsBatch(items: Omit<Product, 'id'>[]) {
  for (let i = 0; i < items.length; i += 400) {
    const batch = writeBatch(db);
    items.slice(i, i + 400).forEach((p) => {
      batch.set(doc(collection(db, 'products')), { ...p, createdAt: serverTimestamp() });
    });
    await batch.commit();
  }
}