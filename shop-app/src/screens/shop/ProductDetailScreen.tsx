import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { formatPrice } from '../../utils/format';
import { confirmAction, notify } from '../../utils/dialog';
import { listenProduct, deleteProduct } from '../../service/productService';
import AppButton from '../../components/AppButton';
import { Product } from '../../types';

export default function ProductDetailScreen({ route, navigation }: any) {
  const initial: Product = route.params.product;
  const { user, role } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [product, setProduct] = useState<Product>(initial);
  const [gone, setGone] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Luôn dùng dữ liệu mới nhất (số lượng, giá...)
  useEffect(
    () =>
      listenProduct(initial.id, (p) => {
        if (p) setProduct(p);
        else setGone(true);
      }),
    [initial.id]
  );

  if (gone) {
    return (
      <View style={styles.center}>
        <Text style={styles.goneText}>Sản phẩm này đã bị xóa.</Text>
        <AppButton title="Quay lại" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isOwner = user?.uid === product.sellerId;
  const canEdit = !!user && (isOwner || role === 'admin');
  const soldOut = product.stock <= 0;

  const openChat = () =>
    navigation.navigate('Chat', {
      screen: 'ChatRoom',
      params: { otherId: product.sellerId, otherName: product.sellerName },
    });

  const shareToSocial = () =>
    navigation.navigate('Social', { screen: 'CreatePost', params: { product }, initial: false });

  const onDelete = () =>
    confirmAction('Xóa sản phẩm', `Xóa "${product.name}"? Không thể hoàn tác.`, 'Xóa', async () => {
      try {
        setDeleting(true);
        await deleteProduct(product.id);
        navigation.goBack();
      } catch (e: any) {
        setDeleting(false);
        notify('Không xóa được', e.message);
      }
    });

  return (
    <ScrollView contentContainerStyle={[styles.content, isWide && styles.contentWide]}>
      {product.images?.[0] && (
        <Image source={{ uri: product.images[0] }} style={[styles.img, isWide && styles.imgWide]} />
      )}
      {product.images?.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.info, { marginTop: 8 }, isWide && styles.infoWide]}
        >
          {product.images.slice(1).map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
        </ScrollView>
      )}
      <View style={[styles.info, isWide && styles.infoWide]}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={[styles.meta, soldOut && { color: '#e53935', fontWeight: '700' }]}>
          {soldOut ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`} · {product.category}
        </Text>
        <Text style={styles.meta}>Người bán: {product.sellerName}</Text>
        <Text style={styles.desc}>{product.description}</Text>
      </View>

      <View style={[{ marginTop: 16 }, isWide && styles.infoWide]}>
        {role === 'guest' && (
          <AppButton
            title="Đăng nhập để mua hàng"
            variant="outline"
            onPress={() => navigation.navigate('Account')}
          />
        )}

        {can.buy(role) && !isOwner && (
          <>
            <AppButton
              title={soldOut ? 'Hết hàng' : 'Mua ngay'}
              disabled={soldOut}
              onPress={() => navigation.navigate('Checkout', { product })}
            />
            {soldOut && (
              <Text style={styles.note}>Sản phẩm đang hết hàng, người bán cần cập nhật số lượng.</Text>
            )}
          </>
        )}

        {isOwner && (
          <Text style={styles.note}>
            Đây là sản phẩm của bạn. Hãy dùng tài khoản người mua khác để thử đặt hàng.
          </Text>
        )}

        {can.chat(role) && !isOwner && (
          <AppButton title="Nhắn tin với người bán" variant="outline" onPress={openChat} />
        )}
        {can.chat(role) && (
          <AppButton title="Chia sẻ lên mạng xã hội" variant="outline" onPress={shareToSocial} />
        )}

        {canEdit && (
          <View style={styles.adminBox}>
            <Text style={styles.adminTitle}>Quản lý sản phẩm</Text>
            <AppButton title="Sửa sản phẩm" onPress={() => navigation.navigate('AddProduct', { product })} />
            <AppButton title="Xóa sản phẩm" variant="danger" onPress={onDelete} loading={deleting} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24 },
  goneText: { textAlign: 'center', fontSize: 16, marginBottom: 12 },
  content: { padding: 16 },
  contentWide: { maxWidth: 720, width: '100%', alignSelf: 'center' },
  img: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#eee' },
  imgWide: { maxWidth: 520, height: 300, alignSelf: 'center' },
  info: {},
  infoWide: { maxWidth: 520, width: '100%', alignSelf: 'center' },
  thumb: { width: 70, height: 70, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  price: { fontSize: 20, color: '#e53935', fontWeight: '700', marginTop: 6 },
  meta: { color: '#666', marginTop: 4 },
  desc: { marginTop: 12, fontSize: 16, lineHeight: 22 },
  note: { color: '#b45309', marginVertical: 6, lineHeight: 20 },
  adminBox: { marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: '#f3f4f6' },
  adminTitle: { fontWeight: '700', marginBottom: 4 },
});