import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/theme';

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  label: string;
};

const TabIcon = ({ name, focused, color, label }: TabIconProps) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 8 }}>
    <View
      style={{
        width: 40,
        height: 28,
        borderRadius: 14,
        backgroundColor: focused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
      }}
    >
      <Ionicons
        name={focused ? name : (`${name}-outline` as any)}
        size={22}
        color={color}
      />
    </View>
    <Text style={{ color, fontSize: 10, fontWeight: focused ? '600' : '400' }}>
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundSecondary,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="time" focused={focused} color={color} label="Timeline" />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bar-chart" focused={focused} color={color} label="Analytics" />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="checkmark-circle" focused={focused} color={color} label="Habits" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="person" focused={focused} color={color} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}
