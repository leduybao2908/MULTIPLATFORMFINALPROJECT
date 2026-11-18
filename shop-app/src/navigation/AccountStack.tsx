import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { can } from '../utils/permissions';
import LoginScreen from '../screens/account/LoginScreen';
import RegisterScreen from '../screens/account/RegisterScreen';
import ProfileScreen from '../screens/account/ProfileScreen';
import AdminSellersScreen from '../screens/admin/AdminSellersScreen';
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import SellerOrdersScreen from '../screens/orders/SellerOrdersScreen';
import SellerStatsScreen from '../screens/orders/SellerStatsScreen';

const Stack = createNativeStackNavigator();

export default function AccountStack() {
  const { user, role } = useAuth();
  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
          <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: 'Đơn mua của tôi' }} />
          {can.manageProduct(role) && (
            <>
              <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} options={{ title: 'Đơn bán' }} />
              <Stack.Screen name="SellerStats" component={SellerStatsScreen} options={{ title: 'Thống kê bán hàng' }} />
            </>
          )}
          {role === 'admin' && (
            <Stack.Screen name="AdminSellers" component={AdminSellersScreen} options={{ title: 'Duyệt người bán' }} />
          )}
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
        </>
      )}
    </Stack.Navigator>
  );
}