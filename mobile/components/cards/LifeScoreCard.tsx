import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ProgressRing from '@/components/ui/ProgressRing';
import { useTheme } from '@/context/ThemeContext';
import type { ScoreGrade } from '@/types';

interface Props {
  score: number;
  grade: ScoreGrade;
  completionRate: number;
  activitiesCompleted: number;
  activitiesTotal: number;
  xpEarned: number;
  streak: number;
  onPress?: () => void;
}

const GRADE_COLORS: Record<string, [string, string]> = {
  S: ['#FFD700', '#FFA500'],
  A: ['#10B981', '#06B6D4'],
  B: ['#3B82F6', '#6366F1'],
  C: ['#F97316', '#F59E0B'],
  D: ['#EF4444', '#F97316'],
  F: ['#6B7280', '#9CA3AF'],
};

const LifeScoreCard: React.FC<Props> = ({
  score, grade, completionRate, activitiesCompleted,
  activitiesTotal, xpEarned, streak, onPress,
}) => {
  const { colors } = useTheme();
  const gradeColors = GRADE_COLORS[grade?.grade] || ['#6366F1', '#8B5CF6'];

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={[colors.surface, colors.backgroundSecondary]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24, padding: 20,
            borderWidth: 1, borderColor: `${colors.primary}25`,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2, shadowRadius: 16, elevation: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Score Ring */}
            <ProgressRing
              progress={score}
              size={100}
              strokeWidth={10}
              gradient={gradeColors}
              animated
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '800' }}>
                  {score}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Score</Text>
              </View>
            </ProgressRing>

            {/* Grade badge */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <LinearGradient
                colors={gradeColors}
                style={{
                  width: 52, height: 52, borderRadius: 16,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
                  {grade?.grade || 'B'}
                </Text>
              </LinearGradient>
              <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                {grade?.label || 'Good'}
              </Text>
            </View>

            {/* Stats */}
            <View style={{ alignItems: 'flex-end', gap: 10 }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.textPrimary, fontSize: 17, fontWeight: '700' }}>
                  {activitiesCompleted}/{activitiesTotal}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Activities</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#F59E0B', fontSize: 17, fontWeight: '700' }}>
                  +{xpEarned} XP
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Today</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#F43F5E', fontSize: 17, fontWeight: '700' }}>
                  🔥 {streak}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 10 }}>Streak</Text>
              </View>
            </View>
          </View>

          {/* Completion bar */}
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Daily routine completion
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '600' }}>
                {Math.round(completionRate)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: 'hidden' }}>
              <LinearGradient
                colors={gradeColors}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${Math.min(completionRate, 100)}%`, borderRadius: 3 }}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default LifeScoreCard;
