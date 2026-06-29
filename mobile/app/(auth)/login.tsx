import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { COLORS, GRADIENTS, FONT_SIZE, SPACING } from '@/constants/theme';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Please check your credentials',
      });
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundSecondary]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: SPACING.base,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Brand */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ alignItems: 'center', marginBottom: 48 }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 20,
              }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 36 }}>⚡</Text>
              </LinearGradient>
            </View>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: FONT_SIZE['4xl'],
                fontWeight: '800',
                letterSpacing: -1,
              }}
            >
              LifeOS
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, marginTop: 8 }}>
              Organize your life. Improve every day.
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: FONT_SIZE['2xl'],
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Welcome back 👋
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, marginBottom: 32 }}>
              Sign in to continue your journey
            </Text>

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
                  placeholder="Your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  isPassword
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={{ alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 }}
            >
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '500' }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              gradient={GRADIENTS.primary}
              fullWidth
              size="lg"
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 24,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
              <Text style={{ color: COLORS.textMuted, marginHorizontal: 16, fontSize: FONT_SIZE.sm }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            </View>

            {/* Google button placeholder */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: COLORS.border,
                height: 52,
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>🌐</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            style={{ alignItems: 'center', marginTop: 40 }}
          >
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={{ flexDirection: 'row', gap: 6 }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base }}>
                Don't have an account?
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZE.base, fontWeight: '600' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
