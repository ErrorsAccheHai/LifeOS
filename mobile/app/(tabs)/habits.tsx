import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Animated, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useHabitsStore } from '@/store/habitsStore';
import { useTheme } from '@/context/ThemeContext';
import type { Habit } from '@/types';

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { colors } = useTheme();

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.surface, opacity }]}>
      <View style={styles.cardRow}>
        <View style={[styles.skeletonIcon, { backgroundColor: colors.surfaceLight }]} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.surfaceLight }]} />
          <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.surfaceLight }]} />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Habit card ───────────────────────────────────────────────────────────────
function HabitCard({
  habit, isCompleted, onComplete, onSkip, onDelete,
}: {
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onDelete: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  const handleComplete = () => {
    if (isCompleted) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    Animated.spring(checkScale, { toValue: 1.3, friction: 3, useNativeDriver: true }).start(() =>
      Animated.spring(checkScale, { toValue: 1, friction: 3, useNativeDriver: true }).start()
    );
    onComplete();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(habit.name, 'What would you like to do?', [
      { text: 'Skip Today', onPress: onSkip },
      { text: 'Delete Habit', style: 'destructive', onPress: onDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const rateColor = habit.completionRate >= 80
    ? '#10B981' : habit.completionRate >= 60
      ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity
      onPress={handleComplete}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.card,
        { backgroundColor: colors.surface, transform: [{ scale }] },
        isCompleted && { borderColor: `${habit.color}40`, borderWidth: 1 },
      ]}>
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${habit.color}20` }]}>
            <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[
              styles.habitName,
              { color: colors.textPrimary },
              isCompleted && { color: colors.textMuted, textDecorationLine: 'line-through' },
            ]}>
              {habit.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Text style={styles.streakText}>🔥 {habit.currentStreak} days</Text>
              <Text style={[styles.bestText, { color: colors.textMuted }]}>
                Best: {habit.longestStreak}
              </Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <TouchableOpacity
              onPress={handleComplete}
              style={[
                styles.checkBtn,
                { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                isCompleted && { backgroundColor: `${habit.color}20`, borderColor: habit.color },
              ]}
            >
              {isCompleted && <Ionicons name="checkmark" size={18} color={habit.color} />}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceLight }]}>
          <Animated.View
            style={[styles.progressFill, { width: `${habit.completionRate}%`, backgroundColor: habit.color }]}
          />
        </View>
        <View style={styles.rateRow}>
          <Text style={[styles.rateText, { color: rateColor }]}>
            {habit.completionRate}% completion rate
          </Text>
          <Text style={[styles.freqText, { color: colors.textMuted }]}>
            {habit.frequency.type}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────
export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { habits, completedToday, isLoading, stats, fetchHabits, completeHabit, skipHabit, deleteHabit } = useHabitsStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'daily' | 'weekly'>('all');

  useEffect(() => { fetchHabits(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHabits();
    setRefreshing(false);
  }, []);

  const handleComplete = async (habit: Habit) => {
    try {
      const { xpEarned } = await completeHabit(habit._id);
      Toast.show({
        type: 'success',
        text1: `✅ ${habit.name}`,
        text2: `+${xpEarned} XP earned`,
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to complete habit',
        text2: e.response?.data?.message || 'Try again',
      });
    }
  };

  const handleSkip = async (habit: Habit) => {
    try {
      await skipHabit(habit._id, 'Skipped by user');
      Toast.show({ type: 'info', text1: `⏭️ ${habit.name} skipped` });
    } catch {}
  };

  const handleDelete = async (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit._id);
              Toast.show({ type: 'success', text1: 'Habit deleted' });
            } catch {
              Toast.show({ type: 'error', text1: 'Failed to delete habit' });
            }
          },
        },
      ]
    );
  };

  const filtered = habits.filter(h =>
    filter === 'all' || h.frequency.type === filter
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#0F0F23'] : ['#EEEEF8', '#F8F9FF']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Habits</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Build consistent routines
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/screens/add-habit')}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, emoji: '✅' },
            { label: 'Today', value: `${stats.completedToday}/${stats.total}`, emoji: '🔥' },
            { label: 'Avg Rate', value: `${stats.avgRate}%`, emoji: '📊' },
          ].map(st => (
            <View key={st.label} style={[styles.statBox, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 20 }}>{st.emoji}</Text>
              <Text style={[styles.statVal, { color: colors.textPrimary }]}>{st.value}</Text>
              <Text style={[styles.statLbl, { color: colors.textMuted }]}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
        >
          {(['all', 'daily', 'weekly'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                { backgroundColor: colors.surface },
                filter === f && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: colors.textSecondary },
                filter === f && { color: '#fff' },
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
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
        {isLoading && habits.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No habits yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap the + button to create your first habit and start building your routine.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/screens/add-habit')}
            >
              <Text style={styles.emptyBtnText}>Create First Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(habit => (
            <HabitCard
              key={habit._id}
              habit={habit}
              isCompleted={completedToday.includes(habit._id)}
              onComplete={() => handleComplete(habit)}
              onSkip={() => handleSkip(habit)}
              onDelete={() => handleDelete(habit)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 13, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLbl: { fontSize: 10 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  filterText: { fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 20, padding: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  habitName: { fontSize: 15, fontWeight: '600' },
  streakText: { color: '#F43F5E', fontSize: 12 },
  bestText: { fontSize: 12 },
  checkBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  progressTrack: { height: 4, borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  rateText: { fontSize: 11, fontWeight: '500' },
  freqText: { fontSize: 11 },
  skeletonIcon: { width: 48, height: 48, borderRadius: 14, marginRight: 14 },
  skeletonLine: { height: 12, borderRadius: 6 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
