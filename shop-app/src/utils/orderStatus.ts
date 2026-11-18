import { OrderStatus } from '../types';

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Chờ xác nhận', color: '#b45309', bg: '#fef3c7' },
  shipping: { label: 'Đang giao', color: '#1d4ed8', bg: '#dbeafe' },
  done: { label: 'Đã nhận hàng', color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'Đã hủy', color: '#b91c1c', bg: '#fee2e2' },
};

export const STATUS_ORDER: OrderStatus[] = ['pending', 'shipping', 'done', 'cancelled'];