import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AppNotification } from '../types';

export function listenNotifications(uid: string, cb: (list: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      cb(list);
    },
    (e) => console.warn('listenNotifications', e.message)
  );
}

export const markAsRead = (id: string) => updateDoc(doc(db, 'notifications', id), { isRead: true });