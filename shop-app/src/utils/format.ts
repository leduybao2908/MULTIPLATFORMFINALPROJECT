export const formatPrice = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₫';

export function formatTimeAgo(ts: any): string {
  const ms = ts?.toMillis?.();
  if (!ms) return 'Vừa xong';
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return 'Vừa xong';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return new Date(ms).toLocaleDateString('vi-VN');
}

export function formatDateTime(ts: any): string {
  const ms = ts?.toMillis?.();
  if (!ms) return 'Vừa xong';
  return new Date(ms).toLocaleString('vi-VN');
}