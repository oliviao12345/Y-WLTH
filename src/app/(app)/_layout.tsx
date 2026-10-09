import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/ui';
import { c, font } from '@/theme/tokens';

export default function AppLayout() {
  return (
    <Tabs
      screenListeners={{ tabPress: () => { if (Platform.OS === 'ios') Haptics.selectionAsync(); } }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.teal,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontFamily: font.m, fontSize: 11 },
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(5,9,43,0.96)',
          elevation: 0,
        },
        tabBarBackground: () => (Platform.OS === 'ios' ? <BlurView tint="dark" intensity={60} style={StyleSheet.absoluteFill} /> : null),
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Wealth', tabBarIcon: ({ color }) => <Icon name="home" color={color as string} size={24} /> }} />
      <Tabs.Screen name="insights" options={{ title: 'Intelligence', tabBarIcon: ({ color }) => <Icon name="bolt" color={color as string} size={24} /> }} />
      <Tabs.Screen name="money" options={{ title: 'Money', tabBarIcon: ({ color }) => <Icon name="money" color={color as string} size={24} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ({ color }) => <Icon name="plan" color={color as string} size={24} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="adviser" color={color as string} size={24} /> }} />
      <Tabs.Screen name="asset/[cls]" options={{ href: null }} />
      <Tabs.Screen name="assets" options={{ href: null }} />
      <Tabs.Screen name="liabilities" options={{ href: null }} />
      <Tabs.Screen name="connections" options={{ href: null }} />
      <Tabs.Screen name="forecast" options={{ href: null }} />
    </Tabs>
  );
}
