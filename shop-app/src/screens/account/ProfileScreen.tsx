import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../service/firebase';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/AppButton';

const ROLE_LABEL: Record<string, string> = {
  buyer: 'Người mua',
  seller: 'Người bán',
  admin: 'Quản trị viên',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  if (!user) return null;

  const requestSeller = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), { sellerStatus: 'pending' });
      Alert.alert('Đã gửi yêu cầu', 'Vui lòng chờ quản trị viên duyệt.');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>Vai trò: {ROLE_LABEL[user.role]}</Text>

      {user.role === 'buyer' && user.sellerStatus === 'none' && (
        <AppButton title="Đăng ký làm người bán" variant="outline" onPress={requestSeller} loading={loading} />
      )}
      {user.role === 'buyer' && user.sellerStatus === 'pending' && (
        <Text style={styles.pending}>Yêu cầu làm người bán đang chờ duyệt</Text>
      )}

      <View style={{ marginTop: 24 }}>
        <AppButton title="Đăng xuất" variant="danger" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'stretch' },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#2563eb',
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  email: { color: '#666', textAlign: 'center', marginTop: 2 },
  role: { textAlign: 'center', marginVertical: 12, fontSize: 16 },
  pending: { textAlign: 'center', color: '#b45309', marginTop: 8 },
});