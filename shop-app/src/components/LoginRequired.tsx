import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppButton from './AppButton';

export default function LoginRequired() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Vui lòng đăng nhập để sử dụng tính năng này</Text>
      <AppButton title="Đến trang đăng nhập" onPress={() => navigation.navigate('Account')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
});