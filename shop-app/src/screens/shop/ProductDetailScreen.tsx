import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { formatPrice } from '../../utils/format';
import AppButton from '../../components/AppButton';
import { Product } from '../../types';

export default function ProductDetailScreen({ route, navigation }: any) {
  const product: Product = route.params.product;
  const { user, role } = useAuth();
  const isOwner = user?.uid === product.sellerId;

  const openChat = () =>
    navigation.navigate('Chat', {
      screen: 'ChatRoom',
      params: { otherId: product.sellerId, otherName: product.sellerName },
    });

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {product.images?.[0] && <Image source={{ uri: product.images[0] }} style={styles.img} />}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
      <Text style={styles.meta}>Còn {product.stock} sản phẩm · {product.category}</Text>
      <Text style={styles.meta}>Người bán: {product.sellerName}</Text>
      <Text style={styles.desc}>{product.description}</Text>

      <View style={{ marginTop: 16 }}>
        {role === 'guest' && (
          <AppButton
            title="Đăng nhập để mua hàng"
            variant="outline"
            onPress={() => navigation.navigate('Account')}
          />
        )}
        {can.chat(role) && !isOwner && (
          <AppButton title="Nhắn tin với người bán" onPress={openChat} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  price: { fontSize: 20, color: '#e53935', fontWeight: '700', marginTop: 6 },
  meta: { color: '#666', marginTop: 4 },
  desc: { marginTop: 12, fontSize: 16, lineHeight: 22 },
});