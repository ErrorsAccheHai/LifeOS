import React from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { COLORS, GRADIENTS, FONT_SIZE, SPACING } from '@/constants/theme';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.replace('/onboarding');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'Please try again',
      });
    }
  };

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: SPACING.base,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 32,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: FONT_SIZE['3xl'],
                  fontWeight: '800',
                  letterSpacing: -0.5,
                  marginBottom: 8,
                }}
              >
                Create Account ✨
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
                Start your journey to a better life
              </Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="Ashish Kumar"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  leftIcon={<Ionicons name="person-outline" size={20} color={COLORS.textMuted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  isPassword
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  isPassword
                  leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMuted} />}
                />
              )}
            />

            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginBottom: 24, lineHeight: 18 }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>

            <Button
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              gradient={GRADIENTS.primary}
              fullWidth
              size="lg"
            />
          </Animated.View>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ flexDirection: 'row', gap: 6 }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
                Already have an account?
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
