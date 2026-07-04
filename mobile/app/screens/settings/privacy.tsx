import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.backgroundSecondary, colors.background]} style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Privacy Policy</Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
          We respect your privacy. This app collects minimal personal data (name, email, avatar). We may store activity logs and analytics to provide personalized features. We do not sell your data.
        </Text>

        <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16, marginTop: 16 }}>Data Storage</Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
          Your data is stored securely and encrypted in our backend. You can delete your account at any time from Settings and your data will be marked inactive.
        </Text>
      </ScrollView>
    </View>
  );
}
