import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
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
  name: z.string().min(2, 'Min 2 chars').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuthStore();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: any) => {
    try {
      await register({ name: data.name, email: data.email, password: data.password });
      router.replace('/onboarding');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: e.response?.data?.message || 'Try again' });
    }
  };

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40, paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={s.heading}>Create Account ✨</Text>
          <Text style={s.sub}>Start your journey to a better life</Text>

          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Full Name" placeholder="Ashish Kumar" autoCapitalize="words"
              value={value} onChangeText={onChange} error={errors.name?.message}
              leftIcon={<Ionicons name="person-outline" size={20} color="#606080" />} />
          )} />
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email" placeholder="you@example.com" keyboardType="email-address"
              autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message}
              leftIcon={<Ionicons name="mail-outline" size={20} color="#606080" />} />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input label="Password" placeholder="Min 8 characters" value={value}
              onChangeText={onChange} error={errors.password?.message} isPassword
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#606080" />} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
            <Input label="Confirm Password" placeholder="Repeat password" value={value}
              onChangeText={onChange} error={errors.confirmPassword?.message} isPassword
              leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color="#606080" />} />
          )} />

          <Text style={s.terms}>By creating an account, you agree to our Terms of Service.</Text>
          <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading}
            gradient={['#6366F1', '#8B5CF6']} fullWidth size="lg" />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <Text style={s.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  heading: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#A0A0C0', fontSize: 14, marginBottom: 28 },
  terms: { color: '#606080', fontSize: 12, marginBottom: 20, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#A0A0C0', fontSize: 14 },
  footerLink: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
});
