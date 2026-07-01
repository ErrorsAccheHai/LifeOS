import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: e.response?.data?.message || 'Check credentials' });
    }
  };

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={s.flex}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView
          contentContainerStyle={[s.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoWrap}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={s.logoBox}>
              <Text style={{ fontSize: 36 }}>⚡</Text>
            </LinearGradient>
            <Text style={s.appName}>LifeOS</Text>
            <Text style={s.tagline}>Organize your life. Improve every day.</Text>
          </View>

          {/* Form */}
          <Text style={s.heading}>Welcome back 👋</Text>
          <Text style={s.subheading}>Sign in to continue your journey</Text>

          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email" placeholder="you@example.com" keyboardType="email-address"
              autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message}
              leftIcon={<Ionicons name="mail-outline" size={20} color="#606080" />} />
          )} />

          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input label="Password" placeholder="Your password" value={value}
              onChangeText={onChange} error={errors.password?.message} isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#606080" />} />
          )} />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={s.forgotWrap}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isLoading}
            gradient={['#6366F1', '#8B5CF6']} fullWidth size="lg" />

          <View style={s.dividerWrap}>
            <View style={s.divider} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.divider} />
          </View>

          <TouchableOpacity style={s.googleBtn}>
            <Text style={{ fontSize: 20 }}>🌐</Text>
            <Text style={s.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={s.footer}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <Text style={s.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: '#A0A0C0', fontSize: 14, marginTop: 6 },
  heading: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subheading: { color: '#A0A0C0', fontSize: 14, marginBottom: 28 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { color: '#6366F1', fontSize: 14, fontWeight: '500' },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: '#2D2D5A' },
  dividerText: { color: '#606080', marginHorizontal: 16, fontSize: 13 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1E1E3A', borderRadius: 20, borderWidth: 1, borderColor: '#2D2D5A',
    height: 52, gap: 12 },
  googleText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: '#A0A0C0', fontSize: 14 },
  footerLink: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
});
