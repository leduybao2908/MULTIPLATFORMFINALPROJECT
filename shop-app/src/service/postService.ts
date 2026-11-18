import {
  collection, addDoc, query, orderBy, limit, onSnapshot,
  doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, PostProduct } from '../types';

export function listenPosts(cb: (posts: Post[]) => void, onError?: (e: Error) => void) {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snap) =>
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          likedBy: d.data().likedBy ?? [],
        } as Post))
      ),
    onError
  );
}

export async function createPost(data: Omit<Post, 'id' | 'createdAt' | 'editedAt'>) {
  await addDoc(collection(db, 'posts'), { ...data, createdAt: serverTimestamp() });
}

export const updatePost = (
  postId: string,
  data: { text: string; imageUrl: string; product: PostProduct | null }
) => updateDoc(doc(db, 'posts', postId), { ...data, editedAt: serverTimestamp() });

export const toggleLike = (postId: string, uid: string, liked: boolean) =>
  updateDoc(doc(db, 'posts', postId), {
    likedBy: liked ? arrayRemove(uid) : arrayUnion(uid),
  });

export const deletePost = (postId: string) => deleteDoc(doc(db, 'posts', postId));