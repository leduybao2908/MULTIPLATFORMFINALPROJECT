import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { listenPosts, toggleLike, deletePost } from '../../service/postService';
import { getProduct } from '../../service/productService';
import { confirmAction, notify } from '../../utils/dialog';
import PostCard from '../../components/PostCard';
import Avatar from '../../components/Avatar';
import { Post, PostProduct } from '../../types';

export default function SocialFeedScreen({ navigation }: any) {
  const { user, role } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      listenPosts(
        (list) => {
          setPosts(list);
          setLoading(false);
        },
        (e) => {
          console.warn('listenPosts', e.message);
          setLoading(false);
        }
      ),
    []
  );

  const onLike = async (p: Post) => {
    if (!user) return notify('Cần đăng nhập', 'Hãy đăng nhập để thích bài viết.');
    try {
      await toggleLike(p.id, user.uid, p.likedBy.includes(user.uid));
    } catch (e: any) {
      notify('Lỗi', e.message);
    }
  };

  const onDelete = (p: Post) =>
    confirmAction('Xóa bài viết', 'Bạn chắc chắn muốn xóa bài viết này?', 'Xóa', () =>
      deletePost(p.id).catch((e) => notify('Lỗi', e.message))
    );

  const openProduct = async (pp: PostProduct) => {
    try {
      const product = await getProduct(pp.id);
      if (!product || !product.isActive) {
        return notify('Không tìm thấy', 'Sản phẩm này đã bị xóa hoặc ngừng bán.');
      }
      navigation.navigate('Shop', {
        screen: 'ProductDetail',
        params: { product },
        initial: false,
      });
    } catch (e: any) {
      notify('Lỗi', e.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const Composer = user ? (
    <View style={styles.composer}>
      <View style={styles.composerTop}>
        <Avatar name={user.name} size={42} />
        <Pressable style={styles.pill} onPress={() => navigation.navigate('CreatePost')}>
          <Text style={styles.pillText}>{user.name}, bạn đang nghĩ gì?</Text>
        </Pressable>
      </View>
      <View style={styles.quickRow}>
        <Pressable style={styles.quick} onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="image" size={20} color="#16a34a" />
          <Text style={styles.quickText}>Ảnh</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.quick} onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="pricetag" size={20} color="#2563eb" />
          <Text style={styles.quickText}>Gắn sản phẩm</Text>
        </Pressable>
      </View>
    </View>
  ) : (
    <View style={styles.composer}>
      <Text style={styles.guest}>Đăng nhập ở tab Cá nhân để đăng bài và thích bài viết</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[
          { paddingBottom: 90 },
          isWide && { maxWidth: 720, width: '100%', alignSelf: 'center' },
        ]}
        ListHeaderComponent={Composer}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbox-ellipses-outline" size={52} color="#bbb" />
            <Text style={styles.empty}>Chưa có bài viết nào</Text>
            <Text style={styles.emptySub}>Hãy là người đầu tiên chia sẻ!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAuthor = !!user && item.authorId === user.uid;
          return (
            <PostCard
              post={item}
              uid={user?.uid}
              canEdit={isAuthor}
              canDelete={isAuthor || role === 'admin'}
              onLike={() => onLike(item)}
              onEdit={() => navigation.navigate('CreatePost', { post: item })}
              onDelete={() => onDelete(item)}
              onOpenProduct={openProduct}
            />
          );
        }}
      />

      {user && (
        <Pressable style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    backgroundColor: '#fff', margin: 10, borderRadius: 16, padding: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  composerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
  pillText: { color: '#666' },
  quickRow: { flexDirection: 'row', marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  quick: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  quickText: { fontWeight: '600', color: '#444' },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb' },
  guest: { color: '#666', textAlign: 'center' },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  empty: { marginTop: 10, fontSize: 16, fontWeight: '600', color: '#555' },
  emptySub: { color: '#888', marginTop: 4 },
  fab: {
    position: 'absolute', right: 18, bottom: 22, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});