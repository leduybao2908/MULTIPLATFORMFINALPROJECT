import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';
import { sendNotification } from './notificationService';

function listenUsers(q: ReturnType<typeof query>, cb: (users: UserProfile[]) => void) {
  return onSnapshot(
    q,
    (snap) =>
      cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile))),
    (e) => console.warn('listenUsers', e.message)
  );
}

// Người dùng đang xin làm người bán
export const listenSellerRequests = (cb: (u: UserProfile[]) => void) =>
  listenUsers(query(collection(db, 'users'), where('sellerStatus', '==', 'pending')), cb);

// Danh sách người bán hiện có
export const listenSellers = (cb: (u: UserProfile[]) => void) =>
  listenUsers(query(collection(db, 'users'), where('role', '==', 'seller')), cb);

export async function approveSeller(uid: string) {
  await updateDoc(doc(db, 'users', uid), { role: 'seller', sellerStatus: 'approved' });
  try {
    await sendNotification(
      uid,
      'Yêu cầu làm người bán đã được duyệt',
      'Chúc mừng! Bạn đã có thể đăng sản phẩm ở tab Mua sắm.',
      'seller_approved'
    );
  } catch (e: any) {
    console.warn('sendNotification', e.message);
  }
}

export async function rejectSeller(uid: string) {
  await updateDoc(doc(db, 'users', uid), { sellerStatus: 'none' });
  try {
    await sendNotification(
      uid,
      'Yêu cầu làm người bán bị từ chối',
      'Quản trị viên chưa duyệt yêu cầu của bạn. Bạn có thể gửi lại sau.',
      'seller_rejected'
    );
  } catch (e: any) {
    console.warn('sendNotification', e.message);
  }
}

export const revokeSeller = (uid: string) =>
  updateDoc(doc(db, 'users', uid), { role: 'buyer', sellerStatus: 'none' });