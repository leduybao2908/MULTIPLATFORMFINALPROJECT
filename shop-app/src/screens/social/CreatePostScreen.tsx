import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ScrollView, View, Text, Modal, FlatList, Pressable, Image, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { listenProducts } from '../../service/productService';
import { createPost, updatePost } from '../../service/postService';
import { pickImages } from '../../service/imageService';
import { formatPrice } from '../../utils/format';
import { notify } from '../../utils/dialog';
import Avatar from '../../components/Avatar';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import { Post, PostProduct, Product } from '../../types';

const toPostProduct = (p: Product): PostProduct => ({
  id: p.id,
  name: p.name,
  price: p.price,
  image: p.images?.[0] ?? '',
});

export default function CreatePostScreen({ navigation, route }: any) {
  const editing: Post | undefined = route.params?.post;
  const { user } = useAuth();

  const [text, setText] = useState(editing?.text ?? '');
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? '');
  const [product, setProduct] = useState<PostProduct | null>(
    editing?.product ?? (route.params?.product ? toPostProduct(route.params.product) : null)
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? 'Sửa bài viết' : 'Tạo bài viết' });
  }, [editing]);

  // Khi mở từ nút "Chia sẻ" ở trang sản phẩm
  useEffect(() => {
    if (!editing && route.params?.product) setProduct(toPostProduct(route.params.product));
  }, [route.params?.product]);

  useEffect(() => listenProducts(setProducts), []);

  if (!user) return null;

  const choosePhoto = async () => {
    try {
      const [uri] = await pickImages(1);
      if (uri) setImageUrl(uri);
    } catch (e: any) {
      notify('Lỗi', e.message);
    }
  };

  const onSubmit = async () => {
    if (!text.trim() && !product && !imageUrl.trim()) {
      return notify('Bài viết trống', 'Hãy nhập nội dung, ảnh hoặc gắn sản phẩm.');
    }
    try {
      setLoading(true);
      if (editing) {
        await updatePost(editing.id, {
          text: text.trim(),
          imageUrl: imageUrl.trim(),
          product,
        });
      } else {
        await createPost({
          authorId: user.uid,
          authorName: user.name,
          authorRole: user.role,
          text: text.trim(),
          imageUrl: imageUrl.trim(),
          product,
          likedBy: [],
        });
      }
      navigation.navigate('SocialFeed');
    } catch (e: any) {
      notify('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#f0f2f5' }}
      contentContainerStyle={{ padding: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.box}>
        <View style={styles.who}>
          <Avatar name={user.name} size={42} />
          <Text style={styles.whoName}>{user.name}</Text>
        </View>

        <AppInput
          placeholder="Bạn đang nghĩ gì?"
          value={text}
          onChangeText={setText}
          multiline
          style={styles.textInput}
        />

        {imageUrl ? (
          <View style={styles.imgWrap}>
            <Image source={{ uri: imageUrl }} style={styles.preview} resizeMode="cover" />
            <Pressable style={styles.imgRemove} onPress={() => setImageUrl('')}>
              <Ionicons name="close" size={18} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <AppButton title="Chọn ảnh từ thư viện" variant="outline" onPress={choosePhoto} />
        )}

        {product ? (
          <View style={styles.selected}>
            {product.image ? (
              <Image source={{ uri: product.image }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, { backgroundColor: '#eee' }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.pName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.pPrice}>{formatPrice(product.price)}</Text>
            </View>
            <Pressable onPress={() => setProduct(null)} hitSlop={10}>
              <Ionicons name="close-circle" size={24} color="#999" />
            </Pressable>
          </View>
        ) : (
          <AppButton title="Gắn link sản phẩm" variant="outline" onPress={() => setPickerOpen(true)} />
        )}
      </View>

      <AppButton title={editing ? 'Lưu thay đổi' : 'Đăng bài'} onPress={onSubmit} loading={loading} />

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={{ flex: 1, paddingTop: 40 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn sản phẩm</Text>
            <Pressable onPress={() => setPickerOpen(false)}>
              <Text style={styles.link}>Đóng</Text>
            </Pressable>
          </View>
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            ListEmptyComponent={<Text style={styles.empty}>Chưa có sản phẩm nào</Text>}
            renderItem={({ item }) => (
              <Pressable
                style={styles.item}
                onPress={() => {
                  setProduct(toPostProduct(item));
                  setPickerOpen(false);
                }}
              >
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, { backgroundColor: '#eee' }]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.pName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.pPrice}>{formatPrice(item.price)}</Text>
                  <Text style={styles.seller}>Bán bởi {item.sellerName}</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  whoName: { fontWeight: '700', fontSize: 16 },
  textInput: { minHeight: 120, textAlignVertical: 'top', borderWidth: 0, backgroundColor: '#f7f8fa' },
  imgWrap: { marginVertical: 6 },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#eee' },
  imgRemove: {
    position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  selected: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginVertical: 6,
    borderRadius: 12, borderWidth: 1, borderColor: '#cfe3ff', backgroundColor: '#f0f7ff',
  },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  pName: { fontWeight: '600', fontSize: 14 },
  pPrice: { color: '#e53935', fontWeight: '700', marginTop: 2 },
  seller: { color: '#666', fontSize: 12, marginTop: 2 },
  link: { color: '#2563eb', fontWeight: '600' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  item: {
    flexDirection: 'row', gap: 10, padding: 12, alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
});