import React, { useLayoutEffect, useState } from 'react';
import { ScrollView, View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { addProduct, updateProduct } from '../../service/productService';
import { pickImages } from '../../service/imageService';
import { notify } from '../../utils/dialog';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { Product } from '../../types';

const MAX_IMAGES = 3;

export default function AddProductScreen({ navigation, route }: any) {
  const editing: Product | undefined = route.params?.product;
  const { user, role } = useAuth();

  const [name, setName] = useState(editing?.name ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [stock, setStock] = useState(editing ? String(editing.stock) : '');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>(editing?.images ?? []);
  const [picking, setPicking] = useState(false);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm' });
  }, [editing]);

  if (!user || !can.manageProduct(role)) return null;

  const addFromLibrary = async () => {
    const left = MAX_IMAGES - images.length;
    if (left <= 0) return notify('Đã đủ ảnh', `Tối đa ${MAX_IMAGES} ảnh cho mỗi sản phẩm`);
    try {
      setPicking(true);
      const picked = await pickImages(left);
      setImages((prev) => [...prev, ...picked]);
    } catch (e: any) {
      notify('Lỗi', e.message);
    } finally {
      setPicking(false);
    }
  };

  const onSubmit = async () => {
    const p = Number(price);
    const s = Number(stock);
    if (!name.trim() || !p || p <= 0 || stock.trim() === '' || isNaN(s) || s < 0) {
      return notify('Thiếu thông tin', 'Nhập tên, giá (> 0) và số lượng hợp lệ');
    }
    const all = imageUrl.trim() ? [...images, imageUrl.trim()] : images;
    if (all.join('').length > 850_000) {
      return notify('Ảnh quá nặng', 'Hãy bỏ bớt ảnh hoặc chọn ảnh khác.');
    }
    try {
      setLoading(true);
      const common = {
        name: name.trim(),
        description: description.trim(),
        price: p,
        stock: Math.floor(s),
        category: category.trim() || 'Khác',
        images: all,
      };
      if (editing) {
        await updateProduct(editing.id, common);
      } else {
        await addProduct({
          ...common,
          sellerId: user.uid,
          sellerName: user.name,
          isActive: true,
        });
      }
      navigation.goBack();
    } catch (e: any) {
      notify('Lỗi', e.message);
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

      <Text style={styles.label}>Ảnh sản phẩm ({images.length}/{MAX_IMAGES})</Text>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
          {images.map((uri, i) => (
            <View key={i} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable style={styles.remove} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
      <AppButton title="Chọn ảnh từ thư viện" variant="outline" onPress={addFromLibrary} loading={picking} />
      <AppInput placeholder="Hoặc dán link ảnh (tùy chọn)" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />

      <AppButton title={editing ? 'Lưu thay đổi' : 'Đăng sản phẩm'} onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', marginTop: 8 },
  thumbWrap: { marginRight: 10 },
  thumb: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  remove: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#e53935', alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#fff', fontWeight: '700', lineHeight: 18 },
});