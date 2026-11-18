import {
  collection, doc, runTransaction, onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { buildNotification } from './notificationService';
import { Order, OrderStatus, Product, UserProfile } from '../types';

type PlaceInput = {
  buyer: UserProfile;
  product: Product;
  qty: number;
  address: string;
  phone: string;
  note: string;
};

export async function placeOrder({ buyer, product, qty, address, phone, note }: PlaceInput) {
  const productRef = doc(db, 'products', product.id);
  const orderRef = doc(collection(db, 'orders'));
  const notifRef = doc(collection(db, 'notifications'));

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(productRef);
    const p = snap.data();
    if (!p || !p.isActive) throw new Error('Sản phẩm không còn được bán');
    if (p.sellerId === buyer.uid) throw new Error('Bạn không thể mua sản phẩm của chính mình');
    if (p.stock < qty) {
      throw new Error(p.stock > 0 ? `Chỉ còn ${p.stock} sản phẩm trong kho` : 'Sản phẩm đã hết hàng');
    }

    tx.update(productRef, { stock: p.stock - qty });
    tx.set(orderRef, {
      buyerId: buyer.uid,
      buyerName: buyer.name,
      sellerId: p.sellerId,
      sellerName: p.sellerName,
      items: [{ productId: product.id, name: p.name, price: p.price, qty }],
      total: p.price * qty,
      status: 'pending',
      address,
      phone,
      note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.set(
      notifRef,
      buildNotification(
        p.sellerId,
        'Có đơn hàng mới',
        `${buyer.name} đặt ${qty} x ${p.name}`,
        'order_seller',
        { fromName: buyer.name, refId: orderRef.id }
      )
    );
  });
}

// Người bán: pending -> shipping | cancelled. Người mua: shipping -> done.
export async function updateOrderStatus(order: Order, status: OrderStatus, actor: UserProfile) {
  const orderRef = doc(db, 'orders', order.id);
  const notifRef = doc(collection(db, 'notifications'));
  const byBuyer = actor.uid === order.buyerId;
  const code = '#' + order.id.slice(-6).toUpperCase();
  const itemName = order.items[0]?.name ?? 'sản phẩm';

  const messages: Record<string, { title: string; body: string }> = {
    shipping: { title: 'Đơn hàng đang được giao', body: `Đơn ${code} (${itemName}) đã được người bán gửi đi.` },
    cancelled: { title: 'Đơn hàng bị từ chối', body: `Người bán đã từ chối đơn ${code} (${itemName}).` },
    done: { title: 'Khách đã nhận hàng', body: `${order.buyerName} xác nhận đã nhận đơn ${code}.` },
  };
  const msg = messages[status];

  await runTransaction(db, async (tx) => {
    // Phải đọc hết trước khi ghi
    const snap = await tx.get(orderRef);
    const cur = snap.data();
    if (!cur) throw new Error('Đơn hàng không tồn tại');

    const valid =
      (cur.status === 'pending' && (status === 'shipping' || status === 'cancelled')) ||
      (cur.status === 'shipping' && status === 'done');
    if (!valid) throw new Error('Đơn hàng đã được cập nhật trước đó, vui lòng thử lại');

    const productSnaps = [];
    if (status === 'cancelled') {
      for (const it of order.items) {
        productSnaps.push({ it, snap: await tx.get(doc(db, 'products', it.productId)) });
      }
    }

    tx.update(orderRef, { status, updatedAt: serverTimestamp() });

    // Từ chối đơn thì hoàn lại kho
    for (const { it, snap: ps } of productSnaps) {
      if (ps.exists()) tx.update(ps.ref, { stock: (ps.data().stock ?? 0) + it.qty });
    }

    tx.set(
      notifRef,
      buildNotification(
        byBuyer ? order.sellerId : order.buyerId,
        msg.title,
        msg.body,
        byBuyer ? 'order_seller' : 'order_buyer',
        { fromName: actor.name, refId: order.id }
      )
    );
  });
}

function listenOrders(
  field: 'buyerId' | 'sellerId', uid: string, cb: (orders: Order[]) => void
) {
  const q = query(collection(db, 'orders'), where(field, '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      list.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? Date.now()) - (a.createdAt?.toMillis?.() ?? Date.now())
      );
      cb(list);
    },
    (e) => console.warn('listenOrders', e.message)
  );
}

export const listenBuyerOrders = (uid: string, cb: (o: Order[]) => void) =>
  listenOrders('buyerId', uid, cb);

export const listenSellerOrders = (uid: string, cb: (o: Order[]) => void) =>
  listenOrders('sellerId', uid, cb);