import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { listenSellerOrders } from '../../service/orderService';
import { formatPrice } from '../../utils/format';
import { Order } from '../../types';

export default function SellerStatsScreen() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user || !can.manageProduct(role)) return;
    return listenSellerOrders(user.uid, setOrders);
  }, [user?.uid, role]);

  const stats = useMemo(() => {
    const sold = orders.filter((o) => o.status === 'shipping' || o.status === 'done');
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    sold.forEach((o) =>
      o.items.forEach((it) => {
        const cur = map.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 };
        cur.qty += it.qty;
        cur.revenue += it.price * it.qty;
        map.set(it.productId, cur);
      })
    );
    const products = [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.qty - a.qty);
    return {
      revenue: sold.reduce((s, o) => s + o.total, 0),
      orderCount: sold.length,
      itemCount: products.reduce((s, p) => s + p.qty, 0),
      pending: orders.filter((o) => o.status === 'pending').length,
      products,
      maxQty: products[0]?.qty ?? 1,
    };
  }, [orders]);

  if (!user || !can.manageProduct(role)) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <View style={styles.grid}>
        <Card label="Doanh thu" value={formatPrice(stats.revenue)} color="#e53935" />
        <Card label="Đơn đã bán" value={String(stats.orderCount)} color="#2563eb" />
        <Card label="Sản phẩm đã bán" value={String(stats.itemCount)} color="#15803d" />
        <Card label="Đơn chờ xử lý" value={String(stats.pending)} color="#b45309" />
      </View>

      <Text style={styles.section}>Mặt hàng đã bán</Text>
      {stats.products.length === 0 ? (
        <Text style={styles.empty}>Chưa bán được mặt hàng nào</Text>
      ) : (
        stats.products.map((p, i) => (
          <View key={p.id} style={styles.item}>
            <View style={styles.itemTop}>
              <Text style={styles.rank}>{i + 1}</Text>
              <Text style={styles.itemName} numberOfLines={2}>{p.name}</Text>
              <Text style={styles.itemQty}>{p.qty} đã bán</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.bar, { width: `${Math.max((p.qty / stats.maxQty) * 100, 4)}%` }]} />
            </View>
            <Text style={styles.revenue}>Doanh thu: {formatPrice(p.revenue)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function Card({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 1 },
  cardLabel: { color: '#666' },
  cardValue: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  empty: { color: '#666', textAlign: 'center', marginTop: 20 },
  item: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rank: { width: 24, fontWeight: '700', color: '#2563eb' },
  itemName: { flex: 1, fontWeight: '600' },
  itemQty: { color: '#444', fontWeight: '600' },
  barBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginTop: 8 },
  bar: { height: 8, backgroundColor: '#2563eb', borderRadius: 4 },
  revenue: { color: '#e53935', marginTop: 6 },
});