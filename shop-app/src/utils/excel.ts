import * as XLSX from 'xlsx';

export type ImportItem = {
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  image: string;
};

export type ParsedRow = { row: number; data?: ImportItem; error?: string };

const ALIASES: Record<string, string[]> = {
  name: ['ten san pham', 'ten', 'name', 'san pham', 'product'],
  price: ['gia', 'don gia', 'price'],
  stock: ['so luong', 'ton kho', 'stock', 'quantity', 'sl'],
  category: ['danh muc', 'loai', 'category'],
  description: ['mo ta', 'description', 'desc'],
  image: ['link anh', 'anh', 'hinh anh', 'image', 'url anh'],
};

const norm = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

function fieldOf(header: string): string | null {
  for (const [field, names] of Object.entries(ALIASES)) {
    if (names.includes(header)) return field;
  }
  return null;
}

const toNumber = (v: any) => Number(String(v).replace(/[^\d]/g, ''));

export function parseWorkbook(wb: XLSX.WorkBook): ParsedRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

  return rows.map((r, i) => {
    const f: Record<string, any> = {};
    for (const [k, v] of Object.entries(r)) {
      const key = fieldOf(norm(k));
      if (key) f[key] = v;
    }
    const row = i + 2; // dòng 1 là tiêu đề
    const name = String(f.name ?? '').trim();
    const price = toNumber(f.price ?? '');
    const stock = f.stock === '' || f.stock === undefined ? 0 : toNumber(f.stock);

    if (!name) return { row, error: 'Thiếu tên sản phẩm' };
    if (!price || price <= 0) return { row, error: 'Giá không hợp lệ' };
    if (isNaN(stock)) return { row, error: 'Số lượng không hợp lệ' };

    return {
      row,
      data: {
        name,
        price,
        stock,
        category: String(f.category ?? '').trim() || 'Khác',
        description: String(f.description ?? '').trim(),
        image: String(f.image ?? '').trim(),
      },
    };
  });
}