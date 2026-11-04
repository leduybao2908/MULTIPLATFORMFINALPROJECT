import { Role } from '../types';

export const can = {
  buy: (r: Role) => ['buyer', 'seller', 'admin'].includes(r),
  chat: (r: Role) => r !== 'guest',
  manageProduct: (r: Role) => ['seller', 'admin'].includes(r),
  manageUsers: (r: Role) => r === 'admin',
};