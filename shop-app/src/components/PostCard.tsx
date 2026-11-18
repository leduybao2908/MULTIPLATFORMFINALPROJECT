import React, { useState } from 'react';
import { View, Text, Image, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { Post, PostProduct } from '../types';
import { formatPrice, formatTimeAgo } from '../utils/format';
import PostImage from './PostImage';

type Props = {
  post: Post;
  uid?: string;
  canEdit: boolean;
  canDelete: boolean;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenProduct: (p: PostProduct) => void;
};

const ROLE_BADGE: Record<string, string> = { seller: 'Người bán', admin: 'Admin' };

export default function PostCard({
  post, uid, canEdit, canDelete, onLike, onEdit, onDelete, onOpenProduct,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [viewer, setViewer] = useState(false);
  const [menu, setMenu] = useState(false);

  const liked = !!uid && post.likedBy.includes(uid);
  const badge = ROLE_BADGE[post.authorRole];
  const longText = post.text.length > 140 || post.text.split('\n').length > 4;
  const hasMenu = canEdit || canDelete;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar name={post.authorName} size={44} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{post.authorName}</Text>
            {badge && (
              <View style={styles.badge}>
                <Ionicons name="storefront" size={10} color="#1d4ed8" />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.time}>
            {formatTimeAgo(post.createdAt)}
            {post.editedAt ? ' · đã chỉnh sửa' : ''}
          </Text>
        </View>
        {hasMenu && (
          <Pressable onPress={() => setMenu(true)} hitSlop={12} style={styles.menuBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#555" />
          </Pressable>
        )}
      </View>

      {!!post.text && (
        <>
          <Text style={styles.text} numberOfLines={expanded ? undefined : 4}>{post.text}</Text>
          {longText && (
            <Pressable onPress={() => setExpanded(!expanded)}>
              <Text style={styles.more}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
            </Pressable>
          )}
        </>
      )}

      {!!post.imageUrl && <PostImage uri={post.imageUrl} onPress={() => setViewer(true)} />}

      {post.product && (
        <Pressable style={styles.productLink} onPress={() => onOpenProduct(post.product!)}>
          {post.product.image ? (
            <Image source={{ uri: post.product.image }} style={styles.productImg} />
          ) : (
            <View style={[styles.productImg, styles.noImg]}>
              <Ionicons name="pricetag-outline" size={22} color="#999" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.productName} numberOfLines={2}>{post.product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(post.product.price)}</Text>
          </View>
          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>Xem</Text>
          </View>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Pressable style={[styles.likeBtn, liked && styles.likeOn]} onPress={onLike} hitSlop={6}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#e11d48' : '#555'} />
          <Text style={[styles.likeText, liked && { color: '#e11d48' }]}>
            {post.likedBy.length > 0 ? post.likedBy.length : 'Thích'}
          </Text>
        </Pressable>
      </View>

      {/* Xem toàn màn hình */}
      <Modal visible={viewer} animationType="fade" onRequestClose={() => setViewer(false)}>
        <View style={styles.viewer}>
          <Image source={{ uri: post.imageUrl }} style={styles.full} resizeMode="contain" />
          <Pressable style={styles.close} onPress={() => setViewer(false)} hitSlop={12}>
            <Ionicons name="close" size={30} color="#fff" />
          </Pressable>
        </View>
      </Modal>

      {/* Menu Sửa / Xóa */}
      <Modal visible={menu} transparent animationType="fade" onRequestClose={() => setMenu(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenu(false)}>
          <View style={styles.sheet}>
            {canEdit && (
              <Pressable
                style={styles.sheetItem}
                onPress={() => { setMenu(false); onEdit(); }}
              >
                <Ionicons name="create-outline" size={22} color="#2563eb" />
                <Text style={styles.sheetText}>Sửa bài viết</Text>
              </Pressable>
            )}
            {canDelete && (
              <Pressable
                style={styles.sheetItem}
                onPress={() => { setMenu(false); onDelete(); }}
              >
                <Ionicons name="trash-outline" size={22} color="#e53935" />
                <Text style={[styles.sheetText, { color: '#e53935' }]}>Xóa bài viết</Text>
              </Pressable>
            )}
            <Pressable style={[styles.sheetItem, { justifyContent: 'center' }]} onPress={() => setMenu(false)}>
              <Text style={[styles.sheetText, { color: '#666' }]}>Đóng</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginHorizontal: 10, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontWeight: '700', fontSize: 15, flexShrink: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#dbeafe', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { color: '#1d4ed8', fontSize: 11, fontWeight: '600' },
  time: { color: '#888', fontSize: 12, marginTop: 1 },
  menuBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 15, lineHeight: 22, color: '#1f2937' },
  more: { color: '#2563eb', fontWeight: '600', marginTop: 2 },
  frame: { height: 240, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee', marginTop: 10 },
  image: { width: '100%', height: '100%' },
  hint: {
    position: 'absolute', right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12,
  },
  hintText: { color: '#fff', fontSize: 12 },
  productLink: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginTop: 10,
    borderRadius: 12, backgroundColor: '#f0f7ff', borderWidth: 1, borderColor: '#cfe3ff',
  },
  productImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#eee' },
  noImg: { alignItems: 'center', justifyContent: 'center' },
  productName: { fontWeight: '600', fontSize: 14 },
  productPrice: { color: '#e53935', fontWeight: '700', marginTop: 3 },
  viewBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  footer: { flexDirection: 'row', marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6' },
  likeOn: { backgroundColor: '#ffe4e6' },
  likeText: { color: '#555', fontWeight: '600' },
  viewer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  full: { width: '100%', height: '100%' },
  close: { position: 'absolute', top: 44, right: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 12, paddingBottom: 28 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  sheetText: { fontSize: 16, fontWeight: '600' },
});