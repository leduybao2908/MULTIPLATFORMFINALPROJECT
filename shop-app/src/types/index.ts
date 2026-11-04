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
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt?: any;
}