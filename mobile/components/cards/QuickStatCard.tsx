import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, BORDER_RADIUS, FONT_SIZE, SHADOWS } from '@/constants/theme';

interface QuickStatCardProps {
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

const QuickStatCard: React.FC<QuickStatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  gradient,
  progress,
  onPress,
  delay = 0,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={{ flex: 1 }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={SHADOWS.sm}>
        <LinearGradient
          colors={['#1E1E3A', '#16163A']}
          style={{
            borderRadius: BORDER_RADIUS.xl,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {/* Icon */}
          <LinearGradient
            colors={gradient}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{icon}</Text>
          </LinearGradient>

          {/* Value */}
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONT_SIZE.xl,
              fontWeight: '700',
              lineHeight: 24,
            }}
          >
            {value}
            {unit && (
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, fontWeight: '400' }}>
                {' '}{unit}
              </Text>
            )}
          </Text>

          {/* Title */}
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
            {title}
          </Text>

          {/* Progress bar (optional) */}
          {progress !== undefined && (
            <View
              style={{
                height: 3,
                backgroundColor: COLORS.surfaceLighter,
                borderRadius: 2,
                marginTop: 10,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${Math.min(progress, 100)}%`,
                  borderRadius: 2,
                }}
              />
            </View>
          )}

          {subtitle && (
            <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}>
              {subtitle}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default QuickStatCard;
