import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useTheme } from '@/context/ThemeContext';

function PasswordInput({
  label, value, onChangeText, placeholder, error,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  const { colors } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: error ? '#EF4444' : colors.border }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!show}
          style={[styles.input, { color: colors.textPrimary }]}
        />
        <TouchableOpacity onPress={() => setShow(p => !p)} style={styles.eyeBtn}>
          <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export default function ChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Current password is required';
    if (!newPass) e.newPass = 'New password is required';
    else if (newPass.length < 8) e.newPass = 'Must be at least 8 characters';
    else if (!/[A-Z]/.test(newPass)) e.newPass = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(newPass)) e.newPass = 'Must contain a number';
    if (newPass !== confirm) e.confirm = 'Passwords do not match';
    if (current === newPass && current) e.newPass = 'New password must differ from current';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(ENDPOINTS.USERS.CHANGE_PASSWORD, {
        currentPassword: current,
        newPassword: newPass,
      });
      Toast.show({ type: 'success', text1: '🔒 Password changed', text2: 'Your password has been updated.' });
      router.back();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to change password';
      if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong')) {
        setErrors({ current: 'Current password is incorrect' });
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const strength = (() => {
    if (!newPass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (newPass.length >= 8) score++;
    if (newPass.length >= 12) score++;
    if (/[A-Z]/.test(newPass)) score++;
    if (/[0-9]/.test(newPass)) score++;
    if (/[^A-Za-z0-9]/.test(newPass)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: '#EF4444' };
    if (score <= 3) return { level: score, label: 'Fair', color: '#F59E0B' };
    if (score <= 4) return { level: score, label: 'Good', color: '#10B981' };
    return { level: score, label: 'Strong', color: '#6366F1' };
  })();

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.backgroundSecondary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 40 }]}>
        <View style={[styles.infoCard, { backgroundColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#6366F1" />
          <Text style={[styles.infoText, { color: '#6366F1' }]}>
            Choose a strong password with at least 8 characters, an uppercase letter, and a number.
          </Text>
        </View>

        <PasswordInput
          label="Current Password"
          value={current}
          onChangeText={setCurrent}
          placeholder="Enter current password"
          error={errors.current}
        />
        <PasswordInput
          label="New Password"
          value={newPass}
          onChangeText={setNewPass}
          placeholder="Enter new password"
          error={errors.newPass}
        />

        {/* Strength bar */}
        {newPass.length > 0 && (
          <View style={{ marginBottom: 16, marginTop: -8 }}>
            <View style={styles.strengthBar}>
              {[1, 2, 3, 4, 5].map(i => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: i <= strength.level ? strength.color : colors.surfaceLight },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}

        <PasswordInput
          label="Confirm New Password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter new password"
          error={errors.confirm}
        />

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  content: { padding: 16 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 24,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 16,
  },
  input: { flex: 1, height: 48, fontSize: 15 },
  eyeBtn: { padding: 4 },
  error: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  strengthBar: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600' },
  saveBtn: {
    height: 52, borderRadius: 14, alignItems: 'center',
    justifyContent: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
