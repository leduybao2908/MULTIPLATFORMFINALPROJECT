import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { listenSellerOrders, updateOrderStatus } from '../../service/orderService';
import { ORDER_STATUS, STATUS_ORDER } from '../../utils/orderStatus';
import OrderCard from '../../components/OrderCard';
import FilterTabs from '../../components/FilterTabs';
import AppButton from '../../components/AppButton';
import { Order, OrderStatus } from '../../types';

export default function SellerOrdersScreen() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<string>('pending');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !can.manageProduct(role)) return;
    return listenSellerOrders(user.uid, setOrders);
  }, [user?.uid, role]);

  if (!user || !can.manageProduct(role)) return null;

  const tabs = STATUS_ORDER.map((s) => ({
    key: s,
    label: ORDER_STATUS[s].label,
    count: orders.filter((o) => o.status === s).length,
  }));
  const data = orders.filter((o) => o.status === tab);

  const change = async (o: Order, status: OrderStatus) => {
    try {
      setBusy(o.id);
      await updateOrderStatus(o, status, user);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setBusy(null);
    }
  };

  const confirmReject = (o: Order) =>
    Alert.alert('Từ chối đơn hàng', 'Đơn sẽ bị hủy và số lượng được hoàn lại kho.', [
      { text: 'Quay lại', style: 'cancel' },
      { text: 'Từ chối', style: 'destructive', onPress: () => change(o, 'cancelled') },
    ]);

  return (
    <View style={{ flex: 1 }}>
      <FilterTabs tabs={tabs} active={tab} onChange={setTab} />
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Không có đơn nào ở mục này</Text>}
        renderItem={({ item }) => (
          <OrderCard order={item} viewer="seller">
            {item.status === 'pending' && (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppButton title="Đã đi đơn" onPress={() => change(item, 'shipping')} loading={busy === item.id} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton title="Từ chối" variant="outline" onPress={() => confirmReject(item)} disabled={busy === item.id} />
                </View>
              </View>
            )}
            {item.status === 'shipping' && (
              <Text style={styles.wait}>Đang giao, chờ người mua xác nhận đã nhận hàng</Text>
            )}
          </OrderCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 6 },
  wait: { color: '#1d4ed8', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
});