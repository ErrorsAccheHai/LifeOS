import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HABITS = [
  { _id:'1', name:'Morning Run', icon:'🏃', color:'#EF4444', frequency:'daily', currentStreak:7, longestStreak:14, completionRate:85 },
  { _id:'2', name:'Read 30 mins', icon:'📖', color:'#6366F1', frequency:'daily', currentStreak:12, longestStreak:20, completionRate:92 },
  { _id:'3', name:'Meditate', icon:'🧘', color:'#10B981', frequency:'daily', currentStreak:3, longestStreak:15, completionRate:73 },
  { _id:'4', name:'Drink 8 Glasses', icon:'💧', color:'#06B6D4', frequency:'daily', currentStreak:5, longestStreak:18, completionRate:78 },
];

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');

  const toggle = (id: string) => setCompleted(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <View style={s.screen}>
      <LinearGradient colors={['#1A1A2E', '#0F0F23']} style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.titleRow}>
          <View>
            <Text style={s.title}>Habits</Text>
            <Text style={s.sub}>Build consistent routines</Text>
          </View>
          <TouchableOpacity style={s.addBtn}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Total', value: HABITS.length, emoji: '✅' },
            { label: 'Avg Streak', value: '7d', emoji: '🔥' },
            { label: 'Avg Rate', value: '82%', emoji: '📊' },
          ].map(st => (
            <View key={st.label} style={s.statBox}>
              <Text style={{ fontSize: 20 }}>{st.emoji}</Text>
              <Text style={s.statVal}>{st.value}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}
          contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
          {['all','daily','weekly'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={[s.filterBtn, filter === f && s.filterBtnActive]}>
              <Text style={[s.filterText, filter === f && { color: '#fff' }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}>
        {HABITS.filter(h => filter === 'all' || h.frequency === filter).map(habit => {
          const done = completed.includes(habit._id);
          return (
            <View key={habit._id} style={[s.card, done && { borderColor: `${habit.color}30` }]}>
              <View style={s.cardRow}>
                <View style={[s.iconWrap, { backgroundColor: `${habit.color}20` }]}>
                  <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.habitName, done && s.habitDone]}>{habit.name}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <Text style={s.streakText}>🔥 {habit.currentStreak} days</Text>
                    <Text style={s.bestText}>Best: {habit.longestStreak}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggle(habit._id)}
                  style={[s.checkBtn, done && { backgroundColor: `${habit.color}20`, borderColor: habit.color }]}>
                  {done && <Ionicons name="checkmark" size={18} color={habit.color} />}
                </TouchableOpacity>
              </View>
              {/* Progress bar */}
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${habit.completionRate}%`, backgroundColor: habit.color }]} />
              </View>
              <Text style={s.rateText}>{habit.completionRate}% completion rate</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0F0F23' },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  sub: { color: '#A0A0C0', fontSize: 13, marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: '#1E1E3A', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statVal: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  statLbl: { color: '#606080', fontSize: 10 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#1E1E3A' },
  filterBtnActive: { backgroundColor: '#6366F1' },
  filterText: { color: '#A0A0C0', fontSize: 13, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingTop: 16 },
  card: { backgroundColor: '#1E1E3A', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  habitName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  habitDone: { color: '#606080', textDecorationLine: 'line-through' },
  streakText: { color: '#F43F5E', fontSize: 12 },
  bestText: { color: '#606080', fontSize: 12 },
  checkBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#252547', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#2D2D5A' },
  progressTrack: { height: 4, backgroundColor: '#252547', borderRadius: 2, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  rateText: { color: '#606080', fontSize: 11, marginTop: 6 },
});
