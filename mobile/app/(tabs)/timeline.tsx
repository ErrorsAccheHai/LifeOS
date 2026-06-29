import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useDashboardStore } from '@/store/dashboardStore';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import ActivityTimelineCard from '@/components/cards/ActivityTimelineCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { TimelineItem, ActivityStatus } from '@/types';
import { format, addDays, subDays } from 'date-fns';

const FILTER_OPTIONS: { label: string; value: ActivityStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '✅ Done', value: 'completed' },
  { label: '⏳ Pending', value: 'pending' },
  { label: '❌ Missed', value: 'missed' },
];

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, fetchDashboard } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActivityStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const handleComplete = async (item: TimelineItem) => {
    try {
      const date = format(selectedDate, 'yyyy-MM-dd');
      await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(item.activity._id)}?date=${date}`, {});
      Toast.show({
        type: 'success',
        text1: `✅ ${item.activity.name} completed!`,
        text2: `+${item.activity.xpReward} XP`,
      });
      fetchDashboard();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: error.response?.data?.message || 'Could not complete activity',
      });
    }
  };

  const timeline = data?.timeline || [];
  const filtered = filter === 'all'
    ? timeline
    : timeline.filter((item) => item.status === filter);

  const completed = timeline.filter((i) => i.status === 'completed').length;
  const total = timeline.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Date navigation
  const today = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.backgroundSecondary, COLORS.background]}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: SPACING.base,
          paddingBottom: 16,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONT_SIZE['2xl'],
              fontWeight: '800',
              marginBottom: 4,
            }}
          >
            Timeline
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm }}>
            Your daily schedule
          </Text>
        </Animated.View>

        {/* Date navigation */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedDate(subDays(selectedDate, 1))}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: COLORS.surface,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: COLORS.textPrimary, fontSize: 18 }}>‹</Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
              {isToday ? 'Today' : format(selectedDate, 'EEE, MMM d')}
            </Text>
            {!isToday && (
              <TouchableOpacity onPress={() => setSelectedDate(today)}>
                <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                  Back to today
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={isToday}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: COLORS.surface,
              alignItems: 'center', justifyContent: 'center',
              opacity: isToday ? 0.4 : 1,
            }}
          >
            <Text style={{ color: COLORS.textPrimary, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Progress summary */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: BORDER_RADIUS.lg,
            padding: 14,
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm }}>
              {completed} of {total} completed
            </Text>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
              {progress}%
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            gradient={progress >= 80 ? GRADIENTS.emerald : GRADIENTS.primary}
            height={6}
          />
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
        >
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setFilter(option.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: BORDER_RADIUS.full,
                backgroundColor: filter === option.value ? COLORS.primary : COLORS.surface,
                borderWidth: 1,
                borderColor: filter === option.value ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={{
                  color: filter === option.value ? '#fff' : COLORS.textSecondary,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: '500',
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Timeline */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.base,
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📋</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, textAlign: 'center' }}>
              {filter === 'all' ? 'No activities scheduled' : `No ${filter} activities`}
            </Text>
          </View>
        ) : (
          filtered.map((item, index) => (
            <ActivityTimelineCard
              key={`${item.activity._id}-${index}`}
              item={item}
              onPress={() => router.push(`/screens/activity-detail?id=${item.activity._id}`)}
              onComplete={handleComplete}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
