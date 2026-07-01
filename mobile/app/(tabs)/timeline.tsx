import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { format, addDays, subDays } from 'date-fns';

import { useDashboardStore } from '@/store/dashboardStore';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import ActivityTimelineCard from '@/components/cards/ActivityTimelineCard';
import type { TimelineItem, ActivityStatus } from '@/types';

const FILTERS: { label: string; value: ActivityStatus | 'all' }[] = [
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

  useEffect(() => { fetchDashboard(); }, []);

  const today = new Date();
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const timeline = data?.timeline || [];
  const filtered = filter === 'all' ? timeline : timeline.filter(i => i.status === filter);
  const completed = timeline.filter(i => i.status === 'completed').length;
  const total = timeline.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleComplete = async (item: TimelineItem) => {
    try {
      const date = format(selectedDate, 'yyyy-MM-dd');
      await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(item.activity._id)}?date=${date}`, {});
      Toast.show({ type: 'success', text1: `✅ ${item.activity.name}`, text2: `+${item.activity.xpReward} XP` });
      fetchDashboard();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message });
    }
  };

  return (
    <View style={s.screen}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']}
        style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Text style={s.title}>Timeline</Text>
        <Text style={s.sub}>Your daily schedule</Text>

        {/* Date nav */}
        <View style={s.dateNav}>
          <TouchableOpacity onPress={() => setSelectedDate(subDays(selectedDate, 1))} style={s.navBtn}>
            <Text style={s.navArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.dateText}>{isToday ? 'Today' : format(selectedDate, 'EEE, MMM d')}</Text>
            {!isToday && <TouchableOpacity onPress={() => setSelectedDate(today)}><Text style={s.todayLink}>Back to today</Text></TouchableOpacity>}
          </View>
          <TouchableOpacity onPress={() => setSelectedDate(addDays(selectedDate, 1))} disabled={isToday}
            style={[s.navBtn, isToday && { opacity: 0.4 }]}>
            <Text style={s.navArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={s.progressCard}>
          <View style={s.progressRow}>
            <Text style={s.progressText}>{completed} of {total} completed</Text>
            <Text style={s.progressPct}>{progress}%</Text>
          </View>
          <View style={s.progressTrack}>
            <LinearGradient colors={progress >= 80 ? ['#10B981', '#06B6D4'] : ['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingVertical: 4, gap: 8, flexDirection: 'row' }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.value} onPress={() => setFilter(f.value)}
              style={[s.filterBtn, filter === f.value && s.filterBtnActive]}>
              <Text style={[s.filterText, filter === f.value && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchDashboard(); setRefreshing(false); }} tintColor="#6366F1" />}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📋</Text>
            <Text style={s.emptyText}>{filter === 'all' ? 'No activities scheduled' : `No ${filter} activities`}</Text>
          </View>
        ) : filtered.map((item, i) => (
          <ActivityTimelineCard key={`${item.activity._id}-${i}`} item={item}
            onPress={() => router.push(`/screens/activity-detail?id=${item.activity._id}`)}
            onComplete={handleComplete} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { color: '#A0A0C0', fontSize: 13 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' },
  navArrow: { color: '#FFFFFF', fontSize: 20 },
  dateText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  todayLink: { color: '#6366F1', fontSize: 12, marginTop: 2 },
  progressCard: { backgroundColor: '#1E1E3A', borderRadius: 12, padding: 14, marginTop: 16 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { color: '#A0A0C0', fontSize: 13 },
  progressPct: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: '#252547', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#1E1E3A', borderWidth: 1, borderColor: '#2D2D5A' },
  filterBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  filterText: { color: '#A0A0C0', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#A0A0C0', fontSize: 14, textAlign: 'center' },
});
