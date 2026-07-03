import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTheme } from '@/context/ThemeContext';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters').max(50),
  age: z.string().optional(),
  height: z.string().optional(),
  currentWeight: z.string().optional(),
  goalWeight: z.string().optional(),
  occupation: z.string().optional(),
});

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male', emoji: '♂️' },
  { label: 'Female', value: 'female', emoji: '♀️' },
  { label: 'Other', value: 'non-binary', emoji: '⚧' },
];

const OCCUPATION_OPTIONS = [
  { label: 'Student', value: 'student', emoji: '🎓' },
  { label: 'Working', value: 'working', emoji: '💼' },
  { label: 'Other', value: 'other', emoji: '✨' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(user?.gender || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      age: user?.age ? String(user.age) : '',
      height: user?.height ? String(user.height) : '',
      currentWeight: user?.currentWeight ? String(user.currentWeight) : '',
      goalWeight: user?.goalWeight ? String(user.goalWeight) : '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, {
        name: data.name,
        age: data.age ? Number(data.age) : undefined,
        height: data.height ? Number(data.height) : undefined,
        currentWeight: data.currentWeight ? Number(data.currentWeight) : undefined,
        goalWeight: data.goalWeight ? Number(data.goalWeight) : undefined,
        gender: gender || undefined,
        occupation: occupation || undefined,
      });
      updateUser(response.data.data.user);
      Toast.show({ type: 'success', text1: '✅ Profile updated!' });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.response?.data?.message || 'Failed to update' });
    } finally {
      setLoading(false);
    }
  };

  const SelectRow = ({ options, selected, onSelect }: any) => (
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
      {options.map((opt: any) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          style={{
            flex: 1, paddingVertical: 12, borderRadius: 12,
            backgroundColor: selected === opt.value ? `${colors.primary}18` : colors.surface,
            borderWidth: 1.5,
            borderColor: selected === opt.value ? colors.primary : colors.border,
            alignItems: 'center', gap: 4,
          }}
        >
          <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
          <Text style={{
            color: selected === opt.value ? colors.primary : colors.textSecondary,
            fontSize: 11, fontWeight: selected === opt.value ? '600' : '400',
          }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.background]}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center', marginTop: 20 }}>
          <View style={{ position: 'relative' }}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700' }}>
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <TouchableOpacity
              style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background }}
            >
              <Ionicons name="camera" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 8 }}>Tap to change photo</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
            Personal Info
          </Text>

          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Full Name" placeholder="Your name" value={value} onChangeText={onChange}
              error={errors.name?.message}
              leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />} />
          )} />

          <Controller control={control} name="age" render={({ field: { onChange, value } }) => (
            <Input label="Age" placeholder="e.g. 22" keyboardType="numeric" value={value}
              onChangeText={onChange}
              leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />} />
          )} />

          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Gender</Text>
          <SelectRow options={GENDER_OPTIONS} selected={gender} onSelect={setGender} />

          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 10 }}>Occupation</Text>
          <SelectRow options={OCCUPATION_OPTIONS} selected={occupation} onSelect={setOccupation} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
            Body Stats
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="height" render={({ field: { onChange, value } }) => (
                <Input label="Height (cm)" placeholder="e.g. 175" keyboardType="decimal-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="currentWeight" render={({ field: { onChange, value } }) => (
                <Input label="Weight (kg)" placeholder="e.g. 70" keyboardType="decimal-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
          </View>

          <Controller control={control} name="goalWeight" render={({ field: { onChange, value } }) => (
            <Input label="Goal Weight (kg)" placeholder="e.g. 65" keyboardType="decimal-pad"
              value={value} onChangeText={onChange} hint="Your target weight"
              leftIcon={<Ionicons name="trophy-outline" size={18} color={colors.textMuted} />} />
          )} />
        </Animated.View>

        <Button
          title="Save Changes"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          gradient={['#6366F1', '#8B5CF6']}
          fullWidth size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
