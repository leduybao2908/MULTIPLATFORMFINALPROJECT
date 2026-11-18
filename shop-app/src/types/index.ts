export type Role = 'guest' | 'buyer' | 'seller' | 'admin';
export type SellerStatus = 'none' | 'pending' | 'approved';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Exclude<Role, 'guest'>;
  sellerStatus: SellerStatus;
  isBanned: boolean;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  isActive: boolean;
}

export interface ChatSummary {
  id: string;
  participants: string[];
  names: Record<string, string>;
  lastMessage: string;
  updatedAt?: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  fromId?: string;
  fromName?: string;
  refId?: string;
  title: string;
  body: string;
  type: string; // 'chat' | 'order_seller' | 'order_buyer' | 'seller_approved' | ...
  isRead: boolean;
  createdAt?: any;
}

export type OrderStatus = 'pending' | 'shipping' | 'done' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: string;
  phone: string;
  note: string;
  createdAt?: any;
  updatedAt?: any;
}

// Thông tin sản phẩm lưu kèm bài viết (bản chụp tại thời điểm đăng)
export interface PostProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  imageUrl: string;
  product: PostProduct | null;
  likedBy: string[];
  createdAt?: any;
  editedAt?: any;
}