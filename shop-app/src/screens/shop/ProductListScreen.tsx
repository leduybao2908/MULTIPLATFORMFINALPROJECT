import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { listenProducts } from '../../service/productService';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { formatPrice } from '../../utils/format';
import AppButton from '../../components/AppButton';
import { Product } from '../../types';

export default function ProductListScreen({ navigation }: any) {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      listenProducts(
        (list) => {
          setProducts(list);
          setLoading(false);
        },
        () => setLoading(false)
      ),
    []
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={
        can.manageProduct(role) ? (
          <AppButton title="+ Thêm sản phẩm" onPress={() => navigation.navigate('AddProduct')} />
        ) : undefined
      }
      ListEmptyComponent={<Text style={styles.empty}>Chưa có sản phẩm nào</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.img} />
          ) : (
            <View style={[styles.img, styles.noImg]}>
              <Text style={{ color: '#999' }}>No image</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.price)}</Text>
            <Text style={styles.seller}>Bán bởi {item.sellerName}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    padding: 10, marginVertical: 6, gap: 12, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  img: { width: 90, height: 90, borderRadius: 8, backgroundColor: '#eee' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  price: { color: '#e53935', fontSize: 16, fontWeight: '700', marginTop: 4 },
  seller: { color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
});