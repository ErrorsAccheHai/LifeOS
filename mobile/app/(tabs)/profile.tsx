import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import ProgressBar from '@/components/ui/ProgressBar';
import ProgressRing from '@/components/ui/ProgressRing';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING, BADGE_RARITY_COLORS } from '@/constants/theme';

const BADGES = [
  { key: 'early_bird', name: 'Early Bird', icon: '🌅', rarity: 'rare', description: '30 Early Wakeups' },
  { key: 'workout_warrior', name: 'Workout Warrior', icon: '💪', rarity: 'epic', description: '100 Workouts' },
  { key: 'hydration_hero', name: 'Hydration Hero', icon: '💧', rarity: 'rare', description: '30 Water Goal Streak' },
  { key: 'study_beast', name: 'Study Beast', icon: '📚', rarity: 'legendary', description: '500 Study Hours' },
];

const SettingRow = ({ icon, label, value, onPress, danger }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: COLORS.border,
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: danger ? 'rgba(239,68,68,0.15)' : COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}
    >
      <Ionicons name={icon} size={18} color={danger ? COLORS.error : COLORS.textSecondary} />
    </View>
    <Text style={{ flex: 1, color: danger ? COLORS.error : COLORS.textPrimary, fontSize: FONT_SIZE.base }}>
      {label}
    </Text>
    {value ? (
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginRight: 8 }}>{value}</Text>
    ) : null}
    <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const levelInfo = user?.levelInfo || { level: 1, progress: 0, currentLevelXP: 0, nextLevelXP: 100, totalXP: 0 };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.backgroundSecondary, COLORS.background]}
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: SPACING.base,
            paddingBottom: 32,
          }}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
            {/* Avatar */}
            <TouchableOpacity style={{ marginBottom: 16 }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  overflow: 'hidden',
                  borderWidth: 3,
                  borderColor: COLORS.primary,
                }}
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ color: '#fff', fontSize: 36, fontWeight: '700' }}>
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.background,
                }}
              >
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' }}>
              {user?.name || 'User'}
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginTop: 4 }}>
              {user?.email}
            </Text>

            {/* Level badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                backgroundColor: 'rgba(99,102,241,0.15)',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>⚡</Text>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                Level {user?.level || 1}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>
                • {(user?.xp || 0).toLocaleString()} XP
              </Text>
            </View>
          </Animated.View>

          {/* Level Progress */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs }}>
                Level {levelInfo.level} → Level {levelInfo.level + 1}
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: '600' }}>
                {levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
              </Text>
            </View>
            <ProgressBar
              progress={levelInfo.progress}
              gradient={GRADIENTS.primary}
              height={8}
            />
          </Animated.View>

          {/* Stats row */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}
          >
            {[
              { label: 'Streak', value: `${user?.currentStreak || 0}d`, emoji: '🔥', color: COLORS.accentRose },
              { label: 'Best', value: `${user?.longestStreak || 0}d`, emoji: '🏆', color: COLORS.accentAmber },
              { label: 'Total XP', value: (user?.totalXPEarned || 0).toLocaleString(), emoji: '⭐', color: COLORS.primary },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: BORDER_RADIUS.lg,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{stat.emoji}</Text>
                <Text style={{ color: stat.color, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                  {stat.value}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>
        </LinearGradient>

        {/* Badges */}
        <View style={{ paddingHorizontal: SPACING.base, marginBottom: 24 }}>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 14 }}>
              Badges 🏅
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {BADGES.map((badge) => (
                <View
                  key={badge.key}
                  style={{
                    alignItems: 'center',
                    marginHorizontal: 6,
                    backgroundColor: COLORS.surface,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: 14,
                    width: 90,
                    borderWidth: 1.5,
                    borderColor: BADGE_RARITY_COLORS[badge.rarity as keyof typeof BADGE_RARITY_COLORS] + '40',
                  }}
                >
                  <Text style={{ fontSize: 30, marginBottom: 8 }}>{badge.icon}</Text>
                  <Text
                    style={{
                      color: BADGE_RARITY_COLORS[badge.rarity as keyof typeof BADGE_RARITY_COLORS],
                      fontSize: 10,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    {badge.rarity}
                  </Text>
                  <Text
                    style={{ color: COLORS.textPrimary, fontSize: 11, fontWeight: '600', textAlign: 'center' }}
                    numberOfLines={2}
                  >
                    {badge.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>

        {/* Body Stats */}
        {(user?.height || user?.currentWeight) && (
          <View style={{ paddingHorizontal: SPACING.base, marginBottom: 24 }}>
            <Animated.View entering={FadeInDown.delay(250).duration(500)}>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 14 }}>
                Body Stats 💪
              </Text>
              <LinearGradient
                colors={['#1E1E3A', '#16163A']}
                style={{
                  borderRadius: BORDER_RADIUS.xl,
                  padding: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}
              >
                {[
                  { label: 'Height', value: user.height ? `${user.height}cm` : '--', icon: '📏' },
                  { label: 'Weight', value: user.currentWeight ? `${user.currentWeight}kg` : '--', icon: '⚖️' },
                  { label: 'Goal', value: user.goalWeight ? `${user.goalWeight}kg` : '--', icon: '🎯' },
                  { label: 'BMI', value: user.bmi ? `${user.bmi}` : '--', icon: '📊' },
                ].map((stat) => (
                  <View key={stat.label} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</Text>
                    <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>{stat.label}</Text>
                  </View>
                ))}
              </LinearGradient>
            </Animated.View>
          </View>
        )}

        {/* Settings */}
        <View style={{ paddingHorizontal: SPACING.base }}>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 4 }}>
              Settings ⚙️
            </Text>
            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.xl,
                padding: 4,
                paddingHorizontal: 16,
              }}
            >
              <SettingRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
              <SettingRow icon="notifications-outline" label="Notifications" value="On" onPress={() => {}} />
              <SettingRow icon="moon-outline" label="Appearance" value="Dark" onPress={() => {}} />
              <SettingRow icon="time-outline" label="Schedule & Goals" onPress={() => {}} />
              <SettingRow icon="shield-outline" label="Privacy" onPress={() => {}} />
              <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
              <SettingRow icon="information-circle-outline" label="About LifeOS" value="v1.0.0" onPress={() => {}} />
            </View>

            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.xl,
                padding: 4,
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
