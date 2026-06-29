import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import Button from '@/components/ui/Button';
import ProgressRing from '@/components/ui/ProgressRing';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { StudyLog } from '@/types';

const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

export default function StudyTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [todayLog, setTodayLog] = useState<StudyLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [isLibraryIn, setIsLibraryIn] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(POMODORO_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef<any>(null);

  // Pulse animation for active session
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (timerRunning) {
      pulse.value = withRepeat(withTiming(1.05, { duration: 1000 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [timerRunning]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    fetchToday();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            handlePomodoroComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const fetchToday = async () => {
    try {
      const response = await api.get(ENDPOINTS.STUDY.TODAY);
      const log = response.data.data.log;
      setTodayLog(log);
      if (log?.isLibraryCheckedIn) setIsLibraryIn(true);
    } catch {}
  };

  const handlePomodoroComplete = () => {
    setPomodoroCount((prev) => prev + 1);
    Toast.show({ type: 'success', text1: '🍅 Pomodoro complete!', text2: 'Take a break!' });
    const next = pomodoroCount % 4 === 3 ? 'long_break' : 'short_break';
    setTimerMode(next);
    setTimerSeconds(next === 'long_break' ? LONG_BREAK : SHORT_BREAK);
  };

  const startTimer = () => {
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    const duration = timerMode === 'focus' ? POMODORO_DURATION : timerMode === 'short_break' ? SHORT_BREAK : LONG_BREAK;
    setTimerSeconds(duration);
  };

  const switchMode = (mode: typeof timerMode) => {
    setTimerMode(mode);
    setTimerRunning(false);
    const duration = mode === 'focus' ? POMODORO_DURATION : mode === 'short_break' ? SHORT_BREAK : LONG_BREAK;
    setTimerSeconds(duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerMaxDuration = timerMode === 'focus' ? POMODORO_DURATION : timerMode === 'short_break' ? SHORT_BREAK : LONG_BREAK;
  const timerProgress = ((timerMaxDuration - timerSeconds) / timerMaxDuration) * 100;

  const handleStartSession = async () => {
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.STUDY.START, {
        subject: subject.trim() || 'Study Session',
        type: 'deep_work',
      });
      const sessionId = response.data.data.sessionId;
      setActiveSessionId(sessionId);
      setTodayLog(response.data.data.log);
      Toast.show({ type: 'success', text1: '📚 Study session started!' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSessionId) return;
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.STUDY.END, { sessionId: activeSessionId });
      const { totalDuration, xpEarned } = response.data.data;
      setTodayLog(response.data.data.log);
      setActiveSessionId(null);
      Toast.show({
        type: 'success',
        text1: '✅ Session ended!',
        text2: `${Math.round(totalDuration / 60 * 10) / 10}h studied • +${xpEarned} XP`,
      });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLibraryToggle = async () => {
    setLoading(true);
    try {
      if (!isLibraryIn) {
        await api.post(ENDPOINTS.STUDY.LIBRARY_IN);
        setIsLibraryIn(true);
        Toast.show({ type: 'success', text1: '📚 Library check-in!', text2: 'Happy studying!' });
      } else {
        const response = await api.post(ENDPOINTS.STUDY.LIBRARY_OUT);
        setIsLibraryIn(false);
        const { duration } = response.data.data;
        setTodayLog(response.data.data.log);
        Toast.show({ type: 'success', text1: '✅ Library check-out!', text2: `${duration} minutes studied` });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const totalH = todayLog ? Math.round(todayLog.totalDuration / 60 * 10) / 10 : 0;
  const goal = todayLog?.goal || 120;
  const goalProgress = Math.min((((todayLog?.totalDuration || 0) / goal) * 100), 100);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={['#0F0F2A', COLORS.background]}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: SPACING.base, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>Study Tracker 📚</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Pomodoro Timer */}
        <Animated.View style={[{ alignItems: 'center' }, pulseStyle]}>
          <ProgressRing
            progress={timerProgress}
            size={160}
            strokeWidth={12}
            gradient={timerMode === 'focus' ? ['#6366F1', '#8B5CF6'] : ['#10B981', '#06B6D4']}
            animated={false}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: -1 }}>
                {formatTime(timerSeconds)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs, textTransform: 'capitalize' }}>
                {timerMode.replace('_', ' ')}
              </Text>
            </View>
          </ProgressRing>
        </Animated.View>

        {/* Timer mode selector */}
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {[
            { mode: 'focus', label: '🎯 Focus', duration: '25m' },
            { mode: 'short_break', label: '☕ Break', duration: '5m' },
            { mode: 'long_break', label: '🌴 Long', duration: '15m' },
          ].map((item) => (
            <TouchableOpacity
              key={item.mode}
              onPress={() => switchMode(item.mode as typeof timerMode)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: BORDER_RADIUS.full,
                backgroundColor: timerMode === item.mode ? 'rgba(255,255,255,0.15)' : 'transparent',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.sm }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timer controls */}
        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <TouchableOpacity
            onPress={resetTimer}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={timerRunning ? pauseTimer : startTimer}
            style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={timerRunning ? 'pause' : 'play'} size={26} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' }}>
              🍅{pomodoroCount}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingTop: 20, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Today stats */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
          <LinearGradient
            colors={['#1E1E3A', '#16163A']}
            style={{ borderRadius: BORDER_RADIUS.xl, padding: 16 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm }}>Today's Study</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                {totalH}h / {Math.round(goal / 60)}h goal
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden' }}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${goalProgress}%`, borderRadius: 4 }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>{totalH}h</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Studied</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: COLORS.accentAmber, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  {todayLog?.sessions?.length || 0}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Sessions</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: COLORS.accentEmerald, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                  {todayLog?.goalAchieved ? '✅' : '⏳'}
                </Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>Goal</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Subject input */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 16 }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500', marginBottom: 8 }}>
            Subject / Topic
          </Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Mathematics, Coding, History..."
            placeholderTextColor={COLORS.textMuted}
            style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, color: COLORS.textPrimary, fontSize: FONT_SIZE.base, padding: 14 }}
          />
        </Animated.View>

        {/* Session control */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 16 }}>
          {!activeSessionId ? (
            <Button
              title="Start Deep Work Session 🎯"
              onPress={handleStartSession}
              loading={loading}
              gradient={GRADIENTS.primary}
              fullWidth
              size="lg"
            />
          ) : (
            <Button
              title="End Session ✅"
              onPress={handleEndSession}
              loading={loading}
              gradient={['#10B981', '#06B6D4']}
              fullWidth
              size="lg"
            />
          )}
        </Animated.View>

        {/* Library check-in */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity
            onPress={handleLibraryToggle}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isLibraryIn ? 'rgba(16,185,129,0.15)' : COLORS.surface,
              borderRadius: BORDER_RADIUS.xl,
              padding: 16,
              borderWidth: 1,
              borderColor: isLibraryIn ? 'rgba(16,185,129,0.3)' : COLORS.border,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>🏛️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                {isLibraryIn ? 'Checked In to Library' : 'Library Check-In'}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                {isLibraryIn ? 'Tap to check out' : 'Track your library study time'}
              </Text>
            </View>
            <View
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: isLibraryIn ? COLORS.accentEmerald : COLORS.surfaceLight,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons
                name={isLibraryIn ? 'exit-outline' : 'enter-outline'}
                size={18}
                color={isLibraryIn ? '#fff' : COLORS.textMuted}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
