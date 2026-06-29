import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { COLORS, GRADIENTS, FONT_SIZE, SPACING } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSent(true);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: SPACING.base,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: COLORS.surface,
              alignItems: 'center', justifyContent: 'center', marginBottom: 40,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {!sent ? (
            <Animated.View entering={FadeInDown.duration(500)}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>🔑</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '700', marginBottom: 8 }}>
                Forgot Password?
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, marginBottom: 40, lineHeight: 24 }}>
                No worries! Enter your email and we'll send you a reset link.
              </Text>

              <Controller
                control={control}
                name="email"
                rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    leftIcon={<Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />}
                  />
                )}
              />

              <Button
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                gradient={GRADIENTS.primary}
                fullWidth
                size="lg"
                style={{ marginTop: 16 }}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 72, marginBottom: 24 }}>📬</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE['2xl'], fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
                Check Your Email
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.base, textAlign: 'center', lineHeight: 24 }}>
                We've sent a password reset link to your email address.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => router.replace('/(auth)/login')}
                variant="outline"
                style={{ marginTop: 40, width: 200 }}
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
