import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProductListScreen from '../screens/shop/ProductListScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import AddProductScreen from '../screens/shop/AddProductScreen';

const Stack = createNativeStackNavigator();

export default function ShopStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Mua sắm' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết' }} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Thêm sản phẩm' }} />
    </Stack.Navigator>
  );
}