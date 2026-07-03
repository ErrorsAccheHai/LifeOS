import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
  height?: number;
  trackColor?: string;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  rounded?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress, color, gradient, height = 8,
  trackColor, label, showValue = false,
  animated = true, style, rounded = true,
}) => {
  const { colors } = useTheme();
  const resolvedColor = color || colors.primary;
  const resolvedTrack = trackColor || colors.surfaceLight;

  const widthAnim = useSharedValue(0);
  const clamped = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    widthAnim.value = animated
      ? withTiming(clamped, { duration: 800, easing: Easing.out(Easing.cubic) })
      : clamped;
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${widthAnim.value}%` as any }));
  const br = rounded ? 999 : 0;

  return (
    <View style={style}>
      {(label || showValue) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '500' }}>{label}</Text>}
          {showValue && <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={{ height, backgroundColor: resolvedTrack, borderRadius: br, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', borderRadius: br }, animatedStyle]}>
          {gradient ? (
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: br }} />
          ) : (
            <View style={{ flex: 1, backgroundColor: resolvedColor, borderRadius: br }} />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default ProgressBar;
