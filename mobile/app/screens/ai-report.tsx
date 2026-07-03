import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import type { Report } from '@/types';

type ReportType = 'daily' | 'weekly' | 'monthly';

const REPORT_TYPES: { label: string; value: ReportType; emoji: string }[] = [
  { label: 'Daily', value: 'daily', emoji: '📅' },
  { label: 'Weekly', value: 'weekly', emoji: '📆' },
  { label: 'Monthly', value: 'monthly', emoji: '🗓️' },
];

export default function AIReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeType, setActiveType] = useState<ReportType>('daily');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    fetchReport();
    fetchSuggestions();
  }, [activeType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${ENDPOINTS.AI_COACH.REPORT}?type=${activeType}`);
      setReport(response.data.data.report);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get(ENDPOINTS.AI_COACH.SUGGESTIONS);
      setSuggestions(response.data.data.suggestions || []);
    } catch {}
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await api.post(ENDPOINTS.AI_COACH.GENERATE, { type: activeType });
      setReport(response.data.data.report);
    } catch {}
    finally {
      setGenerating(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F23' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={22} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
            AI Coach 🤖
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Type selector */}
        <View style={{ flexDirection: 'row', backgroundColor: '#1E1E3A', borderRadius: 16, padding: 4 }}>
          {REPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setActiveType(type.value)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: activeType === type.value ? '#6366F1' : 'transparent',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 14 }}>{type.emoji}</Text>
              <Text style={{ color: activeType === type.value ? '#fff' : '#606080', fontSize: 12, fontWeight: '600' }}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 24 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
              Smart Suggestions ✨
            </Text>
            {suggestions.map((suggestion, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  backgroundColor: '#1E1E3A',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: suggestion.priority === 'high' ? '#EF4444' : '#6366F1',
                  gap: 12,
                }}
              >
                <Text style={{ fontSize: 20 }}>
                  {suggestion.type === 'sleep' ? '😴' :
                   suggestion.type === 'fitness' ? '💪' :
                   suggestion.type === 'hydration' ? '💧' :
                   suggestion.type === 'streak' ? '🔥' :
                   suggestion.type === 'morning' ? '🌅' : '💡'}
                </Text>
                <Text style={{ color: '#A0A0C0', fontSize: 12, flex: 1, lineHeight: 20 }}>
                  {suggestion.message}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Report */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <ActivityIndicator color={'#6366F1'} size="large" />
            <Text style={{ color: '#A0A0C0', marginTop: 12 }}>Loading report...</Text>
          </View>
        ) : report ? (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            {/* Score overview */}
            <LinearGradient
              colors={['#6366F1','#8B5CF6']}
              style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                    {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Life Score
                  </Text>
                  <Text style={{ color: '#fff', fontSize: 48, fontWeight: '800', lineHeight: 52 }}>
                    {report.lifeScore}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 }}>
                    {report.period?.start} — {report.period?.end}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                      {report.summary?.completionRate?.toFixed(0)}%
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Completion</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                      +{report.summary?.xpEarned} XP
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Earned</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* AI Summary */}
            {report.aiSummary && (
              <View
                style={{
                  backgroundColor: '#1E1E3A',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(99,102,241,0.2)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Text style={{ fontSize: 24 }}>🤖</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    AI Analysis
                  </Text>
                </View>
                <Text style={{ color: '#A0A0C0', fontSize: 14, lineHeight: 24 }}>
                  {report.aiSummary}
                </Text>
              </View>
            )}

            {/* Stats breakdown */}
            <View
              style={{
                backgroundColor: '#1E1E3A',
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
                Period Stats
              </Text>
              {[
                { label: 'Activities', value: `${report.summary?.activitiesCompleted}/${report.summary?.activitiesTotal}`, emoji: '✅' },
                { label: 'Sleep', value: `${report.summary?.totalSleepHours?.toFixed(1)}h total`, emoji: '😴' },
                { label: 'Workout', value: `${Math.round((report.summary?.totalWorkoutMinutes || 0) / 60)}h`, emoji: '💪' },
                { label: 'Study', value: `${Math.round((report.summary?.totalStudyMinutes || 0) / 60)}h`, emoji: '📚' },
                { label: 'Water', value: `${((report.summary?.totalWaterMl || 0) / 1000).toFixed(1)}L`, emoji: '💧' },
                { label: 'Streak', value: `${report.summary?.streakDays} days`, emoji: '🔥' },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#2D2D5A',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 18 }}>{stat.emoji}</Text>
                    <Text style={{ color: '#A0A0C0', fontSize: 14 }}>{stat.label}</Text>
                  </View>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🤖</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
              No {activeType} report yet
            </Text>
            <Text style={{ color: '#A0A0C0', fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
              Generate your AI-powered insights for this {activeType}
            </Text>
            <Button
              title={`Generate ${activeType.charAt(0).toUpperCase() + activeType.slice(1)} Report`}
              onPress={handleGenerate}
              loading={generating}
              gradient={['#6366F1','#8B5CF6']}
              size="lg"
            />
          </Animated.View>
        )}

        {report && (
          <Button
            title="Regenerate Report 🔄"
            onPress={handleGenerate}
            loading={generating}
            variant="outline"
            fullWidth
            style={{ marginTop: 16 }}
          />
        )}
      </ScrollView>
    </View>
  );
}
