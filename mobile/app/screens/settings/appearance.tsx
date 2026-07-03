import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import { useTheme, type ThemeMode, type AccentColor, ACCENT_COLORS } from '@/context/ThemeContext';

const THEMES: { value: ThemeMode; label: string; emoji: string; description: string }[] = [
  { value: 'dark', label: 'Dark', emoji: '🌙', description: 'Classic dark mode' },
  { value: 'light', label: 'Light', emoji: '☀️', description: 'Light and clean' },
  { value: 'amoled', label: 'AMOLED', emoji: '⚫', description: 'True black for OLED' },
  { value: 'system', label: 'System', emoji: '📱', description: 'Follow system setting' },
];

const ACCENT_OPTIONS: { value: AccentColor; label: string }[] = [
  { value: 'purple', label: 'Purple' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'pink', label: 'Pink' },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const { colors, mode, accentColor, setMode, setAccentColor } = useTheme();

  const [saving, setSaving] = useState(false);

  const handleThemeSelect = (t: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(t);
  };

  const handleAccentSelect = (a: AccentColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccentColor(a);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(ENDPOINTS.USERS.PROFILE, {
        settings: { theme: mode === 'amoled' ? 'dark' : mode },
      });
      updateUser({ settings: { ...user?.settings!, theme: mode === 'amoled' ? 'dark' : mode } });
      Toast.show({ type: 'success', text1: '✅ Appearance saved' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.background]}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Appearance</Text>
        <TouchableOpacity onPress={save}>
          <Text style={[styles.saveText, { color: saving ? colors.textMuted : colors.primary }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Theme */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>THEME</Text>
          <View style={styles.themeGrid}>
            {THEMES.map(t => (
              <TouchableOpacity
                key={t.value}
                onPress={() => handleThemeSelect(t.value)}
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  mode === t.value && { backgroundColor: `${colors.primary}20`, borderColor: colors.primary },
                ]}
              >
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{t.emoji}</Text>
                <Text style={[styles.themeLabel, {
                  color: mode === t.value ? colors.primary : colors.textPrimary,
                }]}>
                  {t.label}
                </Text>
                <Text style={[styles.themeDesc, { color: colors.textMuted }]}>
                  {t.description}
                </Text>
                {mode === t.value && (
                  <View style={[styles.checkDot, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Accent Color */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ACCENT COLOR</Text>
          <View style={styles.accentRow}>
            {ACCENT_OPTIONS.map(ac => (
              <TouchableOpacity
                key={ac.value}
                onPress={() => handleAccentSelect(ac.value)}
                style={styles.accentItem}
              >
                <View style={[
                  styles.accentDot,
                  { backgroundColor: ACCENT_COLORS[ac.value] },
                  accentColor === ac.value && { borderWidth: 3, borderColor: '#fff' },
                ]}>
                  {accentColor === ac.value && (
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  )}
                </View>
                <Text style={[styles.accentLabel, { color: colors.textMuted }]}>{ac.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Preview */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREVIEW</Text>
          <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}05`]}
              style={styles.previewGrad}
            >
              <View style={[styles.previewBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.previewBadgeText}>⚡ Level 12</Text>
              </View>
              <Text style={[styles.previewTitle, { color: colors.textPrimary }]}>Life Score</Text>
              <Text style={[styles.previewScore, { color: colors.primary }]}>87</Text>
              <View style={[styles.previewBar, { backgroundColor: colors.surfaceLight }]}>
                <LinearGradient
                  colors={[colors.primary, `${colors.primary}88`]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.previewBarFill, { width: '87%' }]}
                />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 15, fontWeight: '600' },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5,
    marginBottom: 14, marginTop: 24,
  },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: {
    width: '47%', borderRadius: 20, padding: 16,
    borderWidth: 1.5, position: 'relative',
  },
  themeLabel: { fontSize: 14, fontWeight: '600' },
  themeDesc: { fontSize: 11, marginTop: 2 },
  checkDot: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  accentRow: { flexDirection: 'row', gap: 16 },
  accentItem: { alignItems: 'center', gap: 6 },
  accentDot: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  accentLabel: { fontSize: 10 },
  preview: { borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  previewGrad: { padding: 20, alignItems: 'center' },
  previewBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, marginBottom: 12 },
  previewBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  previewTitle: { fontSize: 13, marginBottom: 4 },
  previewScore: { fontSize: 48, fontWeight: '900', marginBottom: 12 },
  previewBar: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  previewBarFill: { height: '100%', borderRadius: 4 },
});
