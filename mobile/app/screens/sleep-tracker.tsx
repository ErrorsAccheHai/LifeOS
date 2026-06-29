import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import Button from '@/components/ui/Button';
import ProgressRing from '@/components/ui/ProgressRing';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { SleepLog } from '@/types';

const QUALITY_OPTIONS = [
  { value: 1, label: 'Terrible', emoji: '😫' },
  { value: 2, label: 'Poor', emoji: '😞' },
  { value: 3, label: 'Okay', emoji: '😐' },
  { value: 4, label: 'Good', emoji: '😊' },
  { value: 5, label: 'Excellent', emoji: '😄' },
];

export default function SleepTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [todaySleep, setTodaySleep] = useState<SleepLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(0);
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    try {
      const response = await api.get(ENDPOINTS.SLEEP.TODAY);
      const log = response.data.data.log;
      setTodaySleep(log);
      if (log?.bedTime && !log?.wakeTime) {
        setIsSleeping(true);
      }
    } catch {}
  };

  const handleStartSleep = async () => {
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.SLEEP.START, {
        bedTime: new Date().toISOString(),
      });
      setTodaySleep(response.data.data.log);
      setIsSleeping(true);
      Toast.show({ type: 'success', text1: '😴 Sleep started', text2: 'Sweet dreams!' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSleep = async () => {
    if (!quality) {
      Toast.show({ type: 'error', text1: 'Rate your sleep', text2: 'Please select sleep quality' });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.SLEEP.END, {
        wakeTime: new Date().toISOString(),
        quality,
      });
      const { xpEarned, sleepScore } = response.data.data;
      setTodaySleep(response.data.data.log);
      setIsSleeping(false);
      Toast.show({
        type: 'success',
        text1: '🌅 Good morning!',
        text2: `Sleep score: ${sleepScore}/100 • +${xpEarned} XP`,
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const sleepDuration = todaySleep?.duration
    ? `${Math.floor(todaySleep.duration / 60)}h ${todaySleep.duration % 60}m`
    : '--';

  const sleepScore = todaySleep?.score || 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={['#030318', '#0A0A2A', COLORS.background]}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: SPACING.base,
          paddingBottom: 32,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>Sleep Tracker 😴</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Sleep Score Ring */}
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center' }}>
          <ProgressRing
            progress={sleepScore}
            size={160}
            strokeWidth={14}
            gradient={['#3B82F6', '#6366F1']}
            animated
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>🌙</Text>
              <Text style={{ color: '#fff', fontSize: FONT_SIZE.xl, fontWeight: '800', marginTop: 4 }}>
                {todaySleep?.score ? `${todaySleep.score}` : '--'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs }}>
                Sleep Score
              </Text>
            </View>
          </ProgressRing>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 24, marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#3B82F6', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                {sleepDuration}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.xs }}>Duration</Text>
            </View>
            {todaySleep?.bedTime && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  {format(new Date(todaySleep.bedTime), 'h:mm a')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.xs }}>Bedtime</Text>
              </View>
            )}
            {todaySleep?.wakeTime && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  {format(new Date(todaySleep.wakeTime), 'h:mm a')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: FONT_SIZE.xs }}>Wake Time</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingTop: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          {isSleeping ? (
            <View
              style={{
                backgroundColor: 'rgba(59,130,246,0.15)',
                borderRadius: BORDER_RADIUS.xl,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(59,130,246,0.3)',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>💤</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 4 }}>
                Currently Sleeping
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm }}>
                Started at {todaySleep?.bedTime ? format(new Date(todaySleep.bedTime), 'h:mm a') : '--'}
              </Text>
            </View>
          ) : todaySleep?.wakeTime ? (
            <View
              style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                borderRadius: BORDER_RADIUS.xl,
                padding: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(16,185,129,0.3)',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>✅</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                Sleep logged for today
              </Text>
              <Text style={{ color: COLORS.accentEmerald, fontSize: FONT_SIZE.base, marginTop: 4, fontWeight: '600' }}>
                Score: {todaySleep.score}/100 • {sleepDuration}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Quality selection (only when ending sleep) */}
        {isSleeping && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 24 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              How did you sleep?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {QUALITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setQuality(opt.value)}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    padding: 10,
                    borderRadius: BORDER_RADIUS.lg,
                    backgroundColor: quality === opt.value ? 'rgba(99,102,241,0.2)' : COLORS.surface,
                    borderWidth: 1.5,
                    borderColor: quality === opt.value ? COLORS.primary : COLORS.border,
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{opt.emoji}</Text>
                  <Text style={{ color: quality === opt.value ? COLORS.primary : COLORS.textMuted, fontSize: 10, fontWeight: '500', textAlign: 'center' }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Action button */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          {!todaySleep?.bedTime ? (
            <Button
              title="Start Sleep 🌙"
              onPress={handleStartSleep}
              loading={loading}
              gradient={['#3B82F6', '#6366F1']}
              fullWidth
              size="lg"
            />
          ) : isSleeping ? (
            <Button
              title="Wake Up 🌅"
              onPress={handleEndSleep}
              loading={loading}
              gradient={['#F59E0B', '#F97316']}
              fullWidth
              size="lg"
            />
          ) : (
            <View
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.xl,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
                Sleep logged ✓ See you tonight!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Sleep tips */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 32 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
            Sleep Tips 💡
          </Text>
          {[
            { icon: '📵', tip: 'Put your phone away 30 minutes before bed' },
            { icon: '🌡️', tip: 'Keep your room cool (18-20°C is ideal)' },
            { icon: '⏰', tip: 'Aim for 7-8 hours of sleep consistently' },
            { icon: '🧘', tip: 'Try deep breathing or meditation to wind down' },
          ].map((item) => (
            <View
              key={item.tip}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.lg,
                padding: 14,
                marginBottom: 10,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, flex: 1, lineHeight: 20 }}>
                {item.tip}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
