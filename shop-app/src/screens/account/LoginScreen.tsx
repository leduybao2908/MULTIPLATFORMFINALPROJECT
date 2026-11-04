import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { authErrorMessage } from '../../utils/errors';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu');
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Đăng nhập thất bại', authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng trở lại</Text>
      <AppInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AppInput placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      <AppButton title="Đăng nhập" onPress={onSubmit} loading={loading} />
      <AppButton title="Chưa có tài khoản? Đăng ký" variant="outline" onPress={() => navigation.navigate('Register')} />
      <Text style={styles.hint}>Bạn vẫn có thể xem sản phẩm ở tab Mua sắm mà không cần đăng nhập.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  hint: { marginTop: 16, color: '#666', textAlign: 'center' },
});