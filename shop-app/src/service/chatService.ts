import {
  collection, addDoc, query, orderBy, onSnapshot, where,
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage, ChatSummary } from '../types';

type Person = { uid: string; name: string };

export const getChatId = (a: string, b: string) => [a, b].sort().join('_');

// Tạo phòng chat nếu chưa có (cần có trước khi nghe tin nhắn)
export async function ensureChat(chatId: string, me: Person, other: Person) {
  const ref = doc(db, 'chats', chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me.uid, other.uid],
      names: { [me.uid]: me.name, [other.uid]: other.name },
      lastMessage: '',
      updatedAt: serverTimestamp(),
    });
  }
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

export function listenMessages(chatId: string, cb: (msgs: ChatMessage[]) => void) {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage))),
    (e) => console.warn('listenMessages', e.message)
  );
}

// Không dùng orderBy ở server để khỏi phải tạo index, sắp xếp ở client
export function listenChats(uid: string, cb: (chats: ChatSummary[]) => void) {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatSummary));
      list.sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
      cb(list);
    },
    (e) => console.warn('listenChats', e.message)
  );
}