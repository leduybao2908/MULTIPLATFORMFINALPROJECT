import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '../types';
import { ORDER_STATUS } from '../utils/orderStatus';
import { formatPrice, formatDateTime } from '../utils/format';

type Props = { order: Order; viewer: 'buyer' | 'seller'; children?: React.ReactNode };

export default function OrderCard({ order, viewer, children }: Props) {
  const st = ORDER_STATUS[order.status];
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.code}>#{order.id.slice(-6).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: st.bg }]}>
          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Text style={styles.meta}>{formatDateTime(order.createdAt)}</Text>

      {viewer === 'buyer' ? (
        <Text style={styles.meta}>Người bán: {order.sellerName}</Text>
      ) : (
        <>
          <Text style={styles.meta}>Người mua: {order.buyerName} · {order.phone}</Text>
          <Text style={styles.meta}>Giao tới: {order.address}</Text>
        </>
      )}
      {!!order.note && <Text style={styles.meta}>Ghi chú: {order.note}</Text>}

      <View style={styles.items}>
        {order.items.map((it, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={{ flex: 1 }} numberOfLines={2}>{it.name}</Text>
            <Text style={styles.qty}>x{it.qty}</Text>
            <Text style={styles.price}>{formatPrice(it.price * it.qty)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng tiền (COD)</Text>
        <Text style={styles.total}>{formatPrice(order.total)}</Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 6, elevation: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontWeight: '700', fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  meta: { color: '#666', marginTop: 3 },
  items: { marginTop: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  qty: { color: '#666' },
  price: { fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { color: '#444' },
  total: { color: '#e53935', fontWeight: '700', fontSize: 16 },
});