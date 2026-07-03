import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useHabitsStore } from '@/store/habitsStore';
import { useTheme } from '@/context/ThemeContext';

const ICONS = ['🏃','📖','🧘','💧','🍎','🏋️','🎯','⭐','🌅','💪','📝','🎵','🧠','🌿','💤','🙏','💊','🥗','🚴','🤸'];
const COLORS_LIST = ['#6366F1','#EC4899','#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#14B8A6'];
const CATEGORIES = ['health','fitness','study','work','personal','religion','finance','entertainment','custom'];
const DAYS = ['S','M','T','W','T','F','S'];

export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { createHabit } = useHabitsStore();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [category, setCategory] = useState('personal');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [days, setDays] = useState([0,1,2,3,4,5,6]);
  const [xpReward, setXpReward] = useState('20');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a habit name.');
      return;
    }
    if (days.length === 0) {
      Alert.alert('Days required', 'Please select at least one day.');
      return;
    }
    setSaving(true);
    try {
      await createHabit({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        category,
        frequency,
        days,
        xpReward: parseInt(xpReward) || 20,
        reminderEnabled,
      });
      Toast.show({ type: 'success', text1: '🌱 Habit created', text2: name });
      router.back();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to create habit', text2: e.response?.data?.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.backgroundSecondary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>New Habit</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: `${selectedColor}15`, borderColor: `${selectedColor}30` }]}>
          <Text style={{ fontSize: 36 }}>{selectedIcon}</Text>
          <View style={{ marginLeft: 16 }}>
            <Text style={[styles.previewName, { color: colors.textPrimary }]}>
              {name || 'Habit Name'}
            </Text>
            <Text style={[styles.previewSub, { color: selectedColor }]}>
              {frequency} • {days.length} days/week
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Name */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>HABIT NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Morning Run"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
            maxLength={40}
          />

          {/* Icon */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ICON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {ICONS.map(icon => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconBtn,
                  { backgroundColor: colors.surface },
                  selectedIcon === icon && { backgroundColor: `${selectedColor}25`, borderColor: selectedColor, borderWidth: 2 },
                ]}
              >
                <Text style={{ fontSize: 24 }}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Color */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>COLOR</Text>
          <View style={styles.colorRow}>
            {COLORS_LIST.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setSelectedColor(c)}
                style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
              >
                {selectedColor === c && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Category */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surface },
                  category === cat && { backgroundColor: selectedColor },
                ]}
              >
                <Text style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  category === cat && { color: '#fff' },
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Frequency */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>FREQUENCY</Text>
          <View style={styles.freqRow}>
            {(['daily', 'weekly'] as const).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFrequency(f)}
                style={[
                  styles.freqBtn,
                  { backgroundColor: colors.surface },
                  frequency === f && { backgroundColor: selectedColor },
                ]}
              >
                <Text style={[styles.freqBtnText, { color: colors.textSecondary }, frequency === f && { color: '#fff' }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Days */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>DAYS</Text>
          <View style={styles.daysRow}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => toggleDay(i)}
                style={[
                  styles.dayBtn,
                  { backgroundColor: colors.surface },
                  days.includes(i) && { backgroundColor: selectedColor },
                ]}
              >
                <Text style={[styles.dayBtnText, { color: colors.textMuted }, days.includes(i) && { color: '#fff' }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* XP */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>XP REWARD</Text>
          <View style={styles.xpRow}>
            {[10, 20, 30, 50, 100].map(xp => (
              <TouchableOpacity
                key={xp}
                onPress={() => setXpReward(String(xp))}
                style={[
                  styles.xpBtn,
                  { backgroundColor: colors.surface },
                  xpReward === String(xp) && { backgroundColor: `${selectedColor}25`, borderColor: selectedColor, borderWidth: 1.5 },
                ]}
              >
                <Text style={[styles.xpBtnText, { color: colors.textSecondary }, xpReward === String(xp) && { color: selectedColor }]}>
                  ⚡{xp}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  preview: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 16, borderRadius: 16, borderWidth: 1,
  },
  previewName: { fontSize: 18, fontWeight: '700' },
  previewSub: { fontSize: 13, marginTop: 2 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  input: {
    height: 48, borderRadius: 12, paddingHorizontal: 16,
    fontSize: 15, borderWidth: 1, marginBottom: 20,
  },
  iconBtn: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '500' },
  freqRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  freqBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  freqBtnText: { fontSize: 14, fontWeight: '600' },
  daysRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dayBtn: { flex: 1, aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayBtnText: { fontSize: 12, fontWeight: '700' },
  xpRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  xpBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  xpBtnText: { fontSize: 13, fontWeight: '600' },
});
