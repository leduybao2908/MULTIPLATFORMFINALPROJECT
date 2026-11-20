import React, { useEffect, useState } from 'react';
import { Image, Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';

type Props = { uri: string; onPress: () => void };

const SIDE_MARGIN = 20; // lề ngoài của thẻ bài viết
const CARD_PADDING = 28; // padding trong thẻ
const WIDTH_RATIO = 0.7; // tỉ lệ chiều ngang ảnh so với khung bài
const MAX_IMAGE_WIDTH = 380; // mobile
const MAX_IMAGE_WIDTH_WIDE = 300; // web / màn hình rộng — ảnh nhỏ hơn

export default function PostImage({ uri, onPress }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [ratio, setRatio] = useState(4 / 3); // rộng / cao

  useEffect(() => {
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => {
        if (alive && w > 0 && h > 0) setRatio(w / h);
      },
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [uri]);

  const inner = Math.min(screenW, 600) - SIDE_MARGIN - CARD_PADDING;
  const maxWidth = screenW >= 768 ? MAX_IMAGE_WIDTH_WIDE : MAX_IMAGE_WIDTH;
  const width = Math.min(inner * WIDTH_RATIO, maxWidth);

  // Giới hạn chiều cao để ảnh quá dài/quá bẹt không phá bố cục
  const height = Math.min(Math.max(width / ratio, width * 0.55), width * 1.5);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPress} style={{ width, height }}>
        <Image source={{ uri }} style={styles.img} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', borderRadius: 8 },
});