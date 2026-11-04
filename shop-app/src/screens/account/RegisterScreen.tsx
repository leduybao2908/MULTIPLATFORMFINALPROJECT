import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { authErrorMessage } from '../../utils/errors';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường');
    }
    if (password !== confirm) {
      return Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp');
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      Alert.alert('Đăng ký thất bại', authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>
      <AppInput placeholder="Họ và tên" value={name} onChangeText={setName} />
      <AppInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AppInput placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={password} onChangeText={setPassword} secureTextEntry />
      <AppInput placeholder="Nhập lại mật khẩu" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <AppButton title="Đăng ký" onPress={onSubmit} loading={loading} />
      <AppButton title="Đã có tài khoản? Đăng nhập" variant="outline" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
});