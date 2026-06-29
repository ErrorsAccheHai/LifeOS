import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useDashboardStore } from '@/store/dashboardStore';
import Button from '@/components/ui/Button';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { Activity, ActivityLog } from '@/types';

export default function ActivityDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, fetchDashboard } = useDashboardStore();

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(0);
  const [rating, setRating] = useState(0);

  const timelineItem = data?.timeline?.find((t) => t.activity._id === id);
  const activity = timelineItem?.activity;
  const log = timelineItem?.log;
  const isCompleted = log?.status === 'completed';

  if (!activity) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.textSecondary }}>Activity not found</Text>
      </View>
    );
  }

  const handleComplete = async () => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const response = await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(activity._id)}?date=${date}`, {
        notes: notes.trim() || undefined,
        mood: mood || undefined,
        rating: rating || undefined,
      });

      const { xpEarned, leveledUp, levelInfo } = response.data.data;

      Toast.show({
        type: 'success',
        text1: `✅ ${activity.name} completed!`,
        text2: leveledUp
          ? `🎉 Level Up! Level ${levelInfo.level}! +${xpEarned} XP`
          : `+${xpEarned} XP earned`,
      });

      fetchDashboard();
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to complete',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    Alert.alert('Skip Activity', `Skip "${activity.name}" for today?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        onPress: async () => {
          try {
            const date = new Date().toISOString().split('T')[0];
            // Create a log entry with skipped status
            Toast.show({ type: 'info', text1: 'Activity skipped', text2: activity.name });
            fetchDashboard();
            router.back();
          } catch {}
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (activity.isDefault) {
      Alert.alert('Cannot Delete', 'Default activities cannot be deleted. You can disable them instead.');
      return;
    }

    Alert.alert('Delete Activity', `Delete "${activity.name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(ENDPOINTS.ACTIVITIES.BY_ID(activity._id));
            Toast.show({ type: 'success', text1: 'Activity deleted' });
            fetchDashboard();
            router.back();
          } catch (error: any) {
            Toast.show({ type: 'error', text1: error.response?.data?.message });
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <LinearGradient
        colors={[`${activity.color}30`, COLORS.background]}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: SPACING.base,
          paddingBottom: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: `${activity.color}30`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              borderWidth: 2,
              borderColor: `${activity.color}50`,
            }}
          >
            <Text style={{ fontSize: 36 }}>{activity.icon}</Text>
          </View>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', marginBottom: 4 }}>
            {activity.name}
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, textTransform: 'capitalize' }}>
            {activity.category} • {activity.estimatedDuration}min • +{activity.xpReward} XP
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status */}
        {isCompleted && (
          <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: BORDER_RADIUS.xl,
                padding: 16,
                gap: 12,
                borderWidth: 1,
                borderColor: 'rgba(16,185,129,0.3)',
              }}
            >
              <Text style={{ fontSize: 28 }}>✅</Text>
              <View>
                <Text style={{ color: COLORS.accentEmerald, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                  Completed Today!
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                  +{log?.xpEarned || 0} XP earned
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 20 }}>
          <View style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl, padding: 16, gap: 12 }}>
            {[
              { icon: 'time-outline', label: 'Scheduled', value: activity.scheduledTime || 'Anytime' },
              { icon: 'repeat-outline', label: 'Repeat', value: activity.repeatSchedule?.type || 'Daily' },
              { icon: 'flag-outline', label: 'Priority', value: activity.priority, capitalize: true },
              { icon: 'notifications-outline', label: 'Reminder', value: activity.reminder?.enabled ? `${activity.reminder.minutesBefore} min before` : 'Off' },
            ].map((detail) => (
              <View key={detail.label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={detail.icon as any} size={18} color={COLORS.textMuted} style={{ marginRight: 12 }} />
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1 }}>{detail.label}</Text>
                <Text style={{
                  color: COLORS.textPrimary,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: '500',
                  textTransform: detail.capitalize ? 'capitalize' : 'none',
                }}>
                  {detail.value}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Completion form (only if not completed) */}
        {!isCompleted && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Log Completion
            </Text>

            {/* Mood */}
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: 10 }}>
              How did it feel?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {['😞', '😕', '😐', '😊', '😄'].map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setMood(i + 1)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: mood === i + 1 ? 'rgba(99,102,241,0.2)' : COLORS.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: mood === i + 1 ? 1.5 : 0,
                    borderColor: COLORS.primary,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes (optional)..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.lg,
                borderWidth: 1.5,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
                fontSize: FONT_SIZE.base,
                padding: 14,
                marginBottom: 20,
                minHeight: 70,
                textAlignVertical: 'top',
              }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                title="Skip"
                onPress={handleSkip}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title={`Complete +${activity.xpReward} XP`}
                onPress={handleComplete}
                loading={loading}
                gradient={GRADIENTS.primary}
                style={{ flex: 2 }}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
