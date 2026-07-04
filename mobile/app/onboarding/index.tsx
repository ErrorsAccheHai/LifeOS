import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 'personal', title: 'About You', subtitle: 'Tell us a bit about yourself', emoji: '👋' },
  { id: 'body', title: 'Your Body', subtitle: 'Help us personalize your journey', emoji: '💪' },
  { id: 'schedule', title: 'Daily Schedule', subtitle: 'When do you usually wake up and sleep?', emoji: '⏰' },
  { id: 'goals', title: 'Your Goals', subtitle: 'What do you want to achieve daily?', emoji: '🎯' },
  { id: 'ready', title: 'You\'re Ready!', subtitle: 'Let\'s build your life system', emoji: '🚀' },
];

interface OnboardingData {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  height: string;
  currentWeight: string;
  goalWeight: string;
  wakeTime: string;
  sleepTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  workoutTime: string;
  studyTime: string;
  waterGoal: string;
  screenTimeGoal: string;
  stepGoal: string;
  studyGoal: string;
}

const SelectButton = ({ label, selected, onPress, emoji }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flex: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: selected ? '#6366F1' : '#2D2D5A',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.15)' : '#1E1E3A',
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'center',
      gap: 6,
    }}
  >
    {emoji && <Text style={{ fontSize: 22 }}>{emoji}</Text>}
    <Text style={{
      color: selected ? '#6366F1' : '#A0A0C0',
      fontSize: 12,
      fontWeight: selected ? '600' : '400',
      textAlign: 'center',
    }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    name: user?.name || '',
    age: '',
    gender: '',
    occupation: '',
    height: '',
    currentWeight: '',
    goalWeight: '',
    wakeTime: '06:00',
    sleepTime: '22:00',
    breakfastTime: '08:00',
    lunchTime: '13:00',
    dinnerTime: '19:00',
    workoutTime: '07:00',
    studyTime: '09:00',
    waterGoal: '2500',
    screenTimeGoal: '120',
    stepGoal: '8000',
    studyGoal: '120',
  });

  const update = (key: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.USERS.ONBOARDING, {
        name: data.name,
        age: data.age ? Number(data.age) : undefined,
        gender: data.gender || undefined,
        occupation: data.occupation || undefined,
        height: data.height ? Number(data.height) : undefined,
        currentWeight: data.currentWeight ? Number(data.currentWeight) : undefined,
        goalWeight: data.goalWeight ? Number(data.goalWeight) : undefined,
        schedule: {
          wakeTime: data.wakeTime,
          sleepTime: data.sleepTime,
          breakfastTime: data.breakfastTime,
          lunchTime: data.lunchTime,
          dinnerTime: data.dinnerTime,
          workoutTime: data.workoutTime,
          studyTime: data.studyTime,
        },
        goals: {
          waterGoal: Number(data.waterGoal),
          screenTimeGoal: Number(data.screenTimeGoal),
          stepGoal: Number(data.stepGoal),
          studyGoal: Number(data.studyGoal),
        },
      });

      updateUser({ ...response.data.data.user, onboardingCompleted: true });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to save profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Animated.View entering={FadeInDown.duration(400)} key="personal">
            <Input
              label="Your Name"
              placeholder="What should we call you?"
              value={data.name}
              onChangeText={(v) => update('name', v)}
              leftIcon={<Ionicons name="person-outline" size={20} color={'#606080'} />}
            />
            <Input
              label="Age"
              placeholder="Your age"
              keyboardType="numeric"
              value={data.age}
              onChangeText={(v) => update('age', v)}
              leftIcon={<Ionicons name="calendar-outline" size={20} color={'#606080'} />}
            />

            <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
              Gender
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Male', value: 'male', emoji: '♂️' },
                { label: 'Female', value: 'female', emoji: '♀️' },
                { label: 'Other', value: 'non-binary', emoji: '⚧' },
              ].map((g) => (
                <SelectButton
                  key={g.value}
                  label={g.label}
                  emoji={g.emoji}
                  selected={data.gender === g.value}
                  onPress={() => update('gender', g.value)}
                />
              ))}
            </View>

            <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
              Occupation
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: 'Student', value: 'student', emoji: '🎓' },
                { label: 'Working', value: 'working', emoji: '💼' },
                { label: 'Other', value: 'other', emoji: '✨' },
              ].map((o) => (
                <SelectButton
                  key={o.value}
                  label={o.label}
                  emoji={o.emoji}
                  selected={data.occupation === o.value}
                  onPress={() => update('occupation', o.value)}
                />
              ))}
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View entering={FadeInDown.duration(400)} key="body">
            <Input
              label="Height (cm)"
              placeholder="e.g. 175"
              keyboardType="numeric"
              value={data.height}
              onChangeText={(v) => update('height', v)}
              leftIcon={<Ionicons name="resize-outline" size={20} color={'#606080'} />}
            />
            <Input
              label="Current Weight (kg)"
              placeholder="e.g. 70"
              keyboardType="decimal-pad"
              value={data.currentWeight}
              onChangeText={(v) => update('currentWeight', v)}
              leftIcon={<Ionicons name="scale-outline" size={20} color={'#606080'} />}
            />
            <Input
              label="Goal Weight (kg)"
              placeholder="e.g. 65"
              keyboardType="decimal-pad"
              value={data.goalWeight}
              onChangeText={(v) => update('goalWeight', v)}
              leftIcon={<Ionicons name="trophy-outline" size={20} color={'#606080'} />}
              hint="Optional — helps track your progress"
            />
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInDown.duration(400)} key="schedule">
            {[
              { label: 'Wake Up Time', key: 'wakeTime', emoji: '🌅' },
              { label: 'Sleep Time', key: 'sleepTime', emoji: '😴' },
              { label: 'Breakfast Time', key: 'breakfastTime', emoji: '🍳' },
              { label: 'Lunch Time', key: 'lunchTime', emoji: '🍱' },
              { label: 'Dinner Time', key: 'dinnerTime', emoji: '🍽️' },
              { label: 'Workout Time', key: 'workoutTime', emoji: '💪' },
              { label: 'Study Time', key: 'studyTime', emoji: '📚' },
            ].map(({ label, key, emoji }) => (
              <Input
                key={key}
                label={`${emoji} ${label}`}
                placeholder="HH:MM (24-hour)"
                value={data[key as keyof OnboardingData]}
                onChangeText={(v) => update(key as keyof OnboardingData, v)}
                keyboardType="numbers-and-punctuation"
              />
            ))}
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInDown.duration(400)} key="goals">
            <Input
              label="💧 Daily Water Goal (ml)"
              placeholder="e.g. 2500"
              keyboardType="numeric"
              value={data.waterGoal}
              onChangeText={(v) => update('waterGoal', v)}
              hint="Recommended: 2000-3000ml"
            />
            <Input
              label="📱 Screen Time Goal (min)"
              placeholder="e.g. 120"
              keyboardType="numeric"
              value={data.screenTimeGoal}
              onChangeText={(v) => update('screenTimeGoal', v)}
              hint="Daily limit for recreational use"
            />
            <Input
              label="👟 Daily Steps Goal"
              placeholder="e.g. 8000"
              keyboardType="numeric"
              value={data.stepGoal}
              onChangeText={(v) => update('stepGoal', v)}
              hint="WHO recommends 8,000+ steps/day"
            />
            <Input
              label="📚 Daily Study Goal (min)"
              placeholder="e.g. 120"
              keyboardType="numeric"
              value={data.studyGoal}
              onChangeText={(v) => update('studyGoal', v)}
            />
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInDown.duration(400)} key="ready" style={{ alignItems: 'center', paddingTop: 20 }}>
            <Text style={{ fontSize: 80, marginBottom: 24 }}>🎉</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
              Your LifeOS is Ready!
            </Text>
            <Text style={{ color: '#A0A0C0', fontSize: 14, textAlign: 'center', lineHeight: 26 }}>
              We've created your personalized daily routine based on your schedule. Let's start building great habits!
            </Text>

            <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
              {[
                { emoji: '⚡', label: 'Smart activity tracking' },
                { emoji: '🏆', label: 'XP & level progression' },
                { emoji: '🤖', label: 'AI-powered daily insights' },
                { emoji: '📊', label: 'Beautiful analytics & charts' },
                { emoji: '🔥', label: 'Streak & badge system' },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  <Text style={{ color: '#A0A0C0', fontSize: 14 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            {step > 0 && (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="chevron-back" size={24} color={'#FFFFFF'} />
              </TouchableOpacity>
            )}
            <Text style={{ color: '#606080', fontSize: 12 }}>
              Step {step + 1} of {STEPS.length}
            </Text>
            <Text style={{ color: '#6366F1', fontSize: 12, marginLeft: 'auto', fontWeight: '600' }}>
              {Math.round(progress)}%
            </Text>
          </View>

          <ProgressBar
            progress={progress}
            gradient={['#6366F1','#8B5CF6']}
            height={4}
            style={{ marginBottom: 32 }}
          />

          {/* Step header */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>{currentStep.emoji}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 6 }}>
              {currentStep.title}
            </Text>
            <Text style={{ color: '#A0A0C0', fontSize: 14 }}>
              {currentStep.subtitle}
            </Text>
          </View>

          {/* Step content */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderStep()}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Bottom button */}
          <View style={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}>
            <Button
              title={step === STEPS.length - 1 ? "Let's Go! 🚀" : 'Continue'}
              onPress={handleNext}
              gradient={['#6366F1','#8B5CF6']}
              fullWidth
              size="lg"
              loading={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
