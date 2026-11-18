import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listenBuyerOrders, updateOrderStatus } from '../../service/orderService';
import { ORDER_STATUS, STATUS_ORDER } from '../../utils/orderStatus';
import OrderCard from '../../components/OrderCard';
import FilterTabs from '../../components/FilterTabs';
import AppButton from '../../components/AppButton';
import { Order } from '../../types';

export default function MyOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState('all');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return listenBuyerOrders(user.uid, setOrders);
  }, [user?.uid]);

  if (!user) return null;

  const tabs = [
    { key: 'all', label: 'Tất cả', count: orders.length },
    ...STATUS_ORDER.map((s) => ({
      key: s,
      label: ORDER_STATUS[s].label,
      count: orders.filter((o) => o.status === s).length,
    })),
  ];
  const data = tab === 'all' ? orders : orders.filter((o) => o.status === tab);

  const received = async (o: Order) => {
    try {
      setBusy(o.id);
      await updateOrderStatus(o, 'done', user);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterTabs tabs={tabs} active={tab} onChange={setTab} />
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn hàng nào</Text>}
        renderItem={({ item }) => (
          <OrderCard order={item} viewer="buyer">
            {item.status === 'shipping' && (
              <AppButton title="Đã nhận hàng" onPress={() => received(item)} loading={busy === item.id} />
            )}
          </OrderCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
});