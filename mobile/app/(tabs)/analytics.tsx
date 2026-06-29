import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart, ContributionGraph } from 'react-native-chart-kit';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { COLORS, FONT_SIZE, BORDER_RADIUS, SPACING, GRADIENTS } from '@/constants/theme';
import type { AnalyticsData } from '@/types';

const { width } = Dimensions.get('window');
const chartWidth = width - SPACING.base * 2 - 20;

type Period = 'week' | 'month' | 'year';

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#1E1E3A',
  backgroundGradientTo: '#16163A',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(160, 160, 192, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#6366F1' },
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sleep' | 'water' | 'workout' | 'study'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${ENDPOINTS.ANALYTICS.OVERVIEW}?period=${period}`);
      setData(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'week') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    if (period === 'month') return `${d.getDate()}`;
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  };

  const lifeScoreData = data?.charts?.lifeScore || [];
  const sleepData = data?.charts?.sleep || [];
  const waterData = data?.charts?.water || [];
  const workoutData = data?.charts?.workout || [];
  const studyData = data?.charts?.study || [];
  const xpData = data?.charts?.xp || [];

  const chartLabels = (arr: any[]) =>
    arr.length > 0
      ? arr.map((d) => formatChartDate(d.date)).slice(-7)
      : ['', '', '', '', '', '', ''];

  const StatBox = ({ label, value, color, emoji }: any) => (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: 14,
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{ color: color || COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
        {value}
      </Text>
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );

  const SectionChart = ({ title, emoji, children }: any) => (
    <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: 20 }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 12 }}>
        {emoji} {title}
      </Text>
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.xl,
          padding: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </Animated.View>
  );

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
        <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '800', marginBottom: 4 }}>
          Analytics
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, marginBottom: 16 }}>
          Track your progress over time
        </Text>

        {/* Period selector */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: COLORS.surface,
            borderRadius: BORDER_RADIUS.lg,
            padding: 4,
          }}
        >
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              onPress={() => setPeriod(p.value)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: BORDER_RADIUS.md,
                backgroundColor: period === p.value ? COLORS.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: period === p.value ? '#fff' : COLORS.textMuted,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: '600',
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.base,
          paddingTop: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        {data && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <StatBox
                label="Life Score"
                value={data.summary.avgLifeScore}
                emoji="⭐"
                color={COLORS.accentAmber}
              />
              <StatBox
                label="XP Earned"
                value={data.summary.totalXP.toLocaleString()}
                emoji="⚡"
                color={COLORS.primary}
              />
              <StatBox
                label="Active Days"
                value={data.summary.activeDays}
                emoji="🔥"
                color={COLORS.accentRose}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <StatBox
                label="Workouts"
                value={data.summary.totalWorkouts}
                emoji="💪"
                color={COLORS.error}
              />
              <StatBox
                label="Study Hours"
                value={data.summary.totalStudyHours}
                emoji="📚"
                color={COLORS.primary}
              />
              <StatBox
                label="Avg Sleep"
                value={`${data.summary.avgSleepHours}h`}
                emoji="😴"
                color={COLORS.accentBlue}
              />
            </View>
          </Animated.View>
        )}

        {/* Life Score Chart */}
        {lifeScoreData.length > 0 && (
          <SectionChart title="Life Score" emoji="⭐">
            <LineChart
              data={{
                labels: chartLabels(lifeScoreData),
                datasets: [{ data: lifeScoreData.slice(-7).map((d) => d.score || 0) }],
              }}
              width={chartWidth}
              height={160}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              }}
              bezier
              style={{ borderRadius: 12, marginLeft: -16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </SectionChart>
        )}

        {/* Sleep Chart */}
        {sleepData.length > 0 && (
          <SectionChart title="Sleep Duration (hours)" emoji="😴">
            <BarChart
              data={{
                labels: chartLabels(sleepData),
                datasets: [{ data: sleepData.slice(-7).map((d) => d.duration || 0) }],
              }}
              width={chartWidth}
              height={160}
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              }}
              style={{ borderRadius: 12, marginLeft: -16 }}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </SectionChart>
        )}

        {/* Water Chart */}
        {waterData.length > 0 && (
          <SectionChart title="Water Intake (L)" emoji="💧">
            <LineChart
              data={{
                labels: chartLabels(waterData),
                datasets: [{ data: waterData.slice(-7).map((d) => Math.round((d.amount || 0) / 100) / 10) }],
              }}
              width={chartWidth}
              height={160}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`,
              }}
              bezier
              style={{ borderRadius: 12, marginLeft: -16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </SectionChart>
        )}

        {/* Workout Chart */}
        {workoutData.length > 0 && (
          <SectionChart title="Workout Minutes" emoji="🏋️">
            <BarChart
              data={{
                labels: chartLabels(workoutData),
                datasets: [{ data: workoutData.slice(-7).map((d) => d.duration || 0) }],
              }}
              width={chartWidth}
              height={160}
              yAxisLabel=""
              yAxisSuffix="m"
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              }}
              style={{ borderRadius: 12, marginLeft: -16 }}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </SectionChart>
        )}

        {/* Study Chart */}
        {studyData.length > 0 && (
          <SectionChart title="Study Hours" emoji="📚">
            <LineChart
              data={{
                labels: chartLabels(studyData),
                datasets: [{ data: studyData.slice(-7).map((d) => d.hours || 0) }],
              }}
              width={chartWidth}
              height={160}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              }}
              bezier
              style={{ borderRadius: 12, marginLeft: -16 }}
              withInnerLines={false}
              withOuterLines={false}
            />
          </SectionChart>
        )}

        {/* XP Chart */}
        {xpData.length > 0 && (
          <SectionChart title="XP Earned" emoji="⚡">
            <BarChart
              data={{
                labels: chartLabels(xpData),
                datasets: [{ data: xpData.slice(-7).map((d) => d.xp || 0) }],
              }}
              width={chartWidth}
              height={160}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
              }}
              style={{ borderRadius: 12, marginLeft: -16 }}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </SectionChart>
        )}

        {!data && !loading && (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📊</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
              No analytics data yet.{'\n'}Start tracking to see insights!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
