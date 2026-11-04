import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listenNotifications, markAsRead } from '../../service/notificationService';
import { AppNotification } from '../../types';

export default function NotificationScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    return listenNotifications(user.uid, setItems);
  }, [user?.uid]);

  return (
    <FlatList
      data={items}
      keyExtractor={(n) => n.id}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có thông báo nào</Text>}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => !item.isRead && markAsRead(item.id)}
          style={[styles.row, !item.isRead && styles.unread]}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', backgroundColor: '#fff' },
  unread: { backgroundColor: '#eff6ff' },
  title: { fontWeight: '700', fontSize: 16 },
  body: { color: '#444', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 60, color: '#666' },
});