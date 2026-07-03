import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useWaterStore } from '@/store/waterStore';
import ProgressRing from '@/components/ui/ProgressRing';
import { WATER_AMOUNTS } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function WaterTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { todayLog, goal, totalAmount, remaining, percentage, goalAchieved, fetchToday, addWater, removeEntry } = useWaterStore();

  const rippleScale = useSharedValue(1);

  useEffect(() => {
    fetchToday();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      rippleScale.value = withSpring(1.05, {}, () => {
        rippleScale.value = withSpring(1);
      });
      const result = await addWater(amount);
      if (result.goalAchieved && result.xpEarned > 0) {
        Toast.show({
          type: 'success',
          text1: '🎉 Water Goal Achieved!',
          text2: `+${result.xpEarned} XP earned!`,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: `💧 +${amount}ml added`,
          text2: `${remaining - amount > 0 ? `${remaining - amount}ml remaining` : 'Goal reached!'}`,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to log water',
      });
    }
  };

  const handleRemove = (entryId: string, amount: number) => {
    Alert.alert('Remove Entry', `Remove ${amount}ml entry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeEntry(entryId),
      },
    ]);
  };

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={['#0D2040', colors.background]}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
            Water Tracker 💧
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main ring */}
        <Animated.View style={[{ alignItems: 'center' }, ringStyle]}>
          <ProgressRing
            progress={percentage}
            size={180}
            strokeWidth={16}
            gradient={['#06B6D4', '#3B82F6']}
            animated
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>💧</Text>
              <Text style={{ color: '#fff', fontSize: FONT_SIZE['2xl'], fontWeight: '800', marginTop: 4 }}>
                {Math.round(totalAmount / 100) / 10}L
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZE.xs }}>
                of {goal / 1000}L goal
              </Text>
            </View>
          </ProgressRing>

          <View style={{ flexDirection: 'row', gap: 24, marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#06B6D4', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                {Math.round(remaining / 100) / 10}L
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs }}>Remaining</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: goalAchieved ? '#10B981' : 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                {goalAchieved ? '✅ Done' : `${percentage}%`}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs }}>Progress</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZE.lg, fontWeight: '700' }}>
                {todayLog?.entries?.length || 0}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FONT_SIZE.xs }}>Entries</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick add buttons */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Quick Add
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {WATER_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => handleAddWater(amount)}
                style={{
                  flex: 1, minWidth: '28%',
                  backgroundColor: colors.surface,
                  borderRadius: 14, padding: 14, alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)',
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{amount >= 500 ? '🥤' : '🥛'}</Text>
                <Text style={{ color: '#06B6D4', fontSize: 14, fontWeight: '700' }}>{amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Today's log */}
        {todayLog?.entries && todayLog.entries.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Today's Log
            </Text>
            {[...todayLog.entries].reverse().map((entry) => (
              <TouchableOpacity
                key={entry._id}
                onLongPress={() => handleRemove(entry._id, entry.amount)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: colors.surface,
                  borderRadius: 14, padding: 14, marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 14 }}>💧</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>{entry.amount}ml</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
                    {entry.source} • {new Date(entry.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
