import {
  collection, query, where, onSnapshot, doc, updateDoc, addDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AppNotification } from '../types';

type Extra = { fromName?: string; refId?: string };

export function buildNotification(
  userId: string, title: string, body: string, type: string, extra: Extra = {}
) {
  return {
    userId,
    fromId: auth.currentUser?.uid ?? '',
    fromName: extra.fromName ?? '',
    refId: extra.refId ?? '',
    title,
    body,
    type,
    isRead: false,
    createdAt: serverTimestamp(),
  };
}

export const sendNotification = (
  userId: string, title: string, body: string, type: string, extra: Extra = {}
) => addDoc(collection(db, 'notifications'), buildNotification(userId, title, body, type, extra));

// Ghi đè theo id cố định: mỗi cuộc trò chuyện chỉ có 1 thông báo, luôn là tin mới nhất
export const upsertNotification = (
  id: string, userId: string, title: string, body: string, type: string, extra: Extra = {}
) => setDoc(doc(db, 'notifications', id), buildNotification(userId, title, body, type, extra));

export function listenNotifications(uid: string, cb: (list: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      list.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())
      );
      cb(list);
    },
    (e) => console.warn('listenNotifications', e.message)
  );
}

export const markAsRead = (id: string) => updateDoc(doc(db, 'notifications', id), { isRead: true });