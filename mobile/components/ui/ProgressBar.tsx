import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, FONT_SIZE } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
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
  progress,
  color = COLORS.primary,
  gradient,
  height = 8,
  trackColor = COLORS.surfaceLight,
  label,
  showValue = false,
  animated = true,
  style,
  rounded = true,
}) => {
  const width = useSharedValue(0);
  const clamped = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    if (animated) {
      width.value = withTiming(clamped, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      width.value = clamped;
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const borderRadius = rounded ? BORDER_RADIUS.full : 0;

  return (
    <View style={style}>
      {(label || showValue) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '500' }}>
              {label}
            </Text>
          )}
          {showValue && (
            <Text style={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs, fontWeight: '600' }}>
              {Math.round(clamped)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor: trackColor,
          borderRadius,
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[{ height: '100%', borderRadius }, animatedStyle]}>
          {gradient ? (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: color, borderRadius }} />
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default ProgressBar;
