import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/context/ThemeContext';

const VERSION = '1.0.0';
const BUILD = '2026.07.03';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open link' });
    }
  };

  const reportBug = () => {
    Alert.alert(
      'Report a Bug',
      'Describe the issue and we\'ll fix it in the next update.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Email', onPress: () => openLink('mailto:support@lifeos.app?subject=Bug Report') },
      ]
    );
  };

  const RowItem = ({ icon, label, value, onPress, color }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#2D2D5A',
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#252547', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Ionicons name={icon} size={18} color={color || '#A0A0C0'} />
      </View>
      <Text style={{ flex: 1, color: color || '#FFFFFF', fontSize: 14 }}>{label}</Text>
      {value && <Text style={{ color: '#606080', fontSize: 12, marginRight: 8 }}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={'#606080'} />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F23' }}>
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={22} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>About LifeOS</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center', paddingVertical: 32 }}>
          <LinearGradient colors={['#6366F1','#8B5CF6']} style={{ width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 40 }}>⚡</Text>
          </LinearGradient>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>LifeOS</Text>
          <Text style={{ color: '#606080', fontSize: 12, marginTop: 4 }}>Version {VERSION} (Build {BUILD})</Text>
          <Text style={{ color: '#A0A0C0', fontSize: 11, marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
            Your personal life operating system.{'\n'}Track, improve, and achieve every day.
          </Text>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            App Info
          </Text>
          <View style={{ backgroundColor: '#1E1E3A', borderRadius: 20, paddingHorizontal: 16 }}>
            <RowItem icon="code-slash-outline" label="Version" value={VERSION} />
            <RowItem icon="person-outline" label="Developer" value="LifeOS Team" />
            <RowItem
              icon="map-outline"
              label="Roadmap"
              onPress={() => openLink('https://github.com/ErrorsAccheHai/LifeOS')}
            />
            <RowItem
              icon="logo-github"
              label="GitHub"
              onPress={() => openLink('https://github.com/ErrorsAccheHai/LifeOS')}
            />
          </View>
        </Animated.View>

        {/* Legal */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 24 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Legal
          </Text>
          <View style={{ backgroundColor: '#1E1E3A', borderRadius: 20, paddingHorizontal: 16 }}>
            <RowItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => router.push('/screens/settings/privacy')}
            />
            <RowItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => router.push('/screens/settings/terms')}
            />
            <RowItem
              icon="library-outline"
              label="Open Source Licenses"
              onPress={() => openLink('https://github.com/ErrorsAccheHai/LifeOS')}
            />
          </View>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginTop: 24 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Support
          </Text>
          <View style={{ backgroundColor: '#1E1E3A', borderRadius: 20, paddingHorizontal: 16 }}>
            <RowItem
              icon="bug-outline"
              label="Report a Bug"
              onPress={reportBug}
              color={'#EF4444'}
            />
            <RowItem
              icon="mail-outline"
              label="Contact Us"
              onPress={() => openLink('mailto:support@lifeos.app')}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ color: '#606080', fontSize: 11 }}>Made with ❤️ for better living</Text>
          <Text style={{ color: '#606080', fontSize: 11, marginTop: 4 }}>© 2026 LifeOS. All rights reserved.</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
