import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/context/ThemeContext';

export default function WeightLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [waist, setWaist] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`${ENDPOINTS.WEIGHT.HISTORY}?days=30`);
      setHistory(response.data.data.logs || []);
    } catch {}
  };

  const calculateBMI = (w: number) => {
    if (!user?.height) return null;
    const h = user.height / 100;
    return Math.round((w / (h * h)) * 10) / 10;
  };

  const bmi = weight ? calculateBMI(Number(weight)) : null;
  const getBMIStatus = (b: number | null) => {
    if (!b) return null;
    if (b < 18.5) return { label: 'Underweight', color: '#3B82F6' };
    if (b < 25) return { label: 'Normal', color: '#10B981' };
    if (b < 30) return { label: 'Overweight', color: '#F59E0B' };
    return { label: 'Obese', color: '#EF4444' };
  };

  const bmiStatus = getBMIStatus(bmi);

  // Progress toward goal
  const currentW = history.length > 0 ? history[history.length - 1].weight : user?.currentWeight;
  const goalW = user?.goalWeight;
  const startW = user?.currentWeight;
  const progress = goalW && startW && currentW
    ? Math.abs(startW - goalW) > 0
      ? Math.min(Math.max(Math.round(((startW - currentW) / (startW - goalW)) * 100), 0), 100)
      : 100
    : 0;

  const handleSubmit = async () => {
    if (!weight || Number(weight) <= 0) {
      Toast.show({ type: 'error', text1: 'Enter your weight' });
      return;
    }

    setLoading(true);
    try {
      await api.post(ENDPOINTS.WEIGHT.LOG, {
        weight: Number(weight),
        bodyFat: bodyFat ? Number(bodyFat) : undefined,
        waist: waist ? Number(waist) : undefined,
        notes: notes.trim() || undefined,
      });

      Toast.show({ type: 'success', text1: '⚖️ Weight logged!', text2: bmi ? `BMI: ${bmi}` : '' });
      fetchHistory();
      setWeight('');
      setBodyFat('');
      setWaist('');
      setNotes('');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0F0F23' }}
    >
      <LinearGradient
        colors={['#1A1A2E', '#0F0F23']}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1E3A', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-down" size={22} color={'#FFFFFF'} />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>Weight Tracker ⚖️</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Goal Progress */}
        {goalW && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ marginBottom: 20 }}>
            <LinearGradient
              colors={['#1E1E3A', '#16163A']}
              style={{ borderRadius: 20, padding: 16 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View>
                  <Text style={{ color: '#A0A0C0', fontSize: 11 }}>Current</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>
                    {currentW || '--'} kg
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#A0A0C0', fontSize: 11 }}>Progress</Text>
                  <Text style={{ color: '#6366F1', fontSize: 20, fontWeight: '700' }}>
                    {progress}%
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#A0A0C0', fontSize: 11 }}>Goal</Text>
                  <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '700' }}>
                    {goalW} kg
                  </Text>
                </View>
              </View>
              <ProgressBar progress={progress} gradient={['#10B981','#06B6D4']} height={8} />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Weight input */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#A0A0C0', fontSize: 12, fontWeight: '500', marginBottom: 8 }}>
            Current Weight (kg) *
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E3A', borderRadius: 16, borderWidth: 1.5, borderColor: weight ? '#6366F1' : '#2D2D5A' }}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 70.5"
              placeholderTextColor={'#606080'}
              keyboardType="decimal-pad"
              style={{ flex: 1, color: '#FFFFFF', fontSize: 28, fontWeight: '700', padding: 16, textAlign: 'center' }}
            />
            <Text style={{ color: '#606080', fontSize: 18, paddingRight: 16 }}>kg</Text>
          </View>

          {bmi && bmiStatus && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <Text style={{ color: '#606080', fontSize: 12 }}>BMI: </Text>
              <Text style={{ color: bmiStatus.color, fontSize: 14, fontWeight: '700' }}>{bmi}</Text>
              <Text style={{ color: bmiStatus.color, fontSize: 12 }}>• {bmiStatus.label}</Text>
            </View>
          )}
        </Animated.View>

        {/* Optional measurements */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>Body Fat (%)</Text>
            <TextInput
              value={bodyFat}
              onChangeText={setBodyFat}
              placeholder="Optional"
              placeholderTextColor={'#606080'}
              keyboardType="decimal-pad"
              style={{ backgroundColor: '#1E1E3A', borderRadius: 16, borderWidth: 1.5, borderColor: '#2D2D5A', color: '#FFFFFF', fontSize: 14, padding: 14 }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>Waist (cm)</Text>
            <TextInput
              value={waist}
              onChangeText={setWaist}
              placeholder="Optional"
              placeholderTextColor={'#606080'}
              keyboardType="decimal-pad"
              style={{ backgroundColor: '#1E1E3A', borderRadius: 16, borderWidth: 1.5, borderColor: '#2D2D5A', color: '#FFFFFF', fontSize: 14, padding: 14 }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginBottom: 24 }}>
          <Text style={{ color: '#606080', fontSize: 11, marginBottom: 8 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling?"
            placeholderTextColor={'#606080'}
            style={{ backgroundColor: '#1E1E3A', borderRadius: 16, borderWidth: 1.5, borderColor: '#2D2D5A', color: '#FFFFFF', fontSize: 14, padding: 14 }}
          />
        </Animated.View>

        <Button
          title="Log Weight ⚖️"
          onPress={handleSubmit}
          loading={loading}
          gradient={['#6366F1','#8B5CF6']}
          fullWidth
          size="lg"
        />

        {/* History */}
        {history.length > 0 && (
          <View style={{ marginTop: 32 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
              Recent History
            </Text>
            {history.slice(-5).reverse().map((log) => (
              <View
                key={log._id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: '#1E1E3A',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#A0A0C0', fontSize: 12 }}>{log.date}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                  {log.weight} kg
                </Text>
                {log.bmi && (
                  <Text style={{ color: '#606080', fontSize: 12 }}>BMI: {log.bmi}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
