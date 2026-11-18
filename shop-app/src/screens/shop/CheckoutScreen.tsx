import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { placeOrder } from '../../service/orderService';
import { listenProduct } from '../../service/productService';
import { formatPrice } from '../../utils/format';
import { notify } from '../../utils/dialog';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { Product } from '../../types';

export default function CheckoutScreen({ route, navigation }: any) {
  const initial: Product = route.params.product;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product>(initial);
  const [qty, setQty] = useState(1);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(
    () => listenProduct(initial.id, (p) => p && setProduct(p)),
    [initial.id]
  );

  // Số lượng chọn không được vượt kho
  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(product.stock, 1)));
  }, [product.stock]);

  if (!user) return null;

  const soldOut = product.stock <= 0;
  const change = (d: number) =>
    setQty((q) => Math.min(Math.max(1, q + d), Math.max(product.stock, 1)));

  const onSubmit = async () => {
    setError('');
    if (soldOut) return setError('Sản phẩm đã hết hàng');
    if (phone.trim().length < 9) return setError('Vui lòng nhập số điện thoại hợp lệ');
    if (!address.trim()) return setError('Vui lòng nhập địa chỉ nhận hàng');

    try {
      setLoading(true);
      await placeOrder({
        buyer: user,
        product,
        qty,
        address: address.trim(),
        phone: phone.trim(),
        note: note.trim(),
      });
      navigation.popToTop();
      navigation.navigate('Account', { screen: 'MyOrders' });
      notify('Đặt hàng thành công', 'Đơn hàng đã được gửi tới người bán.');
    } catch (e: any) {
      setError(e.message);
      notify('Không đặt được hàng', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>Người bán: {product.sellerName}</Text>
      <Text style={styles.meta}>
        Đơn giá: {formatPrice(product.price)} · {soldOut ? 'Hết hàng' : `Còn ${product.stock}`}
      </Text>

      <View style={styles.qtyRow}>
        <Text style={styles.label}>Số lượng</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.stepBtn} onPress={() => change(-1)}><Text style={styles.stepText}>−</Text></Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable style={styles.stepBtn} onPress={() => change(1)}><Text style={styles.stepText}>+</Text></Pressable>
        </View>
      </View>

      <AppInput placeholder="Số điện thoại" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppInput placeholder="Địa chỉ nhận hàng" value={address} onChangeText={setAddress} multiline />
      <AppInput placeholder="Ghi chú cho người bán (tùy chọn)" value={note} onChangeText={setNote} />

      <View style={styles.totalRow}>
        <Text style={styles.label}>Tổng thanh toán</Text>
        <Text style={styles.total}>{formatPrice(product.price * qty)}</Text>
      </View>
      <Text style={styles.cod}>Thanh toán khi nhận hàng (COD)</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <AppButton title="Đặt hàng" onPress={onSubmit} loading={loading} disabled={soldOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: '700' },
  meta: { color: '#666', marginTop: 3 },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  label: { fontSize: 16, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, fontWeight: '700' },
  qty: { fontSize: 18, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  total: { color: '#e53935', fontSize: 20, fontWeight: '700' },
  cod: { color: '#666', marginBottom: 8 },
  error: { color: '#b91c1c', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginVertical: 6 },
});