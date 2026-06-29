import React, { useEffect, useCallback, useState } from 'react';
import {
  View, Text, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import LifeScoreCard from '@/components/cards/LifeScoreCard';
import QuickStatCard from '@/components/cards/QuickStatCard';
import ActivityTimelineCard from '@/components/cards/ActivityTimelineCard';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { TimelineItem } from '@/types';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const MOOD_EMOJIS = ['😞', '😕', '😐', '😊', '😄'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, fetchDashboard, logMood } = useDashboardStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(data?.today?.mood || null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, []);

  const handleCompleteActivity = async (item: TimelineItem) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      await api.post(`${ENDPOINTS.ACTIVITIES.COMPLETE(item.activity._id)}?date=${date}`, {});
      Toast.show({
        type: 'success',
        text1: `✅ ${item.activity.name} completed!`,
        text2: `+${item.activity.xpReward} XP earned`,
      });
      fetchDashboard();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to complete activity',
      });
    }
  };

  const handleMoodSelect = async (mood: number) => {
    setSelectedMood(mood);
    try {
      await logMood(mood);
      Toast.show({
        type: 'success',
        text1: `Mood logged: ${MOOD_EMOJIS[mood - 1]}`,
      });
    } catch {}
  };

  if (isLoading && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.primary, fontSize: 40, marginBottom: 16 }}>⚡</Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>Loading your day...</Text>
      </View>
    );
  }

  const dashboard = data;
  const firstName = (user?.name || dashboard?.user?.name || 'there').split(' ')[0];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: SPACING.base,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(500)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <View>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
              {getGreeting()} 👋
            </Text>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: FONT_SIZE['3xl'],
                fontWeight: '800',
                letterSpacing: -0.5,
                marginTop: 2,
              }}
            >
              {firstName}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {/* XP Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={{ color: COLORS.accentAmber, fontSize: FONT_SIZE.sm, fontWeight: '700' }}>
                {(dashboard?.user?.xp || user?.xp || 0).toLocaleString()}
              </Text>
            </View>

            {/* Notifications */}
            <TouchableOpacity
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: COLORS.surface,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Life Score Card */}
        {dashboard && (
          <LifeScoreCard
            score={dashboard.today.lifeScore}
            grade={dashboard.today.grade}
            completionRate={dashboard.today.routineCompletion}
            activitiesCompleted={dashboard.today.activitiesCompleted}
            activitiesTotal={dashboard.today.activitiesTotal}
            xpEarned={dashboard.today.xpEarned}
            streak={dashboard.user.currentStreak}
            onPress={() => router.push('/screens/ai-report')}
          />
        )}

        {/* Level Progress */}
        {dashboard?.user?.levelInfo && (
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={{ marginTop: 16 }}
          >
            <LinearGradient
              colors={['#1E1E3A', '#16163A']}
              style={{
                borderRadius: BORDER_RADIUS.xl,
                padding: 16,
                borderWidth: 1,
                borderColor: 'rgba(99,102,241,0.15)',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                  <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                    Level {dashboard.user.levelInfo.level}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                    {dashboard.user.levelInfo.currentLevelXP} / {dashboard.user.levelInfo.nextLevelXP} XP
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgba(99,102,241,0.15)',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                    {dashboard.user.levelInfo.progress}%
                  </Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: '100%',
                    width: `${dashboard.user.levelInfo.progress}%`,
                    borderRadius: 3,
                  }}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Quick Stats Row */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}
        >
          <QuickStatCard
            title="Hydration"
            value={`${Math.round((dashboard?.cards?.water?.amount || 0) / 100) / 10}L`}
            subtitle={`Goal: ${((dashboard?.cards?.water?.goal || 2500) / 1000).toFixed(1)}L`}
            icon="💧"
            gradient={GRADIENTS.water}
            progress={dashboard?.cards?.water?.percentage || 0}
            onPress={() => router.push('/screens/water-tracker')}
            delay={0}
          />
          <QuickStatCard
            title="Sleep"
            value={dashboard?.cards?.sleep?.duration
              ? `${Math.round(dashboard.cards.sleep.duration / 60 * 10) / 10}h`
              : '--'
            }
            subtitle={dashboard?.cards?.sleep?.quality ? `Quality: ${dashboard.cards.sleep.quality}/5` : 'Not logged'}
            icon="😴"
            gradient={GRADIENTS.sleep}
            onPress={() => router.push('/screens/sleep-tracker')}
            delay={100}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(250).duration(500)}
          style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}
        >
          <QuickStatCard
            title="Workout"
            value={dashboard?.cards?.workout?.duration
              ? `${dashboard.cards.workout.duration}m`
              : '--'
            }
            subtitle={dashboard?.cards?.workout?.workoutType || 'Not logged'}
            icon="🏋️"
            gradient={GRADIENTS.workout}
            onPress={() => router.push('/screens/workout-log')}
            delay={0}
          />
          <QuickStatCard
            title="Study"
            value={dashboard?.cards?.study?.totalDuration
              ? `${Math.round(dashboard.cards.study.totalDuration / 60 * 10) / 10}h`
              : '--'
            }
            subtitle={`Goal: ${((user?.goals?.studyGoal || 120) / 60).toFixed(1)}h`}
            icon="📚"
            gradient={GRADIENTS.primary}
            progress={dashboard?.cards?.study
              ? Math.min((dashboard.cards.study.totalDuration / (user?.goals?.studyGoal || 120)) * 100, 100)
              : 0
            }
            onPress={() => router.push('/screens/study-tracker')}
            delay={100}
          />
        </Animated.View>

        {/* Mood Tracker */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={{ marginTop: 20 }}
        >
          <LinearGradient
            colors={['#1E1E3A', '#16163A']}
            style={{
              borderRadius: BORDER_RADIUS.xl,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500', marginBottom: 14 }}>
              How are you feeling? 🌟
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOOD_EMOJIS.map((emoji, index) => {
                const moodValue = index + 1;
                const isSelected = selectedMood === moodValue || data?.today?.mood === moodValue;
                return (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => handleMoodSelect(moodValue)}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: isSelected ? 'rgba(99,102,241,0.2)' : COLORS.surfaceLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: COLORS.primary,
                      transform: [{ scale: isSelected ? 1.1 : 1 }],
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Upcoming Activities */}
        {dashboard?.upcoming && dashboard.upcoming.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                Coming Up
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/timeline')}>
                <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '500' }}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            {dashboard.upcoming.map((item, index) => (
              <ActivityTimelineCard
                key={`upcoming-${item.activity._id}-${index}`}
                item={item}
                onPress={() => router.push(`/screens/activity-detail?id=${item.activity._id}`)}
                onComplete={handleCompleteActivity}
              />
            ))}
          </Animated.View>
        )}

        {/* Recent Badges */}
        {dashboard?.recentBadges && dashboard.recentBadges.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: 24 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 14 }}>
              Recent Badges 🏆
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {dashboard.recentBadges.map((badge) => (
                <View
                  key={badge._id}
                  style={{
                    alignItems: 'center',
                    marginHorizontal: 6,
                    backgroundColor: COLORS.surface,
                    borderRadius: BORDER_RADIUS.lg,
                    padding: 12,
                    width: 80,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>{badge.icon}</Text>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 10,
                      textAlign: 'center',
                      fontWeight: '500',
                    }}
                    numberOfLines={2}
                  >
                    {badge.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)} style={{ marginTop: 24 }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 14 }}>
            Quick Add
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Log Water', icon: '💧', route: '/screens/water-tracker', color: COLORS.accentCyan },
              { label: 'Log Meal', icon: '🍱', route: '/screens/meal-log', color: COLORS.accentEmerald },
              { label: 'Workout', icon: '💪', route: '/screens/workout-log', color: COLORS.error },
              { label: 'Log Weight', icon: '⚖️', route: '/screens/weight-log', color: COLORS.accentViolet },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => router.push(action.route as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: `${action.color}15`,
                  borderRadius: BORDER_RADIUS.full,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: `${action.color}30`,
                }}
              >
                <Text style={{ fontSize: 16 }}>{action.icon}</Text>
                <Text style={{ color: action.color, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/screens/add-activity')}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 72,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          overflow: 'hidden',
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={GRADIENTS.primary}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
