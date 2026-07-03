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
import { CATEGORY_CONFIG } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { ActivityCategory } from '@/types';

const ICONS = ['⭐', '🏃', '💪', '📚', '💼', '🧘', '🎮', '🎨', '🎵', '🌟', '🔥', '💡', '🍎', '💧', '😴', '🏊', '🚴', '⚽', '🎯', '🙏', '💰', '📝', '🎓', '🌱'];
const COLORS_OPTIONS = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#06B6D4', '#F97316', '#14B8A6'];
const CATEGORIES: ActivityCategory[] = ['health', 'fitness', 'study', 'work', 'personal', 'religion', 'finance', 'entertainment', 'custom'];

export default function AddActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⭐');
  const [selectedColor, setSelectedColor] = useState(COLORS_OPTIONS[0]);
  const [category, setCategory] = useState<ActivityCategory>('personal');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [xpReward, setXpReward] = useState('10');
  const [priority, setPriority] = useState('medium');
  const [enableReminder, setEnableReminder] = useState(true);
  const [repeatType, setRepeatType] = useState('daily');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Activity name required' });
      return;
    }

    setLoading(true);
    try {
      await api.post(ENDPOINTS.ACTIVITIES.LIST, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        category,
        description: description.trim() || undefined,
        scheduledTime: scheduledTime || undefined,
        estimatedDuration: Number(duration) || 30,
        xpReward: Number(xpReward) || 10,
        priority,
        reminder: { enabled: enableReminder, minutesBefore: 10 },
        repeatSchedule: {
          type: repeatType,
          days: [0, 1, 2, 3, 4, 5, 6],
        },
      });

      Toast.show({ type: 'success', text1: '✅ Activity created!' });
      router.back();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to create' });
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={{
      color: '#A0A0C0',
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
      marginTop: 20,
    }}>
      {title}
    </Text>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0F23' }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={22} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
            New Activity
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Preview card */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1E1E3A',
            borderRadius: 16,
            padding: 14,
            marginTop: 16,
            borderWidth: 1,
            borderColor: `${selectedColor}30`,
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: `${selectedColor}25`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Text style={{ fontSize: 24 }}>{selectedIcon}</Text>
          </View>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
              {name || 'Activity Name'}
            </Text>
            <Text style={{ color: '#606080', fontSize: 11 }}>
              {duration}min • +{xpReward} XP
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <SectionTitle title="Activity Name" />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Run"
          placeholderTextColor={'#606080'}
          style={{
            backgroundColor: '#1E1E3A',
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: name ? '#6366F1' : '#2D2D5A',
            color: '#FFFFFF',
            fontSize: 14,
            padding: 14,
            marginBottom: 4,
          }}
        />

        {/* Icon selector */}
        <SectionTitle title="Icon" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                marginHorizontal: 4,
                backgroundColor: selectedIcon === icon ? `${selectedColor}25` : '#1E1E3A',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: selectedIcon === icon ? selectedColor : 'transparent',
              }}
            >
              <Text style={{ fontSize: 22 }}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Color selector */}
        <SectionTitle title="Color" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {COLORS_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedColor === color && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <SectionTitle title="Category" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: isSelected ? `${config.color}25` : '#1E1E3A',
                  borderWidth: 1,
                  borderColor: isSelected ? config.color : '#2D2D5A',
                }}
              >
                <Text style={{ fontSize: 14 }}>{config.icon}</Text>
                <Text
                  style={{
                    color: isSelected ? config.color : '#606080',
                    fontSize: 12,
                    fontWeight: isSelected ? '600' : '400',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Schedule */}
        <SectionTitle title="Schedule" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>
              Scheduled Time
            </Text>
            <TextInput
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholder="HH:MM"
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
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>
              Duration (min)
            </Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
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
        </View>

        {/* XP & Priority */}
        <SectionTitle title="XP & Priority" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>XP Reward</Text>
            <TextInput
              value={xpReward}
              onChangeText={setXpReward}
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
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>Priority</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 12,
                    backgroundColor: priority === p ? '#6366F1' : '#1E1E3A',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: priority === p ? '#6366F1' : '#2D2D5A',
                  }}
                >
                  <Text style={{ color: priority === p ? '#fff' : '#606080', fontSize: 10, fontWeight: '600', textTransform: 'capitalize' }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Reminder toggle */}
        <SectionTitle title="Reminder" />
        <TouchableOpacity
          onPress={() => setEnableReminder(!enableReminder)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1E1E3A',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: enableReminder ? '#6366F1' + '40' : '#2D2D5A',
          }}
        >
          <Ionicons name="notifications-outline" size={22} color={'#A0A0C0'} style={{ marginRight: 12 }} />
          <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 14 }}>
            Enable Reminder
          </Text>
          <View
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              backgroundColor: enableReminder ? '#6366F1' : '#252547',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 2,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#fff',
                transform: [{ translateX: enableReminder ? 10 : -10 }],
              }}
            />
          </View>
        </TouchableOpacity>

        <View style={{ height: 32 }} />

        <Button
          title="Create Activity ✨"
          onPress={handleSubmit}
          loading={loading}
          gradient={['#6366F1','#8B5CF6']}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
