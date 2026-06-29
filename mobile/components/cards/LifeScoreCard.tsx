import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import ProgressRing from '@/components/ui/ProgressRing';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '@/constants/theme';
import type { ScoreGrade } from '@/types';

interface LifeScoreCardProps {
  score: number;
  grade: ScoreGrade;
  completionRate: number;
  activitiesCompleted: number;
  activitiesTotal: number;
  xpEarned: number;
  streak: number;
  onPress?: () => void;
}

const LifeScoreCard: React.FC<LifeScoreCardProps> = ({
  score,
  grade,
  completionRate,
  activitiesCompleted,
  activitiesTotal,
  xpEarned,
  streak,
  onPress,
}) => {
  const getGradeColor = () => {
    const colors: Record<string, string[]> = {
      S: ['#FFD700', '#FFA500'],
      A: ['#10B981', '#06B6D4'],
      B: ['#3B82F6', '#6366F1'],
      C: ['#F97316', '#F59E0B'],
      D: ['#EF4444', '#F97316'],
      F: ['#6B7280', '#9CA3AF'],
    };
    return colors[grade.grade] || GRADIENTS.primary;
  };

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={SHADOWS.lg}>
        <LinearGradient
          colors={['#1E1E3A', '#16163A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: BORDER_RADIUS['2xl'],
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.2)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left: Score Ring */}
            <ProgressRing
              progress={score}
              size={100}
              strokeWidth={10}
              gradient={getGradeColor() as [string, string]}
              animated
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800' }}>
                  {score}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Life Score</Text>
              </View>
            </ProgressRing>

            {/* Center: Grade */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <LinearGradient
                colors={getGradeColor() as [string, string]}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: FONT_SIZE['2xl'], fontWeight: '800' }}>
                  {grade.grade}
                </Text>
              </LinearGradient>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                {grade.label}
              </Text>
            </View>

            {/* Right: Stats */}
            <View style={{ alignItems: 'flex-end', gap: 12 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  {activitiesCompleted}/{activitiesTotal}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Activities</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: COLORS.accentAmber, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  +{xpEarned} XP
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Earned Today</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: COLORS.accentRose, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  🔥 {streak}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Day Streak</Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs }}>
                Daily routine completion
              </Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.xs, fontWeight: '600' }}>
                {Math.round(completionRate)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
              <LinearGradient
                colors={getGradeColor() as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${Math.min(completionRate, 100)}%`,
                  borderRadius: 3,
                }}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LifeScoreCard;
