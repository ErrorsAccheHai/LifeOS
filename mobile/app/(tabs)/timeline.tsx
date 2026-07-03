import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { format, addDays, subDays, isToday as isTodayFn } from 'date-fns';
import * as Haptics from 'expo-haptics';

import { useDashboardStore } from '@/store/dashboardStore';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import ActivityTimelineCard from '@/components/cards/ActivityTimelineCard';
import { useTheme } from '@/context/ThemeContext';
import type { TimelineItem, ActivityStatus } from '@/types';

const FILTERS: { label: string; value: ActivityStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: '✅ Done', value: 'completed' },
  { label: '⏳ Pending', value: 'pending' },
  { label: '❌ Missed', value: 'missed' },
  { label: '⏭️ Skipped', value: 'skipped' },
];

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data, fetchDashboard } = useDashboardStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<ActivityStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historicalTimeline, setHistoricalTimeline] = useState<TimelineItem[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const isToday = isTodayFn(selectedDate);

  // Load today on mount
  useEffect(() => { fetchDashboard(); }, []);

  // When date changes, fetch that date's data
  useEffect(() => {
    if (isToday) {
      setHistoricalTimeline(null);
    } else {
      fetchHistoricalData(selectedDate);
    }
  }, [selectedDate]);

  const fetchHistoricalData = async (date: Date) => {
    setLoadingHistory(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await api.get(`${ENDPOINTS.ACTIVITIES.LOGS}?date=${dateStr}`);
      const logs = res.data.data?.logs || res.data.data || [];

      // Map logs to TimelineItem shape
      const items: TimelineItem[] = logs.map((log: any) => ({
        activity: log.activity,
        log: log,
        status: log.status,
      }));
      setHistoricalTimeline(items);
    } catch {
      setHistoricalTimeline([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const timeline = isToday
    ? (data?.timeline || [])
    : (historicalTimeline || []);

  const filtered = filter === 'all'
    ? timeline
    : timeline.filter(i => i.status === filter);

  const completed = timeline.filter(i => i.status === 'completed').length;
  const total = timeline.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleComplete = async (item: TimelineItem) => {
    // Check if activity is in the future
    if (item.activity.scheduledTime) {
      const [h, m] = item.activity.scheduledTime.split(':').map(Number);
      const scheduledDate = new Date();
      scheduledDate.setHours(h, m, 0, 0);
      if (scheduledDate > new Date()) {
        Toast.show({
          type: 'info',
          text1: '⏰ Too early',
          text2: 'This activity has not started yet.',
        });
        return;
      }
    }

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(item.activity._id)}?date=${dateStr}`, {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: `✅ ${item.activity.name}`,
        text2: `+${item.activity.xpReward} XP`,
      });
      if (isToday) {
        fetchDashboard();
      } else {
        fetchHistoricalData(selectedDate);
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: e.response?.data?.message || 'Could not complete activity',
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(prev =>
      direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1)
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isToday) {
      await fetchDashboard();
    } else {
      await fetchHistoricalData(selectedDate);
    }
    setRefreshing(false);
  }, [isToday, selectedDate]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#0F0F23'] : ['#EEEEF8', '#F8F9FF']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Timeline</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Your daily schedule</Text>

        {/* Date navigator */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={[styles.navBtn, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedDate(new Date())}
            style={styles.datePill}
          >
            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
              {isToday ? '📅 Today' : format(selectedDate, 'EEE, MMM d')}
            </Text>
            {!isToday && (
              <View style={[styles.todayPill, { backgroundColor: colors.primary }]}>
                <Text style={styles.todayPillText}>Back to today</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateDate('next')}
            disabled={isToday}
            style={[styles.navBtn, { backgroundColor: colors.surface, opacity: isToday ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {completed} of {total} completed
            </Text>
            <Text style={[styles.progressPct, { color: colors.textPrimary }]}>{progress}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
            <Animated.View style={{ width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }), height: '100%' }}>
              <LinearGradient
                colors={progress >= 80 ? ['#10B981', '#06B6D4'] : ['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ flex: 1, borderRadius: 3 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingVertical: 4, gap: 8, flexDirection: 'row' }}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                filter === f.value && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === f.value && { color: '#fff' },
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loadingHistory ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading {format(selectedDate, 'MMM d')}...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>
              {filter === 'all' ? '📋' : '✨'}
            </Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {filter === 'all'
                ? isToday ? 'No activities today' : 'No activities on this day'
                : `No ${filter} activities`}
            </Text>
            {isToday && filter === 'all' && (
              <TouchableOpacity
                onPress={() => router.push('/screens/add-activity')}
                style={[styles.addActivityBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.addActivityBtnText}>Add Activity</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((item, i) => (
            <ActivityTimelineCard
              key={`${item.activity._id}-${i}`}
              item={item}
              onPress={() => router.push(`/screens/activity-detail?id=${item.activity._id}`)}
              onComplete={handleComplete}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {isToday && (
        <TouchableOpacity
          onPress={() => router.push('/screens/add-activity')}
          style={[styles.fab, { bottom: insets.bottom + 72 }]}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.fabInner}>
            <Ionicons name="add" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 13 },
  dateNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 16,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  datePill: { alignItems: 'center', gap: 4 },
  dateText: { fontSize: 15, fontWeight: '700' },
  todayPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  todayPillText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  progressCard: { borderRadius: 12, padding: 14, marginTop: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13 },
  progressPct: { fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  addActivityBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
  addActivityBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loadingWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
