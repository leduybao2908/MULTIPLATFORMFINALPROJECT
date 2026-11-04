import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { listenChats } from '../../service/chatService';
import { ChatSummary } from '../../types';

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);

  useEffect(() => {
    if (!user) return;
    return listenChats(user.uid, setChats);
  }, [user?.uid]);

  if (!user) return null;
  const visible = chats.filter((c) => c.lastMessage);

  return (
    <FlatList
      data={visible}
      keyExtractor={(c) => c.id}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Chưa có cuộc trò chuyện nào.{'\n'}Vào trang sản phẩm và bấm "Nhắn tin với người bán".
        </Text>
      }
      renderItem={({ item }) => {
        const otherId = item.participants.find((p) => p !== user.uid)!;
        const otherName = item.names?.[otherId] ?? 'Người dùng';
        return (
          <Pressable style={styles.row} onPress={() => navigation.navigate('ChatRoom', { otherId, otherName })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{otherName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{otherName}</Text>
              <Text numberOfLines={1} style={styles.last}>{item.lastMessage}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 14, gap: 12, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { fontWeight: '600', fontSize: 16 },
  last: { color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 60, color: '#666', lineHeight: 22 },
});