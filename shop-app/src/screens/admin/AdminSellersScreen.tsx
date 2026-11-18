import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import {
  listenSellerRequests, listenSellers, approveSeller, rejectSeller, revokeSeller,
} from '../../service/userService';
import AppButton from '../../components/AppButton';
import { UserProfile } from '../../types';

type Tab = 'pending' | 'sellers';

export default function AdminSellersScreen() {
  const { role } = useAuth();
  const [tab, setTab] = useState<Tab>('pending');
  const [pending, setPending] = useState<UserProfile[]>([]);
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!can.manageUsers(role)) return;
    const u1 = listenSellerRequests(setPending);
    const u2 = listenSellers(setSellers);
    return () => {
      u1();
      u2();
    };
  }, [role]);

  if (!can.manageUsers(role)) return null;

  const run = async (uid: string, fn: (uid: string) => Promise<void>) => {
    try {
      setBusyId(uid);
      await fn(uid);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmRevoke = (u: UserProfile) =>
    Alert.alert('Thu hồi quyền người bán', `Chuyển ${u.name} về người mua?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Thu hồi', style: 'destructive', onPress: () => run(u.uid, revokeSeller) },
    ]);

  const data = tab === 'pending' ? pending : sellers;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'pending' && styles.tabOn]} onPress={() => setTab('pending')}>
          <Text style={[styles.tabText, tab === 'pending' && styles.tabTextOn]}>
            Chờ duyệt ({pending.length})
          </Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'sellers' && styles.tabOn]} onPress={() => setTab('sellers')}>
          <Text style={[styles.tabText, tab === 'sellers' && styles.tabTextOn]}>
            Người bán ({sellers.length})
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(u) => u.uid}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tab === 'pending' ? 'Không có yêu cầu nào đang chờ' : 'Chưa có người bán nào'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            {tab === 'pending' ? (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title="Duyệt"
                    onPress={() => run(item.uid, approveSeller)}
                    loading={busyId === item.uid}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppButton
                    title="Từ chối"
                    variant="outline"
                    onPress={() => run(item.uid, rejectSeller)}
                    disabled={busyId === item.uid}
                  />
                </View>
              </View>
            ) : (
              <AppButton
                title="Thu hồi quyền"
                variant="danger"
                onPress={() => confirmRevoke(item)}
                loading={busyId === item.uid}
              />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabOn: { borderColor: '#2563eb' },
  tabText: { color: '#666', fontWeight: '600' },
  tabTextOn: { color: '#2563eb' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginVertical: 6, elevation: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  email: { color: '#666', marginTop: 2, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 10 },
  empty: { textAlign: 'center', marginTop: 50, color: '#666' },
});