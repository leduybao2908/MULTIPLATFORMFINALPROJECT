import React from 'react';
import { ScrollView, Pressable, Text, View, Image, StyleSheet } from 'react-native';

type Tab = { key: string; label: string; count?: number; image?: string | null };

export default function FilterTabs({
  tabs, active, onChange,
}: { tabs: Tab[]; active: string; onChange: (key: string) => void }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 8, gap: 8 }}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.chip, active === t.key && styles.chipOn]}
          >
            {t.image ? (
              <Image source={{ uri: t.image }} style={styles.thumb} resizeMode="cover" />
            ) : null}
            <Text style={[styles.text, active === t.key && styles.textOn]}>
              {t.label}
              {t.count !== undefined ? ` (${t.count})` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd', flexGrow: 0 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 5, paddingRight: 10, paddingVertical: 5, borderRadius: 18, backgroundColor: '#f3f4f6' },
  chipOn: { backgroundColor: '#2563eb' },
  thumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#e5e7eb' },
  text: { color: '#444', fontWeight: '600' },
  textOn: { color: '#fff' },
});