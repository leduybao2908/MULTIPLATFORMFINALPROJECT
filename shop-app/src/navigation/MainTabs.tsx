import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ShopStack from './ShopStack';
import SocialStack from './SocialStack';
import AccountStack from './AccountStack';
import ChatStack from './ChatStack';
import NotificationScreen from '../screens/notifications/Notificationscreen';
import LoginRequired from '../components/LoginRequired';
import { useAuth } from '../context/AuthContext';
import { listenNotifications } from '../service/notificationService';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Shop: 'storefront-outline',
  Social: 'people-outline',
  Chat: 'chatbubbles-outline',
  Notifications: 'notifications-outline',
  Account: 'person-outline',
};

export default function MainTabs() {
  const { user, role } = useAuth();
  const isGuest = role === 'guest';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    return listenNotifications(user.uid, (list) => setUnread(list.filter((n) => !n.isRead).length));
  }, [user?.uid]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Shop" component={ShopStack} options={{ title: 'Mua sắm' }} />
      <Tab.Screen name="Social" component={SocialStack} options={{ title: 'Mạng xã hội' }} />
      <Tab.Screen
        name="Chat"
        component={isGuest ? LoginRequired : ChatStack}
        options={{ title: 'Nhắn tin' }}
      />
      <Tab.Screen
        name="Notifications"
        component={isGuest ? LoginRequired : NotificationScreen}
        options={{
          title: 'Thông báo',
          headerShown: !isGuest,
          tabBarBadge: unread > 0 ? unread : undefined,
        }}
      />
      <Tab.Screen name="Account" component={AccountStack} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
}