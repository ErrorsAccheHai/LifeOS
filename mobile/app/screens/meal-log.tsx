import React, { useState, useEffect } from 'react';
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
import ProgressBar from '@/components/ui/ProgressBar';
import { COLORS, GRADIENTS, FONT_SIZE, BORDER_RADIUS, SPACING } from '@/constants/theme';
import type { MealItem } from '@/types';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🍳', time: '08:00' },
  { value: 'lunch', label: 'Lunch', emoji: '🍱', time: '13:00' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️', time: '19:00' },
  { value: 'snack', label: 'Snack', emoji: '🍎', time: 'Any' },
  { value: 'pre_workout', label: 'Pre-Workout', emoji: '⚡', time: 'Before' },
  { value: 'post_workout', label: 'Post-Workout', emoji: '🏋️', time: 'After' },
];

export default function MealLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [items, setItems] = useState<MealItem[]>([{ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  const [notes, setNotes] = useState('');
  const [todayMeals, setTodayMeals] = useState<any>(null);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    try {
      const response = await api.get(ENDPOINTS.MEALS.TODAY);
      setTodayMeals(response.data.data);
    } catch {}
  };

  const addItem = () => {
    setItems([...items, { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof MealItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : Number(value) || 0 };
    setItems(updated);
  };

  const totalCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0);
  const totalProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.name.trim());
    if (validItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Add at least one food item' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(ENDPOINTS.MEALS.LOG, {
        mealType,
        items: validItems,
        notes: notes.trim() || undefined,
      });

      const { xpEarned } = response.data.data;
      Toast.show({ type: 'success', text1: '🍱 Meal logged!', text2: `+${xpEarned} XP earned` });
      fetchToday();
      setItems([{ name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]);
      setNotes('');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <LinearGradient
        colors={[COLORS.backgroundSecondary, COLORS.background]}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: SPACING.base, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '700' }}>Meal Logger 🍱</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Daily progress */}
        {todayMeals && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
            <LinearGradient
              colors={['#1E1E3A', '#16163A']}
              style={{ borderRadius: BORDER_RADIUS.xl, padding: 16 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.sm }}>Today's Calories</Text>
                <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>
                  {todayMeals.totals?.calories || 0} / {todayMeals.calorieGoal || 2000} kcal
                </Text>
              </View>
              <ProgressBar
                progress={todayMeals.calorieProgress || 0}
                gradient={GRADIENTS.emerald}
                height={8}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
                {[
                  { label: 'Protein', value: `${Math.round(todayMeals.totals?.protein || 0)}g`, color: '#EF4444' },
                  { label: 'Carbs', value: `${Math.round(todayMeals.totals?.carbs || 0)}g`, color: '#F59E0B' },
                  { label: 'Fat', value: `${Math.round(todayMeals.totals?.fat || 0)}g`, color: '#10B981' },
                ].map((macro) => (
                  <View key={macro.label} style={{ alignItems: 'center' }}>
                    <Text style={{ color: macro.color, fontSize: FONT_SIZE.base, fontWeight: '700' }}>{macro.value}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>{macro.label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Meal type */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            Meal Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setMealType(type.value)}
                style={{
                  marginRight: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: BORDER_RADIUS.full,
                  backgroundColor: mealType === type.value ? COLORS.accentEmerald : COLORS.surface,
                  borderWidth: 1,
                  borderColor: mealType === type.value ? COLORS.accentEmerald : COLORS.border,
                }}
              >
                <Text style={{ fontSize: 16 }}>{type.emoji}</Text>
                <Text style={{ color: mealType === type.value ? '#fff' : COLORS.textSecondary, fontSize: FONT_SIZE.sm, fontWeight: '500' }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Food items */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Food Items
            </Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' }}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: BORDER_RADIUS.xl,
                padding: 14,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <TextInput
                  value={item.name}
                  onChangeText={(v) => updateItem(index, 'name', v)}
                  placeholder="Food name"
                  placeholderTextColor={COLORS.textMuted}
                  style={{ flex: 1, color: COLORS.textPrimary, fontSize: FONT_SIZE.base, backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md, padding: 10 }}
                />
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { key: 'calories', label: 'kcal', placeholder: '0' },
                  { key: 'protein', label: 'protein g', placeholder: '0' },
                  { key: 'carbs', label: 'carbs g', placeholder: '0' },
                  { key: 'fat', label: 'fat g', placeholder: '0' },
                ].map(({ key, label, placeholder }) => (
                  <View key={key} style={{ flex: 1 }}>
                    <TextInput
                      value={item[key as keyof MealItem] ? String(item[key as keyof MealItem]) : ''}
                      onChangeText={(v) => updateItem(index, key as keyof MealItem, v)}
                      placeholder={placeholder}
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="decimal-pad"
                      style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.xs, backgroundColor: COLORS.surfaceLight, borderRadius: BORDER_RADIUS.md, padding: 8, textAlign: 'center' }}
                    />
                    <Text style={{ color: COLORS.textMuted, fontSize: 9, textAlign: 'center', marginTop: 3 }}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Totals */}
        {totalCalories > 0 && (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderRadius: BORDER_RADIUS.lg,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(16,185,129,0.2)',
              justifyContent: 'space-around',
            }}
          >
            <Text style={{ color: COLORS.accentEmerald, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
              {totalCalories} kcal
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.base }}>
              {totalProtein}g protein
            </Text>
          </View>
        )}

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 24 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginBottom: 8 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes about this meal?"
            placeholderTextColor={COLORS.textMuted}
            style={{ backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border, color: COLORS.textPrimary, fontSize: FONT_SIZE.base, padding: 14 }}
          />
        </Animated.View>

        <Button
          title="Log Meal 🍱"
          onPress={handleSubmit}
          loading={loading}
          gradient={GRADIENTS.emerald}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
