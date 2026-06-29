import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING, CATEGORY_CONFIG } from '@/constants/theme';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';

// Sample habits data (in production, fetched from API)
const SAMPLE_HABITS = [
  {
    _id: '1', name: 'Morning Run', icon: '🏃', color: '#EF4444', category: 'fitness',
    frequency: { type: 'daily' }, currentStreak: 7, longestStreak: 14,
    totalCompletions: 42, completionRate: 85, targetCount: 1, unit: 'times',
  },
  {
    _id: '2', name: 'Read 30 mins', icon: '📖', color: '#6366F1', category: 'personal',
    frequency: { type: 'daily' }, currentStreak: 12, longestStreak: 20,
    totalCompletions: 65, completionRate: 92, targetCount: 1, unit: 'times',
  },
  {
    _id: '3', name: 'Meditate', icon: '🧘', color: '#10B981', category: 'health',
    frequency: { type: 'daily' }, currentStreak: 3, longestStreak: 15,
    totalCompletions: 28, completionRate: 73, targetCount: 1, unit: 'times',
  },
  {
    _id: '4', name: 'Drink 8 Glasses', icon: '💧', color: '#06B6D4', category: 'health',
    frequency: { type: 'daily' }, currentStreak: 5, longestStreak: 18,
    totalCompletions: 55, completionRate: 78, targetCount: 8, unit: 'glasses',
  },
];

const HabitCard = ({ habit, onToggle }: any) => {
  const [completed, setCompleted] = useState(false);

  const handleToggle = () => {
    setCompleted(!completed);
    onToggle?.(habit, !completed);
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.xl,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: completed ? `${habit.color}30` : 'rgba(255,255,255,0.05)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Icon */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: `${habit.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: completed ? COLORS.textSecondary : COLORS.textPrimary,
                fontSize: FONT_SIZE.base,
                fontWeight: '600',
                textDecorationLine: completed ? 'line-through' : 'none',
              }}
            >
              {habit.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Text style={{ color: COLORS.accentRose, fontSize: FONT_SIZE.xs }}>
                🔥 {habit.currentStreak} day streak
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                Best: {habit.longestStreak}
              </Text>
            </View>
          </View>

          {/* Complete button */}
          <TouchableOpacity
            onPress={handleToggle}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: completed ? `${habit.color}20` : COLORS.surfaceLight,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: completed ? habit.color : COLORS.border,
            }}
          >
            {completed && <Ionicons name="checkmark" size={18} color={habit.color} />}
          </TouchableOpacity>
        </View>

        {/* Completion rate bar */}
        <ProgressBar
          progress={habit.completionRate}
          color={habit.color}
          height={4}
          style={{ marginTop: 12 }}
          showValue
        />
      </View>
    </Animated.View>
  );
};

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const [habits] = useState(SAMPLE_HABITS);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = ['all', 'daily', 'weekly', 'monthly'];

  const filtered = habits.filter((h) => {
    if (activeFilter === 'all') return true;
    return h.frequency.type === activeFilter;
  });

  const stats = {
    totalHabits: habits.length,
    avgStreak: Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length),
    avgCompletion: Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length),
  };

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' }}>
              Habits
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginTop: 2 }}>
              Build consistent routines
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: COLORS.primary,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          {[
            { label: 'Total Habits', value: stats.totalHabits, emoji: '✅' },
            { label: 'Avg Streak', value: `${stats.avgStreak}d`, emoji: '🔥' },
            { label: 'Avg Rate', value: `${stats.avgCompletion}%`, emoji: '📊' },
          ].map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1, backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.lg, padding: 12, alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{stat.emoji}</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                {stat.value}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: BORDER_RADIUS.full,
                backgroundColor: activeFilter === f ? COLORS.primary : COLORS.surface,
              }}
            >
              <Text
                style={{
                  color: activeFilter === f ? '#fff' : COLORS.textSecondary,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: '500',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.base,
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((habit) => (
          <HabitCard key={habit._id} habit={habit} />
        ))}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🌱</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, textAlign: 'center' }}>
              No habits yet.{'\n'}Create your first habit!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
