import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import LifeScoreCard from '@/components/cards/LifeScoreCard';
import QuickStatCard from '@/components/cards/QuickStatCard';
import ActivityTimelineCard from '@/components/cards/ActivityTimelineCard';
import type { TimelineItem } from '@/types';

const MOOD_EMOJIS = ['😞', '😕', '😐', '😊', '😄'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, fetchDashboard, logMood } = useDashboardStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  useEffect(() => { fetchDashboard(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, []);

  const handleComplete = async (item: TimelineItem) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(item.activity._id)}?date=${date}`, {});
      Toast.show({ type: 'success', text1: `✅ ${item.activity.name} completed!`, text2: `+${item.activity.xpReward} XP` });
      fetchDashboard();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed' });
    }
  };

  const handleMood = async (mood: number) => {
    setSelectedMood(mood);
    try { await logMood(mood); } catch {}
  };

  if (isLoading && !data) {
    return (
      <View style={s.loadingWrap}>
        <Text style={{ fontSize: 40 }}>⚡</Text>
        <Text style={s.loadingText}>Loading your day...</Text>
      </View>
    );
  }

  const firstName = (user?.name || data?.user?.name || 'there').split(' ')[0];

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()} 👋</Text>
            <Text style={s.name}>{firstName}</Text>
          </View>
          <View style={s.headerRight}>
            <View style={s.xpBadge}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={s.xpText}>{(data?.user?.xp || user?.xp || 0).toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={s.notifBtn}>
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Life Score */}
        {data && (
          <LifeScoreCard
            score={data.today.lifeScore}
            grade={data.today.grade}
            completionRate={data.today.routineCompletion}
            activitiesCompleted={data.today.activitiesCompleted}
            activitiesTotal={data.today.activitiesTotal}
            xpEarned={data.today.xpEarned}
            streak={data.user.currentStreak}
            onPress={() => router.push('/screens/ai-report')}
          />
        )}

        {/* Level Progress */}
        {data?.user?.levelInfo && (
          <View style={s.levelCard}>
            <View style={s.levelRow}>
              <View>
                <Text style={s.levelTitle}>Level {data.user.levelInfo.level}</Text>
                <Text style={s.levelSub}>{data.user.levelInfo.currentLevelXP} / {data.user.levelInfo.nextLevelXP} XP</Text>
              </View>
              <View style={s.levelBadge}>
                <Text style={s.levelPct}>{data.user.levelInfo.progress}%</Text>
              </View>
            </View>
            <View style={s.progressTrack}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.progressFill, { width: `${data.user.levelInfo.progress}%` }]} />
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={s.row}>
          <QuickStatCard title="Hydration" value={`${Math.round((data?.cards?.water?.amount || 0) / 100) / 10}L`}
            subtitle={`Goal: ${((data?.cards?.water?.goal || 2500) / 1000).toFixed(1)}L`}
            icon="💧" gradient={['#06B6D4', '#3B82F6']} progress={data?.cards?.water?.percentage || 0}
            onPress={() => router.push('/screens/water-tracker')} />
          <QuickStatCard title="Sleep"
            value={data?.cards?.sleep?.duration ? `${Math.round(data.cards.sleep.duration / 60 * 10) / 10}h` : '--'}
            subtitle={data?.cards?.sleep?.quality ? `Quality: ${data.cards.sleep.quality}/5` : 'Not logged'}
            icon="😴" gradient={['#3B82F6', '#6366F1']}
            onPress={() => router.push('/screens/sleep-tracker')} />
        </View>

        <View style={[s.row, { marginTop: 12 }]}>
          <QuickStatCard title="Workout"
            value={data?.cards?.workout?.duration ? `${data.cards.workout.duration}m` : '--'}
            subtitle={data?.cards?.workout?.workoutType || 'Not logged'}
            icon="🏋️" gradient={['#EF4444', '#F97316']}
            onPress={() => router.push('/screens/workout-log')} />
          <QuickStatCard title="Study"
            value={data?.cards?.study?.totalDuration ? `${Math.round(data.cards.study.totalDuration / 60 * 10) / 10}h` : '--'}
            subtitle={`Goal: ${((user?.goals?.studyGoal || 120) / 60).toFixed(1)}h`}
            icon="📚" gradient={['#6366F1', '#8B5CF6']}
            progress={data?.cards?.study ? Math.min((data.cards.study.totalDuration / (user?.goals?.studyGoal || 120)) * 100, 100) : 0}
            onPress={() => router.push('/screens/study-tracker')} />
        </View>

        {/* Mood */}
        <View style={s.moodCard}>
          <Text style={s.moodTitle}>How are you feeling? 🌟</Text>
          <View style={s.moodRow}>
            {MOOD_EMOJIS.map((emoji, i) => {
              const v = i + 1;
              const active = selectedMood === v || data?.today?.mood === v;
              return (
                <TouchableOpacity key={emoji} onPress={() => handleMood(v)}
                  style={[s.moodBtn, active && s.moodBtnActive]}>
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Upcoming */}
        {data?.upcoming && data.upcoming.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Coming Up</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
                <Text style={s.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {data.upcoming.map((item, i) => (
              <ActivityTimelineCard key={`${item.activity._id}-${i}`} item={item}
                onPress={() => router.push(`/screens/activity-detail?id=${item.activity._id}`)}
                onComplete={handleComplete} />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ marginTop: 24 }}>
          <Text style={s.sectionTitle}>Quick Add</Text>
          <View style={s.quickActions}>
            {[
              { label: 'Log Water', icon: '💧', route: '/screens/water-tracker', color: '#06B6D4' },
              { label: 'Log Meal', icon: '🍱', route: '/screens/meal-log', color: '#10B981' },
              { label: 'Workout', icon: '💪', route: '/screens/workout-log', color: '#EF4444' },
              { label: 'Log Weight', icon: '⚖️', route: '/screens/weight-log', color: '#8B5CF6' },
            ].map(a => (
              <TouchableOpacity key={a.label} onPress={() => router.push(a.route as any)}
                style={[s.quickBtn, { backgroundColor: `${a.color}15`, borderColor: `${a.color}30` }]}>
                <Text style={{ fontSize: 16 }}>{a.icon}</Text>
                <Text style={[s.quickBtnText, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity onPress={() => router.push('/screens/add-activity')} style={[s.fab, { bottom: insets.bottom + 72 }]}>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={s.fabInner}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F23' },
  scroll: { paddingHorizontal: 16 },
  loadingWrap: { flex: 1, backgroundColor: '#0F0F23', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#A0A0C0', fontSize: 14, marginTop: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  greeting: { color: '#A0A0C0', fontSize: 14 },
  name: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  xpText: { color: '#F59E0B', fontSize: 13, fontWeight: '700' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' },
  levelCard: { backgroundColor: '#1E1E3A', borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)' },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  levelTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  levelSub: { color: '#606080', fontSize: 12, marginTop: 2 },
  levelBadge: { backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  levelPct: { color: '#6366F1', fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: '#252547', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  moodCard: { backgroundColor: '#1E1E3A', borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  moodTitle: { color: '#A0A0C0', fontSize: 13, fontWeight: '500', marginBottom: 14 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#252547', alignItems: 'center', justifyContent: 'center' },
  moodBtnActive: { backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 2, borderColor: '#6366F1' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  seeAll: { color: '#6366F1', fontSize: 13, fontWeight: '500' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  quickBtnText: { fontSize: 13, fontWeight: '600' },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
