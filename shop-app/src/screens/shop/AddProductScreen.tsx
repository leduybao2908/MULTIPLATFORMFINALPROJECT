import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { addProduct } from '../../service/productService';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';

export default function AddProductScreen({ navigation }: any) {
  const { user, role } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !can.manageProduct(role)) return null;

  const onSubmit = async () => {
    const p = Number(price);
    const s = Number(stock);
    if (!name.trim() || !p || p <= 0 || isNaN(s) || s < 0) {
      return Alert.alert('Thiếu thông tin', 'Nhập tên, giá (> 0) và số lượng hợp lệ');
    }
    try {
      setLoading(true);
      await addProduct({
        sellerId: user.uid,
        sellerName: user.name,
        name: name.trim(),
        description: description.trim(),
        price: p,
        stock: s,
        category: category.trim() || 'Khác',
        images: imageUrl.trim() ? [imageUrl.trim()] : [],
        isActive: true,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <AppInput placeholder="Tên sản phẩm" value={name} onChangeText={setName} />
      <AppInput placeholder="Giá (VNĐ)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <AppInput placeholder="Số lượng tồn kho" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <AppInput placeholder="Danh mục" value={category} onChangeText={setCategory} />
      <AppInput
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      <AppInput placeholder="Link ảnh (tùy chọn)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
      <AppButton title="Đăng sản phẩm" onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}