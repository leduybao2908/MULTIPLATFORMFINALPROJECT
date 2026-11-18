import React, { useState } from 'react';
import { ScrollView, View, Text, Platform, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../utils/permissions';
import { addProductsBatch } from '../../service/productService';
import { parseWorkbook, ParsedRow } from '../../utils/excel';
import { formatPrice } from '../../utils/format';
import AppButton from '../../components/AppButton';

export default function ImportProductsScreen({ navigation }: any) {
  const { user, role } = useAuth();
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || !can.manageProduct(role)) return null;

  const valid = rows.filter((r) => r.data);
  const invalid = rows.filter((r) => r.error);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (res.canceled) return;
    const asset = res.assets[0];
    try {
      setReading(true);
      let wb: XLSX.WorkBook;
      if (Platform.OS === 'web') {
        const buf = await (asset.file as any).arrayBuffer();
        wb = XLSX.read(buf, { type: 'array' });
      } else {
        const { File: FsFile } = await import('expo-file-system');
        const b64 = await new FsFile(asset.uri).base64();
        wb = XLSX.read(b64, { type: 'base64' });
      }
      const parsed = parseWorkbook(wb);
      setFileName(asset.name);
      setRows(parsed);
      if (parsed.length === 0) Alert.alert('File trống', 'Không tìm thấy dòng dữ liệu nào.');
    } catch (e: any) {
      Alert.alert('Không đọc được file', e.message);
    } finally {
      setReading(false);
    }
  };

  const doImport = async () => {
    try {
      setSaving(true);
      await addProductsBatch(
        valid.map(({ data: d }) => ({
          sellerId: user.uid,
          sellerName: user.name,
          name: d!.name,
          description: d!.description,
          price: d!.price,
          stock: d!.stock,
          category: d!.category,
          images: d!.image ? [d!.image] : [],
          isActive: true,
        }))
      );
      Alert.alert('Thành công', `Đã nhập ${valid.length} sản phẩm.`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>Định dạng file (.xlsx, .xls, .csv)</Text>
        <Text style={styles.guideText}>Dòng 1 là tiêu đề, các cột như sau:</Text>
        <Text style={styles.code}>Tên sản phẩm | Giá | Số lượng | Danh mục | Mô tả | Link ảnh</Text>
        <Text style={styles.guideText}>Bắt buộc: Tên sản phẩm, Giá. Link ảnh là đường dẫn http (tùy chọn).</Text>
      </View>

      <AppButton title="Chọn file Excel" variant="outline" onPress={pickFile} loading={reading} />

      {!!fileName && (
        <View style={{ marginTop: 10 }}>
          <Text style={styles.file}>{fileName}</Text>
          <Text style={styles.ok}>Hợp lệ: {valid.length} dòng</Text>
          {invalid.length > 0 && <Text style={styles.bad}>Lỗi: {invalid.length} dòng (sẽ bị bỏ qua)</Text>}

          {invalid.slice(0, 5).map((r) => (
            <Text key={r.row} style={styles.errRow}>Dòng {r.row}: {r.error}</Text>
          ))}

          {valid.slice(0, 5).map((r) => (
            <View key={r.row} style={styles.preview}>
              <Text style={{ fontWeight: '600' }} numberOfLines={1}>{r.data!.name}</Text>
              <Text style={styles.meta}>
                {formatPrice(r.data!.price)} · SL {r.data!.stock} · {r.data!.category}
              </Text>
            </View>
          ))}
          {valid.length > 5 && <Text style={styles.meta}>… và {valid.length - 5} sản phẩm khác</Text>}

          <AppButton
            title={`Nhập ${valid.length} sản phẩm`}
            onPress={doImport}
            loading={saving}
            disabled={valid.length === 0}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  guide: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 10 },
  guideTitle: { fontWeight: '700', marginBottom: 4 },
  guideText: { color: '#444', marginTop: 2 },
  code: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', backgroundColor: '#fff', padding: 6, marginVertical: 6, borderRadius: 6 },
  file: { fontWeight: '700', marginBottom: 4 },
  ok: { color: '#15803d', fontWeight: '600' },
  bad: { color: '#b91c1c', fontWeight: '600', marginTop: 2 },
  errRow: { color: '#b91c1c', marginTop: 2 },
  preview: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 6 },
  meta: { color: '#666', marginTop: 2 },
});