import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, Pressable, Image, ActivityIndicator,
  TextInput, StyleSheet, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listenProducts, deleteProduct } from '../../service/productService';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { formatPrice } from '../../utils/format';
import { confirmAction, notify } from '../../utils/dialog';
import AppButton from '../../components/AppButton';
import FilterTabs from '../../components/FilterTabs';
import { Product } from '../../types';

const GAP = 10;
const PAD = 10;

// Bỏ dấu tiếng Việt để tìm kiếm dễ hơn
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

export default function ProductListScreen({ navigation }: any) {
  const { user, role } = useAuth();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const cardW = (width - PAD * 2 - GAP * (columns - 1)) / columns;

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

  const categories = useMemo(() => {
    const count = new Map<string, number>();
    products.forEach((p) => count.set(p.category, (count.get(p.category) ?? 0) + 1));
    return [
      { key: 'all', label: 'Tất cả', count: products.length },
      ...[...count.entries()].map(([key, n]) => ({ key, label: key, count: n })),
    ];
  }, [products]);

  const data = useMemo(() => {
    const q = norm(search.trim());
    return products.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || norm(p.name).includes(q))
    );
  }, [products, search, category]);

  const canEdit = (p: Product) => !!user && (p.sellerId === user.uid || role === 'admin');

  const onDelete = (p: Product) =>
    confirmAction('Xóa sản phẩm', `Xóa "${p.name}"? Không thể hoàn tác.`, 'Xóa', () =>
      deleteProduct(p.id).catch((e) => notify('Không xóa được', e.message))
    );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.screen}>
      {/* Ô tìm kiếm */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm sản phẩm..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {!!search && (
          <Pressable onPress={() => setSearch('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </Pressable>
        )}
      </View>

      {/* Lọc theo danh mục */}
      <FilterTabs tabs={categories} active={category} onChange={setCategory} />

      <FlatList
        key={columns} // đổi số cột thì phải tạo lại danh sách
        data={data}
        numColumns={columns}
        keyExtractor={(p) => p.id}
        columnWrapperStyle={columns > 1 ? { gap: GAP, paddingHorizontal: PAD } : undefined}
        contentContainerStyle={{ paddingTop: GAP, paddingBottom: 24 }}
        ListHeaderComponent={
          can.manageProduct(role) ? (
            <View style={{ paddingHorizontal: PAD }}>
              <AppButton title="+ Thêm sản phẩm" onPress={() => navigation.navigate('AddProduct')} />
              <AppButton
                title="Nhập sản phẩm từ Excel"
                variant="outline"
                onPress={() => navigation.navigate('ImportProducts')}
              />
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color="#bbb" />
            <Text style={styles.empty}>
              {products.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm phù hợp'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const soldOut = item.stock <= 0;
          return (
            <Pressable
              style={[styles.card, { width: cardW }]}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <View style={styles.imgWrap}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.img} resizeMode="cover" />
                ) : (
                  <View style={[styles.img, styles.noImg]}>
                    <Ionicons name="image-outline" size={34} color="#c4c4c4" />
                  </View>
                )}

                {soldOut && (
                  <View style={styles.soldOut}>
                    <Text style={styles.soldOutText}>Hết hàng</Text>
                  </View>
                )}

                {canEdit(item) && (
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionBtn}
                      hitSlop={6}
                      onPress={() => navigation.navigate('AddProduct', { product: item })}
                    >
                      <Ionicons name="create-outline" size={16} color="#2563eb" />
                    </Pressable>
                    <Pressable style={styles.actionBtn} hitSlop={6} onPress={() => onDelete(item)}>
                      <Ionicons name="trash-outline" size={16} color="#e53935" />
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.seller} numberOfLines={1}>{item.sellerName}</Text>
                  {!soldOut && <Text style={styles.stock}>Còn {item.stock}</Text>}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f0f2f5' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', margin: PAD, marginBottom: 0,
    paddingHorizontal: 12, borderRadius: 22, height: 42,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: GAP,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  imgWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f3f4f6' },
  img: { width: '100%', height: '100%' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  soldOut: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(229,57,53,0.9)', paddingVertical: 4, alignItems: 'center',
  },
  soldOutText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  actions: { position: 'absolute', top: 6, right: 6, gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  body: { padding: 10 },
  name: { fontSize: 14, fontWeight: '600', lineHeight: 18, minHeight: 36, color: '#1f2937' },
  price: { color: '#e53935', fontSize: 16, fontWeight: '700', marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, gap: 6 },
  seller: { color: '#888', fontSize: 12, flex: 1 },
  stock: { color: '#15803d', fontSize: 11, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  empty: { color: '#666', marginTop: 8 },
});