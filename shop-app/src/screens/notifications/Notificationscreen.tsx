import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { listenNotifications, markAsRead } from '../../service/notificationService';
import { formatTimeAgo } from '../../utils/format';
import { AppNotification } from '../../types';

const ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  chat: 'chatbubble-ellipses-outline',
  order_seller: 'receipt-outline',
  order_buyer: 'cube-outline',
};

export default function NotificationScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    return listenNotifications(user.uid, setItems);
  }, [user?.uid]);

  const open = (n: AppNotification) => {
    if (!n.isRead) markAsRead(n.id).catch(() => {});
    if (n.type === 'chat' && n.fromId) {
      navigation.navigate('Chat', {
        screen: 'ChatRoom',
        params: { otherId: n.fromId, otherName: n.fromName || 'Người dùng' },
      });
    } else if (n.type === 'order_seller') {
      navigation.navigate('Account', { screen: 'SellerOrders' });
    } else if (n.type === 'order_buyer') {
      navigation.navigate('Account', { screen: 'MyOrders' });
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(n) => n.id}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có thông báo nào</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => open(item)} style={[styles.row, !item.isRead && styles.unread]}>
          <Ionicons name={ICON[item.type] ?? 'notifications-outline'} size={24} color="#2563eb" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
          {!item.isRead && <View style={styles.dot} />}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', backgroundColor: '#fff',
  },
  unread: { backgroundColor: '#eff6ff' },
  title: { fontWeight: '700', fontSize: 15 },
  body: { color: '#444', marginTop: 2 },
  time: { color: '#888', fontSize: 12, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
  empty: { textAlign: 'center', marginTop: 60, color: '#666' },
});