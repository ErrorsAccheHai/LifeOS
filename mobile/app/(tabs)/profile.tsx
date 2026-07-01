import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

const BADGES = [
  { key:'early_bird', name:'Early Bird', icon:'🌅', rarity:'rare', color:'#3B82F6' },
  { key:'workout', name:'Workout Warrior', icon:'💪', rarity:'epic', color:'#8B5CF6' },
  { key:'hydration', name:'Hydration Hero', icon:'💧', rarity:'rare', color:'#3B82F6' },
  { key:'study', name:'Study Beast', icon:'📚', rarity:'legendary', color:'#F59E0B' },
];

function SettingRow({ icon, label, value, onPress, danger }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={s.settingRow}>
      <View style={[s.settingIcon, danger && s.settingIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#EF4444' : '#A0A0C0'} />
      </View>
      <Text style={[s.settingLabel, danger && { color: '#EF4444' }]}>{label}</Text>
      {value && <Text style={s.settingValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={16} color="#606080" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
  ]);

  const lv = user?.levelInfo || { level: 1, progress: 0, currentLevelXP: 0, nextLevelXP: 100 };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0F23' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1A1A2E', '#0F0F23']}
          style={[s.headerBg, { paddingTop: insets.top + 16 }]}>
          <View style={s.avatarWrap}>
            <LinearGradient colors={['#6366F1', '#8B5CF6']} style={s.avatar}>
              <Text style={s.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View style={s.cameraBtn}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </View>
          <Text style={s.profileName}>{user?.name || 'User'}</Text>
          <Text style={s.profileEmail}>{user?.email}</Text>
          <View style={s.levelBadge}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={s.levelText}>Level {user?.level || 1}</Text>
            <Text style={s.xpText}>• {(user?.xp || 0).toLocaleString()} XP</Text>
          </View>

          {/* Level bar */}
          <View style={s.levelBarWrap}>
            <View style={s.levelBarRow}>
              <Text style={s.levelBarSub}>Level {lv.level} → Level {lv.level + 1}</Text>
              <Text style={s.levelBarPct}>{lv.currentLevelXP} / {lv.nextLevelXP} XP</Text>
            </View>
            <View style={s.levelTrack}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.levelFill, { width: `${lv.progress}%` }]} />
            </View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { label: 'Streak', value: `${user?.currentStreak || 0}d`, emoji: '🔥', color: '#F43F5E' },
              { label: 'Best', value: `${user?.longestStreak || 0}d`, emoji: '🏆', color: '#F59E0B' },
              { label: 'Total XP', value: (user?.totalXPEarned || 0).toLocaleString(), emoji: '⭐', color: '#6366F1' },
            ].map(st => (
              <View key={st.label} style={s.statBox}>
                <Text style={{ fontSize: 20 }}>{st.emoji}</Text>
                <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLbl}>{st.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Badges */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Badges 🏅</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BADGES.map(b => (
              <View key={b.key} style={[s.badgeCard, { borderColor: `${b.color}40` }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>{b.icon}</Text>
                <Text style={[s.badgeRarity, { color: b.color }]}>{b.rarity}</Text>
                <Text style={s.badgeName} numberOfLines={2}>{b.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Body Stats */}
        {(user?.height || user?.currentWeight) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Body Stats 💪</Text>
            <View style={s.bodyStats}>
              {[
                { label: 'Height', value: user?.height ? `${user.height}cm` : '--', icon: '📏' },
                { label: 'Weight', value: user?.currentWeight ? `${user.currentWeight}kg` : '--', icon: '⚖️' },
                { label: 'Goal', value: user?.goalWeight ? `${user.goalWeight}kg` : '--', icon: '🎯' },
                { label: 'BMI', value: user?.bmi ? `${user.bmi}` : '--', icon: '📊' },
              ].map(st => (
                <View key={st.label} style={s.bodyStatItem}>
                  <Text style={{ fontSize: 22, marginBottom: 6 }}>{st.icon}</Text>
                  <Text style={s.bodyStatVal}>{st.value}</Text>
                  <Text style={s.bodyStatLbl}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Settings ⚙️</Text>
          <View style={s.settingsCard}>
            <SettingRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
            <SettingRow icon="notifications-outline" label="Notifications" value="On" onPress={() => {}} />
            <SettingRow icon="moon-outline" label="Appearance" value="Dark" onPress={() => {}} />
            <SettingRow icon="time-outline" label="Schedule & Goals" onPress={() => {}} />
            <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
            <SettingRow icon="information-circle-outline" label="About LifeOS" value="v1.0.0" onPress={() => {}} />
          </View>
          <View style={[s.settingsCard, { marginTop: 16 }]}>
            <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  headerBg: { paddingHorizontal: 16, paddingBottom: 24, alignItems: 'center' },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#6366F1' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0F0F23' },
  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  profileEmail: { color: '#A0A0C0', fontSize: 13, marginTop: 4 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  levelText: { color: '#6366F1', fontSize: 15, fontWeight: '700' },
  xpText: { color: '#A0A0C0', fontSize: 13 },
  levelBarWrap: { width: '100%', marginTop: 16 },
  levelBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelBarSub: { color: '#A0A0C0', fontSize: 12 },
  levelBarPct: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
  levelTrack: { height: 8, backgroundColor: '#252547', borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  statBox: { flex: 1, backgroundColor: '#1E1E3A', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 15, fontWeight: '700' },
  statLbl: { color: '#606080', fontSize: 10 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 14 },
  badgeCard: { alignItems: 'center', backgroundColor: '#1E1E3A', borderRadius: 16, padding: 14, width: 90, marginRight: 12, borderWidth: 1.5 },
  badgeRarity: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  badgeName: { color: '#FFFFFF', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  bodyStats: { flexDirection: 'row', backgroundColor: '#1E1E3A', borderRadius: 20, padding: 16, justifyContent: 'space-around' },
  bodyStatItem: { alignItems: 'center' },
  bodyStatVal: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  bodyStatLbl: { color: '#606080', fontSize: 11, marginTop: 2 },
  settingsCard: { backgroundColor: '#1E1E3A', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#2D2D5A' },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#252547', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingIconDanger: { backgroundColor: 'rgba(239,68,68,0.15)' },
  settingLabel: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  settingValue: { color: '#606080', fontSize: 13, marginRight: 8 },
});
