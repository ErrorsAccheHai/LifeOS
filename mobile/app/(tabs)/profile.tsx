import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';

function SettingRow({
  icon, label, value, onPress, danger, iconBg, showArrow = true,
}: {
  icon: string; label: string; value?: string; onPress: () => void;
  danger?: boolean; iconBg?: string; showArrow?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={[styles.settingRow, { transform: [{ scale }], borderBottomColor: colors.border }]}>
        <View style={[
          styles.settingIcon,
          { backgroundColor: danger ? 'rgba(239,68,68,0.12)' : (iconBg || colors.surfaceLight) },
        ]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={danger ? '#EF4444' : colors.textSecondary}
          />
        </View>
        <Text style={[styles.settingLabel, { color: danger ? '#EF4444' : colors.textPrimary }]}>
          {label}
        </Text>
        {value && <Text style={[styles.settingValue, { color: colors.textMuted }]}>{value}</Text>}
        {showArrow && (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function StatBox({ emoji, value, label, color }: { emoji: string; value: string; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const lv = user?.levelInfo || { level: 1, progress: 0, currentLevelXP: 0, nextLevelXP: 100 };
  const avatarInitial = (user?.name || 'U').charAt(0).toUpperCase();

  const BADGES_STATIC = [
    { key: 'early_bird', name: 'Early Bird', icon: '🌅', rarity: 'rare', color: '#3B82F6' },
    { key: 'workout', name: 'Workout Warrior', icon: '💪', rarity: 'epic', color: '#8B5CF6' },
    { key: 'hydration', name: 'Hydration Hero', icon: '💧', rarity: 'rare', color: '#3B82F6' },
    { key: 'study', name: 'Study Beast', icon: '📚', rarity: 'legendary', color: '#F59E0B' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={isDark ? ['#1A1A2E', '#0F0F23'] : ['#EEEEF8', '#F8F9FF']}
          style={[styles.headerBg, { paddingTop: insets.top + 16 }]}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </LinearGradient>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => router.push('/screens/settings/edit-profile')}
            >
              <Ionicons name="camera" size={13} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.profileName, { color: colors.textPrimary }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
            {user?.email}
          </Text>

          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={[styles.levelText, { color: colors.primary }]}>
              Level {user?.level || 1}
            </Text>
            <Text style={[styles.xpText, { color: colors.textSecondary }]}>
              • {(user?.xp || 0).toLocaleString()} XP
            </Text>
          </View>

          {/* Level progress bar */}
          <View style={styles.levelBarWrap}>
            <View style={styles.levelBarRow}>
              <Text style={[styles.levelBarSub, { color: colors.textSecondary }]}>
                Level {lv.level} → Level {lv.level + 1}
              </Text>
              <Text style={[styles.levelBarPct, { color: colors.primary }]}>
                {lv.currentLevelXP} / {lv.nextLevelXP} XP
              </Text>
            </View>
            <View style={[styles.levelTrack, { backgroundColor: colors.surfaceLight }]}>
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.levelFill, { width: `${Math.max(lv.progress, 2)}%` }]}
              />
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBox emoji="🔥" value={`${user?.currentStreak || 0}d`} label="Streak" color="#F43F5E" />
            <StatBox emoji="🏆" value={`${user?.longestStreak || 0}d`} label="Best" color="#F59E0B" />
            <StatBox emoji="⭐" value={(user?.totalXPEarned || 0).toLocaleString()} label="Total XP" color="#6366F1" />
          </View>
        </LinearGradient>

        {/* ── Badges ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Badges 🏅</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BADGES_STATIC.map(b => (
              <View key={b.key} style={[styles.badgeCard, { backgroundColor: colors.surface, borderColor: `${b.color}40` }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</Text>
                <Text style={[styles.badgeRarity, { color: b.color }]}>{b.rarity}</Text>
                <Text style={[styles.badgeName, { color: colors.textPrimary }]} numberOfLines={2}>
                  {b.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Body Stats ── */}
        {(user?.height || user?.currentWeight) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Body Stats 💪</Text>
            <View style={[styles.bodyStats, { backgroundColor: colors.surface }]}>
              {[
                { label: 'Height', value: user?.height ? `${user.height}cm` : '--', icon: '📏' },
                { label: 'Weight', value: user?.currentWeight ? `${user.currentWeight}kg` : '--', icon: '⚖️' },
                { label: 'Goal', value: user?.goalWeight ? `${user.goalWeight}kg` : '--', icon: '🎯' },
                { label: 'BMI', value: user?.bmi ? `${user.bmi}` : '--', icon: '📊' },
              ].map(st => (
                <View key={st.label} style={styles.bodyStatItem}>
                  <Text style={{ fontSize: 22, marginBottom: 6 }}>{st.icon}</Text>
                  <Text style={[styles.bodyStatVal, { color: colors.textPrimary }]}>{st.value}</Text>
                  <Text style={[styles.bodyStatLbl, { color: colors.textMuted }]}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Settings ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Settings ⚙️</Text>

          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => router.push('/screens/settings/edit-profile')}
              iconBg="rgba(99,102,241,0.12)"
            />
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              value="On"
              onPress={() => router.push('/screens/settings/notifications')}
              iconBg="rgba(239,68,68,0.12)"
            />
            <SettingRow
              icon="moon-outline"
              label="Appearance"
              value={isDark ? 'Dark' : 'Light'}
              onPress={() => router.push('/screens/settings/appearance')}
              iconBg="rgba(139,92,246,0.12)"
            />
            <SettingRow
              icon="time-outline"
              label="Schedule & Goals"
              onPress={() => router.push('/screens/settings/schedule-goals')}
              iconBg="rgba(16,185,129,0.12)"
            />
            <SettingRow
              icon="lock-closed-outline"
              label="Change Password"
              onPress={() => router.push('/screens/settings/change-password')}
              iconBg="rgba(245,158,11,0.12)"
            />
            <SettingRow
              icon="information-circle-outline"
              label="About LifeOS"
              value="v2.0.0"
              onPress={() => router.push('/screens/settings/about')}
              iconBg="rgba(6,182,212,0.12)"
            />
          </View>

          <View style={[styles.settingsCard, { backgroundColor: colors.surface, marginTop: 16 }]}>
            <SettingRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleLogout}
              danger
              showArrow={false}
            />
          </View>

          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            LifeOS v2.0.0 • Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerBg: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
  avatarWrap: { marginBottom: 12, position: 'relative' },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#6366F1',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0F0F23',
  },
  profileName: { fontSize: 22, fontWeight: '800' },
  profileEmail: { fontSize: 13, marginTop: 4 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  levelText: { fontSize: 15, fontWeight: '700' },
  xpText: { fontSize: 13 },
  levelBarWrap: { width: '100%', marginTop: 16 },
  levelBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelBarSub: { fontSize: 12 },
  levelBarPct: { fontSize: 12, fontWeight: '600' },
  levelTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 15, fontWeight: '700' },
  statLbl: { fontSize: 10 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  badgeCard: {
    alignItems: 'center', borderRadius: 16, padding: 14,
    width: 90, marginRight: 12, borderWidth: 1.5,
  },
  badgeRarity: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  bodyStats: { borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-around' },
  bodyStatItem: { alignItems: 'center' },
  bodyStatVal: { fontSize: 15, fontWeight: '700' },
  bodyStatLbl: { fontSize: 11, marginTop: 2 },
  settingsCard: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  settingLabel: { flex: 1, fontSize: 15 },
  settingValue: { fontSize: 13, marginRight: 8 },
  versionText: { fontSize: 12, textAlign: 'center', marginTop: 20, marginBottom: 8 },
});
