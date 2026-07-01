import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import type { AnalyticsData } from '@/types';

const { width } = Dimensions.get('window');
const chartW = width - 64;
type Period = 'week' | 'month' | 'year';

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#1E1E3A',
  backgroundGradientTo: '#16163A',
  decimalPlaces: 0,
  color: (o = 1) => `rgba(99,102,241,${o})`,
  labelColor: (o = 1) => `rgba(160,160,192,${o})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#6366F1' },
};

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get(`${ENDPOINTS.ANALYTICS.OVERVIEW}?period=${period}`)
      .then(r => setData(r.data.data))
      .catch(() => {});
  }, [period]);

  const fmtDate = (d: string) => {
    const dt = new Date(d);
    if (period === 'week') return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    if (period === 'month') return `${dt.getDate()}`;
    return ['J','F','M','A','M','J','J','A','S','O','N','D'][dt.getMonth()];
  };

  const labels = (arr: any[]) => arr.length ? arr.slice(-7).map(d => fmtDate(d.date)) : ['','','','','','',''];

  const StatBox = ({ label, value, emoji, color }: any) => (
    <View style={s.statBox}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={s.screen}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Text style={s.title}>Analytics</Text>
        <Text style={s.sub}>Track your progress over time</Text>
        <View style={s.periodBar}>
          {(['week','month','year'] as Period[]).map(p => (
            <TouchableOpacity key={p} onPress={() => setPeriod(p)}
              style={[s.periodBtn, period === p && s.periodBtnActive]}>
              <Text style={[s.periodText, period === p && s.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}>
        {data && (
          <>
            <View style={s.statRow}>
              <StatBox label="Life Score" value={data.summary.avgLifeScore} emoji="⭐" color="#F59E0B" />
              <StatBox label="XP Earned" value={data.summary.totalXP.toLocaleString()} emoji="⚡" color="#6366F1" />
              <StatBox label="Active Days" value={data.summary.activeDays} emoji="🔥" color="#F43F5E" />
            </View>
            <View style={s.statRow}>
              <StatBox label="Workouts" value={data.summary.totalWorkouts} emoji="💪" color="#EF4444" />
              <StatBox label="Study Hrs" value={data.summary.totalStudyHours} emoji="📚" color="#6366F1" />
              <StatBox label="Avg Sleep" value={`${data.summary.avgSleepHours}h`} emoji="😴" color="#3B82F6" />
            </View>

            {/* Charts */}
            {data.charts.lifeScore.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>⭐ Life Score</Text>
                <LineChart
                  data={{ labels: labels(data.charts.lifeScore), datasets: [{ data: data.charts.lifeScore.slice(-7).map(d => d.score || 0) }] }}
                  width={chartW} height={160} chartConfig={chartConfig} bezier
                  style={{ borderRadius: 12, marginLeft: -8 }} withInnerLines={false} withOuterLines={false} />
              </View>
            )}

            {data.charts.sleep.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>😴 Sleep (hours)</Text>
                <BarChart
                  data={{ labels: labels(data.charts.sleep), datasets: [{ data: data.charts.sleep.slice(-7).map(d => d.duration || 0) }] }}
                  width={chartW} height={160} yAxisLabel="" yAxisSuffix="h"
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(59,130,246,${o})` }}
                  style={{ borderRadius: 12, marginLeft: -8 }} showValuesOnTopOfBars withInnerLines={false} />
              </View>
            )}

            {data.charts.water.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>💧 Water (L)</Text>
                <LineChart
                  data={{ labels: labels(data.charts.water), datasets: [{ data: data.charts.water.slice(-7).map(d => Math.round((d.amount || 0) / 100) / 10) }] }}
                  width={chartW} height={160}
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(6,182,212,${o})` }}
                  bezier style={{ borderRadius: 12, marginLeft: -8 }} withInnerLines={false} withOuterLines={false} />
              </View>
            )}

            {data.charts.xp.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>⚡ XP Earned</Text>
                <BarChart
                  data={{ labels: labels(data.charts.xp), datasets: [{ data: data.charts.xp.slice(-7).map(d => d.xp || 0) }] }}
                  width={chartW} height={160} yAxisLabel="" yAxisSuffix=""
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(245,158,11,${o})` }}
                  style={{ borderRadius: 12, marginLeft: -8 }} showValuesOnTopOfBars withInnerLines={false} />
              </View>
            )}
          </>
        )}

        {!data && (
          <View style={s.empty}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📊</Text>
            <Text style={s.emptyText}>No analytics yet.{'\n'}Start tracking to see insights!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { color: '#A0A0C0', fontSize: 13, marginBottom: 16 },
  periodBar: { flexDirection: 'row', backgroundColor: '#1E1E3A', borderRadius: 12, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#6366F1' },
  periodText: { color: '#606080', fontSize: 13, fontWeight: '600' },
  periodTextActive: { color: '#FFFFFF' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statBox: { flex: 1, backgroundColor: '#1E1E3A', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#606080', fontSize: 10, textAlign: 'center' },
  chartCard: { backgroundColor: '#1E1E3A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  chartTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#A0A0C0', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
