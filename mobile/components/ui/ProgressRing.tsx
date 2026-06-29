import React, { useEffect, useRef } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { COLORS, FONT_SIZE } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  gradient?: [string, string];
  children?: React.ReactNode;
  label?: string;
  value?: string;
  style?: ViewStyle;
  animated?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = COLORS.primary,
  trackColor = COLORS.surfaceLight,
  gradient,
  children,
  label,
  value,
  style,
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    if (animated) {
      animatedProgress.value = withTiming(clampedProgress, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = clampedProgress;
    }
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return { strokeDashoffset };
  });

  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {gradient && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradient[0]} />
              <Stop offset="100%" stopColor={gradient[1]} />
            </LinearGradient>
          </Defs>
        )}
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradient ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        {children || (
          <>
            {value && (
              <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.base, fontWeight: '700' }}>
                {value}
              </Text>
            )}
            {label && (
              <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 }}>
                {label}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default ProgressRing;
