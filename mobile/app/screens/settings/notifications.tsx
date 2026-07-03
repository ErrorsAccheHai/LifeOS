import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';

interface NotifSetting {
  key: string;
  label: string;
  description: string;
  emoji: string;
  value: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const { colors } = useTheme();

  const [masterEnabled, setMasterEnabled] = useState(user?.settings?.notifications ?? true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<NotifSetting[]>([
    { key: 'morningReminder', label: 'Morning Reminder', description: 'Daily wake-up motivation', emoji: '🌅', value: true },
    { key: 'breakfast', label: 'Breakfast', description: 'Time to eat breakfast', emoji: '🍳', value: true },
    { key: 'lunch', label: 'Lunch', description: 'Lunch time reminder', emoji: '🍱', value: true },
    { key: 'dinner', label: 'Dinner', description: 'Dinner time alert', emoji: '🍽️', value: true },
    { key: 'workout', label: 'Workout', description: 'Time to exercise', emoji: '💪', value: true },
    { key: 'water', label: 'Water Reminder', description: 'Stay hydrated every 2 hours', emoji: '💧', value: true },
    { key: 'study', label: 'Study Session', description: 'Scheduled study time', emoji: '📚', value: false },
    { key: 'sleep', label: 'Sleep', description: 'Wind down reminder', emoji: '😴', value: true },
    { key: 'weekendRoutine', label: 'Weekend Routine', description: 'Special weekend schedule', emoji: '📅', value: false },
  ]);

  const toggle = (key: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: !s.value } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put(ENDPOINTS.USERS.PROFILE, {
        settings: { notifications: masterEnabled },
      });
      updateUser({ settings: { ...user?.settings!, notifications: masterEnabled } });
      Toast.show({ type: 'success', text1: '✅ Notification settings saved!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.background]}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Notifications</Text>
          <TouchableOpacity onPress={saveSettings}>
            <Text style={{ color: saving ? colors.textMuted : colors.primary, fontSize: 15, fontWeight: '600' }}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* Master toggle */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: masterEnabled ? `${colors.primary}15` : colors.surface,
            borderRadius: 20, padding: 16, marginBottom: 24,
            borderWidth: 1, borderColor: masterEnabled ? `${colors.primary}40` : colors.border,
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700' }}>All Notifications</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {masterEnabled ? 'Notifications are enabled' : 'All notifications are muted'}
              </Text>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={setMasterEnabled}
              trackColor={{ false: colors.surfaceLight, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </Animated.View>

        {/* Individual toggles */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            Activity Reminders
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }}>
            {settings.map((setting, i) => (
              <View key={setting.key} style={{
                flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: i < settings.length - 1 ? 0.5 : 0,
                borderBottomColor: colors.border,
                opacity: masterEnabled ? 1 : 0.5,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Text style={{ fontSize: 20 }}>{setting.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>{setting.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.value && masterEnabled}
                  onValueChange={() => masterEnabled && toggle(setting.key)}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            Preferences
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }}>
            {[
              { icon: 'volume-medium-outline', label: 'Sound', description: 'Play notification sounds' },
              { icon: 'phone-portrait-outline', label: 'Vibration', description: 'Vibrate on notification' },
            ].map((pref, i) => (
              <View key={pref.label} style={{
                flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: i === 0 ? 0.5 : 0, borderBottomColor: colors.border,
              }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Ionicons name={pref.icon as any} size={20} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '500' }}>{pref.label}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>{pref.description}</Text>
                </View>
                <Switch value={true} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor="#fff" />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
