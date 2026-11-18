import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import CreatePostScreen from '../screens/social/CreatePostScreen';

const Stack = createNativeStackNavigator();

export default function SocialStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator>
<Stack.Screen
  name="SocialFeed"
  component={SocialFeedScreen}
  options={{ title: 'Mạng xã hội', headerStyle: { backgroundColor: '#fff' }, headerTitleStyle: { fontWeight: '700' } }}
/>
      {user && (
        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Tạo bài viết' }} />
      )}
    </Stack.Navigator>
  );
}