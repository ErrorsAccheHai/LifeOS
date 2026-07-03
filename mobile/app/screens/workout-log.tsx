import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
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
import Button from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import type { Exercise } from '@/types';

const WORKOUT_TYPES = [
  { value: 'gym', label: 'Gym', icon: '🏋️' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
];

const INTENSITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#10B981' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#F97316' },
  { value: 'extreme', label: 'Extreme', color: '#EF4444' },
];

const QUICK_WORKOUTS = [
  { title: 'Full Body Strength', exercises: ['Squats', 'Push-ups', 'Deadlift', 'Pull-ups'], duration: 45, type: 'gym' },
  { title: 'Morning Run', exercises: ['Warm-up', '5K Run', 'Cool-down'], duration: 35, type: 'cardio' },
  { title: 'Home HIIT', exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Planks'], duration: 25, type: 'home' },
  { title: 'Yoga Flow', exercises: ['Sun Salutation', 'Warrior I', 'Child Pose', 'Savasana'], duration: 40, type: 'yoga' },
];

export default function WorkoutLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [workoutType, setWorkoutType] = useState('gym');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('45');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [rating, setRating] = useState(0);

  const applyQuickWorkout = (qw: typeof QUICK_WORKOUTS[0]) => {
    setTitle(qw.title);
    setDuration(String(qw.duration));
    setWorkoutType(qw.type);
    setExercises(qw.exercises.map((name) => ({ name })));
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: undefined, reps: undefined, weight: undefined }]);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Title required', text2: 'Give your workout a name' });
      return;
    }
    if (!duration || Number(duration) <= 0) {
      Toast.show({ type: 'error', text1: 'Duration required', text2: 'Enter workout duration' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.WORKOUT.LOG, {
        workoutType,
        title,
        exercises: exercises.filter((e) => e.name.trim()),
        duration: Number(duration),
        caloriesBurned: calories ? Number(calories) : undefined,
        intensity,
        notes,
        rating: rating || undefined,
      });

      const { xpEarned } = response.data.data;
      Toast.show({
        type: 'success',
        text1: '💪 Workout logged!',
        text2: `+${xpEarned} XP earned`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to log workout',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0F23' }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#2D0A0A', '#0F0F23']}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Log Workout 💪</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick workouts */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Quick Start
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, marginHorizontal: -4 }}>
            {QUICK_WORKOUTS.map((qw) => (
              <TouchableOpacity
                key={qw.title}
                onPress={() => applyQuickWorkout(qw)}
                style={{
                  backgroundColor: '#1E1E3A',
                  borderRadius: 16,
                  padding: 14,
                  marginHorizontal: 6,
                  width: 140,
                  borderWidth: 1,
                  borderColor: title === qw.title ? '#EF4444' : 'rgba(255,255,255,0.05)',
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>
                  {WORKOUT_TYPES.find((t) => t.value === qw.type)?.icon || '🏋️'}
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginBottom: 4 }}>
                  {qw.title}
                </Text>
                <Text style={{ color: '#606080', fontSize: 11 }}>
                  ~{qw.duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Type selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Workout Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setWorkoutType(type.value)}
                style={{
                  marginRight: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: workoutType === type.value ? '#EF4444' : '#1E1E3A',
                  borderWidth: 1,
                  borderColor: workoutType === type.value ? '#EF4444' : '#2D2D5A',
                }}
              >
                <Text style={{ fontSize: 16 }}>{type.icon}</Text>
                <Text style={{ color: workoutType === type.value ? '#fff' : '#A0A0C0', fontSize: 12, fontWeight: '500' }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 8 }}>
            Workout Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Morning Chest Day"
            placeholderTextColor={'#606080'}
            style={{
              backgroundColor: '#1E1E3A',
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#2D2D5A',
              color: '#FFFFFF',
              fontSize: 14,
              padding: 14,
            }}
          />
        </Animated.View>

        {/* Duration & Calories */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 8 }}>
              Duration (min) *
            </Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="45"
              placeholderTextColor={'#606080'}
              keyboardType="numeric"
              style={{
                backgroundColor: '#1E1E3A',
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#2D2D5A',
                color: '#FFFFFF',
                fontSize: 14,
                padding: 14,
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 8 }}>
              Calories Burned
            </Text>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="Optional"
              placeholderTextColor={'#606080'}
              keyboardType="numeric"
              style={{
                backgroundColor: '#1E1E3A',
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: '#2D2D5A',
                color: '#FFFFFF',
                fontSize: 14,
                padding: 14,
              }}
            />
          </View>
        </Animated.View>

        {/* Intensity */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
            Intensity
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {INTENSITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setIntensity(opt.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: intensity === opt.value ? `${opt.color}25` : '#1E1E3A',
                  borderWidth: 1.5,
                  borderColor: intensity === opt.value ? opt.color : '#2D2D5A',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: intensity === opt.value ? opt.color : '#606080', fontSize: 12, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Rating */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginBottom: 20 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 12 }}>
            Rate This Workout
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={{ fontSize: 28 }}>{star <= rating ? '⭐' : '☆'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={{ marginBottom: 24 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 8 }}>
            Notes
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go? Any PRs?"
            placeholderTextColor={'#606080'}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#1E1E3A',
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: '#2D2D5A',
              color: '#FFFFFF',
              fontSize: 14,
              padding: 14,
              textAlignVertical: 'top',
              minHeight: 80,
            }}
          />
        </Animated.View>

        <Button
          title="Save Workout 💪"
          onPress={handleSubmit}
          loading={loading}
          gradient={['#EF4444', '#F97316']}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
