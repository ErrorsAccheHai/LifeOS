import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';

export default function ScheduleGoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [schedule, setSchedule] = useState({
    wakeTime: user?.schedule?.wakeTime || '06:00',
    sleepTime: user?.schedule?.sleepTime || '22:00',
    breakfastTime: user?.schedule?.breakfastTime || '08:00',
    lunchTime: user?.schedule?.lunchTime || '13:00',
    dinnerTime: user?.schedule?.dinnerTime || '19:00',
    workoutTime: user?.schedule?.workoutTime || '07:00',
    studyTime: user?.schedule?.studyTime || '09:00',
  });

  const [goals, setGoals] = useState({
    waterGoal: String(user?.goals?.waterGoal || 2500),
    screenTimeGoal: String(user?.goals?.screenTimeGoal || 120),
    stepGoal: String(user?.goals?.stepGoal || 8000),
    sleepGoal: String(user?.goals?.sleepGoal || 480),
    studyGoal: String(user?.goals?.studyGoal || 120),
    calorieGoal: String(user?.goals?.calorieGoal || 2000),
  });

  const updateSchedule = (key: string, value: string) => {
    setSchedule(prev => ({ ...prev, [key]: value }));
  };

  const updateGoal = (key: string, value: string) => {
    setGoals(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, {
        schedule,
        goals: {
          waterGoal: Number(goals.waterGoal),
          screenTimeGoal: Number(goals.screenTimeGoal),
          stepGoal: Number(goals.stepGoal),
          sleepGoal: Number(goals.sleepGoal),
          studyGoal: Number(goals.studyGoal),
          calorieGoal: Number(goals.calorieGoal),
        },
      });
      updateUser(response.data.data.user);
      Toast.show({ type: 'success', text1: '✅ Schedule & Goals saved!' });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title }: { title: string }) => (
    <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, marginTop: 24 }}>
      {title}
    </Text>
  );

  const scheduleItems = [
    { key: 'wakeTime', label: '🌅 Wake Time', hint: '24-hour format' },
    { key: 'sleepTime', label: '😴 Sleep Time', hint: '24-hour format' },
    { key: 'breakfastTime', label: '🍳 Breakfast Time', hint: '' },
    { key: 'lunchTime', label: '🍱 Lunch Time', hint: '' },
    { key: 'dinnerTime', label: '🍽️ Dinner Time', hint: '' },
    { key: 'workoutTime', label: '💪 Workout Time', hint: '' },
    { key: 'studyTime', label: '📚 Study Time', hint: '' },
  ];

  const goalItems = [
    { key: 'waterGoal', label: '💧 Water Goal (ml)', hint: 'Recommended: 2000–3500ml', keyboard: 'numeric' },
    { key: 'calorieGoal', label: '🔥 Calorie Goal (kcal)', hint: 'Daily calorie target', keyboard: 'numeric' },
    { key: 'sleepGoal', label: '😴 Sleep Goal (min)', hint: 'Recommended: 420–480min (7–8h)', keyboard: 'numeric' },
    { key: 'stepGoal', label: '👟 Step Goal', hint: 'WHO recommends 8,000+/day', keyboard: 'numeric' },
    { key: 'studyGoal', label: '📚 Study Goal (min)', hint: 'Daily study target', keyboard: 'numeric' },
    { key: 'screenTimeGoal', label: '📱 Screen Time Limit (min)', hint: 'Recreational screen time', keyboard: 'numeric' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0F23' }}
    >
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={22} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Schedule & Goals</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Section title="Daily Schedule" />
          <View style={{ backgroundColor: '#1E1E3A', borderRadius: 20, padding: 16, gap: 4 }}>
            {scheduleItems.map((item) => (
              <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: '#A0A0C0', fontSize: 12, flex: 1, fontWeight: '500' }}>
                  {item.label}
                </Text>
                <Input
                  placeholder="HH:MM"
                  value={schedule[item.key as keyof typeof schedule]}
                  onChangeText={(v) => updateSchedule(item.key, v)}
                  keyboardType="numbers-and-punctuation"
                  containerStyle={{ marginBottom: 0, width: 90 }}
                  style={{ textAlign: 'center', fontSize: 14, fontWeight: '600' }}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Section title="Daily Goals" />
          {goalItems.map((item) => (
            <Input
              key={item.key}
              label={item.label}
              hint={item.hint}
              value={goals[item.key as keyof typeof goals]}
              onChangeText={(v) => updateGoal(item.key, v)}
              keyboardType="numeric"
            />
          ))}
        </Animated.View>

        <Button
          title="Save Schedule & Goals"
          onPress={handleSave}
          loading={loading}
          gradient={['#6366F1','#8B5CF6']}
          fullWidth
          size="lg"
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
