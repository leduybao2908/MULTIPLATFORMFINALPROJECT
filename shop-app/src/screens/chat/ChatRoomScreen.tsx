import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ensureChat, getChatId, listenMessages, sendMessage } from '../../service/chatService';
import { ChatMessage } from '../../types';

export default function ChatRoomScreen({ route }: any) {
  const { otherId, otherName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const chatId = user ? getChatId(user.uid, otherId) : '';

  useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    ensureChat(chatId, { uid: user.uid, name: user.name }, { uid: otherId, name: otherName })
      .then(() => {
        if (!cancelled) unsub = listenMessages(chatId, setMessages);
      })
      .catch((e) => console.warn('ensureChat', e.message));

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [chatId]);

  if (!user) return null;

  const onSend = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    try {
      await sendMessage(chatId, user.uid, t);
    } catch (e: any) {
      console.warn('sendMessage', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const mine = item.senderId === user.uid;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={{ color: mine ? '#fff' : '#111' }}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
        />
        <Pressable onPress={onSend} style={styles.send}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '78%', padding: 10, borderRadius: 14, marginVertical: 3 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
});