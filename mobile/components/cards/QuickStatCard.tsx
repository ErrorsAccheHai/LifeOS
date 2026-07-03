import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
  progress?: number;
  onPress?: () => void;
  delay?: number;
}

const QuickStatCard: React.FC<Props> = ({
  title, value, unit, subtitle, icon, gradient, progress, onPress, delay = 0,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={{
          shadowColor: gradient[0],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20, padding: 14,
          borderWidth: 1, borderColor: colors.glassBorder,
        }}>
          {/* Icon */}
          <LinearGradient
            colors={gradient as any}
            style={{
              width: 38, height: 38, borderRadius: 11,
              alignItems: 'center', justifyContent: 'center', marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </LinearGradient>

          {/* Value */}
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700', lineHeight: 24 }}>
            {value}
            {unit && (
              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '400' }}>
                {' '}{unit}
              </Text>
            )}
          </Text>

          {/* Title */}
          <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>{title}</Text>

          {/* Progress bar */}
          {progress !== undefined && (
            <View style={{
              height: 3, backgroundColor: colors.surfaceLighter,
              borderRadius: 2, marginTop: 10, overflow: 'hidden',
            }}>
              <LinearGradient
                colors={gradient as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: '100%', width: `${Math.min(progress, 100)}%`, borderRadius: 2 }}
              />
            </View>
          )}

          {subtitle && (
            <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
              {subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default QuickStatCard;
