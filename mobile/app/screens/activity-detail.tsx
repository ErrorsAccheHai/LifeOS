import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, TextInput, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useDashboardStore } from '@/store/dashboardStore';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, fetchDashboard } = useDashboardStore();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(0);

  const timelineItem = data?.timeline?.find((t) => t.activity._id === id);
  const activity = timelineItem?.activity;
  const log = timelineItem?.log;
  const isCompleted = log?.status === 'completed';
  const isMissed = log?.status === 'missed';
  const isSkipped = log?.status === 'skipped';

  if (!activity) {
    return (
      <View style={[s.center, { backgroundColor: colors.background }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Activity not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[s.backLink, { borderColor: colors.border }]}>
          <Text style={{ color: colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Completion time window check ───────────────────────────────────────────
  const checkCompletionWindow = (): { allowed: boolean; reason?: string } => {
    if (!activity.scheduledTime) return { allowed: true };

    const [h, m] = activity.scheduledTime.split(':').map(Number);
    const now = new Date();
    const start = new Date();
    start.setHours(h, m, 0, 0);

    const duration = activity.estimatedDuration || 30;
    const graceWindow = 15; // minutes after end
    const lateWindow = 60;  // minutes after end — still completable but late

    const endTime = new Date(start.getTime() + duration * 60000);
    const graceEnd = new Date(endTime.getTime() + graceWindow * 60000);
    const lateEnd = new Date(endTime.getTime() + lateWindow * 60000);

    if (now < start) {
      return { allowed: false, reason: 'This activity has not started yet.' };
    }
    if (now > lateEnd) {
      return { allowed: false, reason: 'The completion window has passed. This activity is now missed.' };
    }
    return { allowed: true };
  };

  const handleComplete = async () => {
    const check = checkCompletionWindow();
    if (!check.allowed) {
      Toast.show({ type: 'info', text1: '⏰ Cannot complete', text2: check.reason });
      return;
    }

    setLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await api.post(
        `${ENDPOINTS.ACTIVITIES.COMPLETE(activity._id)}?date=${date}`,
        { notes: notes.trim() || undefined, mood: mood || undefined }
      );

      const { xpEarned, leveledUp, levelInfo } = res.data.data;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: `✅ ${activity.name} completed!`,
        text2: leveledUp
          ? `🎉 Level Up → Level ${levelInfo.level}! +${xpEarned} XP`
          : `+${xpEarned} XP earned`,
      });

      fetchDashboard();
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to complete' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Activity',
      `Skip "${activity.name}" for today? You'll lose -${Math.round(activity.xpReward * 0.25)} XP.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: async () => {
            setSkipLoading(true);
            try {
              const date = new Date().toISOString().split('T')[0];
              // Call the status update endpoint to mark as skipped
              await api.patch(ENDPOINTS.ACTIVITIES.UPDATE_STATUS(activity._id), {
                status: 'skipped',
                date,
                notes: 'Skipped by user',
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show({
                type: 'info',
                text1: `⏭️ ${activity.name} skipped`,
                text2: `-${Math.round(activity.xpReward * 0.25)} XP`,
              });
              fetchDashboard();
              router.back();
            } catch (e: any) {
              // Fallback: some backends handle skip via complete endpoint with status
              try {
                const date = new Date().toISOString().split('T')[0];
                await api.post(
                  `${ENDPOINTS.ACTIVITIES.COMPLETE(activity._id)}?date=${date}`,
                  { status: 'skipped' }
                );
                Toast.show({ type: 'info', text1: `⏭️ ${activity.name} skipped` });
                fetchDashboard();
                router.back();
              } catch {
                Toast.show({ type: 'error', text1: 'Could not skip activity' });
              }
            } finally {
              setSkipLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    if (activity.isDefault) {
      Alert.alert('Cannot Delete', 'Default activities cannot be deleted. You can disable them in settings.');
      return;
    }
    Alert.alert('Delete Activity', `Permanently delete "${activity.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(ENDPOINTS.ACTIVITIES.BY_ID(activity._id));
            Toast.show({ type: 'success', text1: 'Activity deleted' });
            fetchDashboard();
            router.back();
          } catch (e: any) {
            Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed to delete' });
          }
        },
      },
    ]);
  };

  const statusBanner = () => {
    if (isCompleted) return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', emoji: '✅', color: '#10B981', text: 'Completed Today!', sub: `+${log?.xpEarned || 0} XP earned` };
    if (isMissed)    return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', emoji: '❌', color: '#EF4444', text: 'Missed', sub: 'Completion window passed' };
    if (isSkipped)   return { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', emoji: '⏭️', color: '#8B5CF6', text: 'Skipped', sub: `${Math.round(activity.xpReward * 0.25)} XP deducted` };
    return null;
  };

  const banner = statusBanner();
  const canComplete = !isCompleted && !isMissed && !isSkipped;

  return (
    <View style={[s.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[`${activity.color}35`, colors.background]}
        style={[s.headerGrad, { paddingTop: insets.top + 8 }]}
      >
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
            <Ionicons name="chevron-down" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={s.iconWrap}>
          <View style={[s.iconCircle, { backgroundColor: `${activity.color}28`, borderColor: `${activity.color}55` }]}>
            <Text style={{ fontSize: 38 }}>{activity.icon}</Text>
          </View>
          <Text style={[s.activityName, { color: colors.textPrimary }]}>{activity.name}</Text>
          <Text style={[s.activityMeta, { color: colors.textMuted }]}>
            {activity.category} • {activity.estimatedDuration}min • ⚡{activity.xpReward} XP
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status banner */}
        {banner && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={[s.banner, { backgroundColor: banner.bg, borderColor: banner.border }]}
          >
            <Text style={{ fontSize: 28 }}>{banner.emoji}</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: banner.color, fontSize: 15, fontWeight: '700' }}>{banner.text}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{banner.sub}</Text>
            </View>
          </Animated.View>
        )}

        {/* Details card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[s.detailCard, { backgroundColor: colors.surface }]}>
            {[
              { icon: 'time-outline',          label: 'Scheduled', value: activity.scheduledTime || 'Anytime' },
              { icon: 'timer-outline',          label: 'Duration',  value: `${activity.estimatedDuration} minutes` },
              { icon: 'repeat-outline',         label: 'Repeat',    value: activity.repeatSchedule?.type || 'Daily' },
              { icon: 'flag-outline',           label: 'Priority',  value: activity.priority, cap: true },
              { icon: 'notifications-outline',  label: 'Reminder',  value: activity.reminder?.enabled ? `${activity.reminder.minutesBefore} min before` : 'Off' },
            ].map((d, i, arr) => (
              <View key={d.label} style={[s.detailRow, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }]}>
                <Ionicons name={d.icon as any} size={17} color={colors.textMuted} style={{ marginRight: 12 }} />
                <Text style={[s.detailLabel, { color: colors.textMuted }]}>{d.label}</Text>
                <Text style={[s.detailValue, { color: colors.textPrimary, textTransform: d.cap ? 'capitalize' : 'none' }]}>
                  {d.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Completion form */}
        {canComplete && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={[s.formLabel, { color: colors.textSecondary }]}>LOG COMPLETION</Text>

            {/* Mood */}
            <Text style={[s.moodLabel, { color: colors.textSecondary }]}>How did it feel?</Text>
            <View style={s.moodRow}>
              {['😞', '😕', '😐', '😊', '😄'].map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setMood(i + 1)}
                  style={[
                    s.moodBtn,
                    { backgroundColor: colors.surface },
                    mood === i + 1 && { backgroundColor: `${colors.primary}25`, borderWidth: 1.5, borderColor: colors.primary },
                  ]}
                >
                  <Text style={{ fontSize: mood === i + 1 ? 24 : 20 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes (optional)..."
              placeholderTextColor={colors.textMuted}
              multiline
              style={[s.notesInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            />

            {/* Actions */}
            <View style={s.actionRow}>
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="outline"
                loading={skipLoading}
                style={{ flex: 1 }}
              />
              <Button
                title={`Complete  +${activity.xpReward} XP`}
                onPress={handleComplete}
                loading={loading}
                gradient={[colors.primary, '#8B5CF6']}
                style={{ flex: 2 }}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backLink: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  headerGrad: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconWrap: { alignItems: 'center' },
  iconCircle: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2 },
  activityName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  activityMeta: { fontSize: 13 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  detailCard: { borderRadius: 20, padding: 16, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  detailLabel: { flex: 1, fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '500' },
  formLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14 },
  moodLabel: { fontSize: 13, marginBottom: 10 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  moodBtn: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notesInput: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 14, marginBottom: 20, minHeight: 70, textAlignVertical: 'top' },
  actionRow: { flexDirection: 'row', gap: 12 },
});
