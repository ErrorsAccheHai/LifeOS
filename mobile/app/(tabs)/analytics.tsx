import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useTheme } from '@/context/ThemeContext';
import type { AnalyticsData } from '@/types';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;
type Period = 'week' | 'month' | 'year';

const PERIOD_POINTS: Record<Period, number> = { week: 7, month: 30, year: 12 };

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [period, setPeriod] = useState<Period>('week');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (o = 1) => `rgba(99,102,241,${o})`,
    labelColor: (o = 1) => `rgba(160,160,192,${o})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  };

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(false);
    try {
      const r = await api.get(`${ENDPOINTS.ANALYTICS.OVERVIEW}?period=${period}`);
      setData(r.data.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  }, [fetchData]);

  // Format date labels based on period
  const fmtLabel = (d: string, index: number, total: number) => {
    const dt = new Date(d);
    if (period === 'week') return ['Su','Mo','Tu','We','Th','Fr','Sa'][dt.getDay()];
    if (period === 'month') {
      // Show every 5th label
      if (index % 5 !== 0) return '';
      return `${dt.getDate()}`;
    }
    return ['J','F','M','A','M','J','J','A','S','O','N','D'][dt.getMonth()];
  };

  const pts = PERIOD_POINTS[period];

  const getChartData = (arr: any[], valueKey: string, transform?: (v: number) => number) => {
    const sliced = arr.slice(-pts);
    const values = sliced.map(d => {
      const raw = d[valueKey] || 0;
      return transform ? transform(raw) : raw;
    });
    const labels = sliced.map((d, i) => fmtLabel(d.date, i, sliced.length));
    // Ensure at least 2 data points for charts
    if (values.length < 2) {
      return { labels: ['','','','','','',''], datasets: [{ data: [0,0,0,0,0,0,0] }] };
    }
    return { labels, datasets: [{ data: values }] };
  };

  const StatBox = ({ label, value, emoji, color }: { label: string; value: string | number; emoji: string; color: string }) => (
    <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );

  const ChartCard = ({
    title, children, isEmpty,
  }: { title: string; children: React.ReactNode; isEmpty?: boolean }) => (
    <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}>
      <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>{title}</Text>
      {isEmpty ? (
        <View style={styles.chartEmpty}>
          <Text style={[styles.chartEmptyText, { color: colors.textMuted }]}>No data yet</Text>
        </View>
      ) : children}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#1A1A2E', '#0F0F23'] : ['#EEEEF8', '#F8F9FF']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>Analytics</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Track your progress</Text>
        <View style={[styles.periodBar, { backgroundColor: colors.surface }]}>
          {(['week', 'month', 'year'] as Period[]).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodBtn, period === p && { backgroundColor: colors.primary }]}
            >
              <Text style={[
                styles.periodText,
                { color: colors.textMuted },
                period === p && { color: '#fff' },
              ]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading analytics...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>📊</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Failed to load analytics
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => fetchData()}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {data && (
            <>
              {/* Summary stats */}
              <View style={styles.statRow}>
                <StatBox label="Life Score" value={data.summary.avgLifeScore} emoji="⭐" color="#F59E0B" />
                <StatBox label="Total XP" value={data.summary.totalXP.toLocaleString()} emoji="⚡" color="#6366F1" />
                <StatBox label="Active Days" value={data.summary.activeDays} emoji="🔥" color="#F43F5E" />
              </View>
              <View style={[styles.statRow, { marginTop: 10 }]}>
                <StatBox label="Workouts" value={data.summary.totalWorkouts} emoji="💪" color="#EF4444" />
                <StatBox label="Study Hrs" value={data.summary.totalStudyHours} emoji="📚" color="#6366F1" />
                <StatBox label="Avg Sleep" value={`${data.summary.avgSleepHours}h`} emoji="😴" color="#3B82F6" />
              </View>

              {/* Life Score chart */}
              <ChartCard title="⭐ Life Score" isEmpty={!data.charts.lifeScore?.length}>
                <LineChart
                  data={getChartData(data.charts.lifeScore, 'score')}
                  width={CHART_WIDTH}
                  height={160}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                />
              </ChartCard>

              {/* Sleep chart — convert minutes → hours */}
              <ChartCard title="😴 Sleep (hours)" isEmpty={!data.charts.sleep?.length}>
                <BarChart
                  data={getChartData(data.charts.sleep, 'duration', v => Math.round((v / 60) * 10) / 10)}
                  width={CHART_WIDTH}
                  height={160}
                  yAxisLabel=""
                  yAxisSuffix="h"
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(59,130,246,${o})` }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  withInnerLines={false}
                />
              </ChartCard>

              {/* Water chart */}
              <ChartCard title="💧 Water (L)" isEmpty={!data.charts.water?.length}>
                <LineChart
                  data={getChartData(data.charts.water, 'amount', v => Math.round((v / 1000) * 10) / 10)}
                  width={CHART_WIDTH}
                  height={160}
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(6,182,212,${o})` }}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                />
              </ChartCard>

              {/* Study chart — convert minutes → hours */}
              {data.charts.study?.length > 0 && (
                <ChartCard title="📚 Study (hours)">
                  <BarChart
                    data={getChartData(data.charts.study, 'minutes', v => Math.round((v / 60) * 10) / 10)}
                    width={CHART_WIDTH}
                    height={160}
                    yAxisLabel=""
                    yAxisSuffix="h"
                    chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(99,102,241,${o})` }}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    withInnerLines={false}
                  />
                </ChartCard>
              )}

              {/* Weight chart */}
              {data.charts.weight?.length > 0 && (
                <ChartCard title="⚖️ Weight (kg)">
                  <LineChart
                    data={getChartData(data.charts.weight, 'weight')}
                    width={CHART_WIDTH}
                    height={160}
                    chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(16,185,129,${o})` }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={false}
                  />
                </ChartCard>
              )}

              {/* XP chart */}
              <ChartCard title="⚡ XP Earned" isEmpty={!data.charts.xp?.length}>
                <BarChart
                  data={getChartData(data.charts.xp, 'xp')}
                  width={CHART_WIDTH}
                  height={160}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(245,158,11,${o})` }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  withInnerLines={false}
                />
              </ChartCard>
            </>
          )}

          {!data && (
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>📊</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No analytics yet.{'\n'}Start tracking to see insights!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 16 },
  periodBar: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  periodText: { fontSize: 13, fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  statRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, textAlign: 'center' },
  chartCard: {
    borderRadius: 16, padding: 16, marginTop: 16,
    borderWidth: 1, overflow: 'hidden',
  },
  chartTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  chart: { borderRadius: 12, marginLeft: -8 },
  chartEmpty: { height: 80, alignItems: 'center', justifyContent: 'center' },
  chartEmptyText: { fontSize: 13 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 999, marginTop: 8 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
