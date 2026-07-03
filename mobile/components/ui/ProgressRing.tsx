import React, { useEffect } from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number;
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
  progress, size = 80, strokeWidth = 8,
  color, trackColor, gradient,
  children, label, value, style, animated = true,
}) => {
  const { colors } = useTheme();
  const resolvedColor = color || colors.primary;
  const resolvedTrack = trackColor || colors.surfaceLight;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 100);
    animatedProgress.value = animated
      ? withTiming(clamped, { duration: 1000, easing: Easing.out(Easing.cubic) })
      : clamped;
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (animatedProgress.value / 100) * circumference,
  }));

  const gradientId = `grad-ring-${size}`;

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
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={resolvedTrack} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={gradient ? `url(#${gradientId})` : resolvedColor}
          strokeWidth={strokeWidth} fill="none"
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
            {value && <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }}>{value}</Text>}
            {label && <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>}
          </>
        )}
      </View>
    </View>
  );
};

export default ProgressRing;
