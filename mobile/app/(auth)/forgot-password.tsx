import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async ({ email }: any) => {
    setLoading(true);
    try {
      await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSent(true);
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong' });
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={['#0F0F23', '#1A1A2E']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40, paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {!sent ? (
            <>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>🔑</Text>
              <Text style={s.heading}>Forgot Password?</Text>
              <Text style={s.sub}>Enter your email and we'll send you a reset link.</Text>
              <Controller control={control} name="email"
                rules={{ required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
                render={({ field: { onChange, value } }) => (
                  <Input label="Email" placeholder="you@example.com" keyboardType="email-address"
                    autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message}
                    leftIcon={<Ionicons name="mail-outline" size={20} color="#606080" />} />
                )} />
              <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading}
                gradient={['#6366F1', '#8B5CF6']} fullWidth size="lg" style={{ marginTop: 8 }} />
            </>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Text style={{ fontSize: 72, marginBottom: 24 }}>📬</Text>
              <Text style={[s.heading, { textAlign: 'center' }]}>Check Your Email</Text>
              <Text style={[s.sub, { textAlign: 'center' }]}>We've sent a reset link to your email.</Text>
              <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')}
                variant="outline" style={{ marginTop: 40, width: 200 }} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  heading: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  sub: { color: '#A0A0C0', fontSize: 14, marginBottom: 32, lineHeight: 22 },
});
