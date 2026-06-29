import React from 'react';
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SHADOWS } from '@/constants/theme';

interface GradientCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  gradient?: readonly [string, string, ...string[]];
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  glass?: boolean;
  onPress?: () => void;
  shadow?: boolean;
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  gradient,
  style,
  innerStyle,
  glass = false,
  onPress,
  shadow = true,
  ...props
}) => {
  const content = gradient ? (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: BORDER_RADIUS.xl,
          padding: 16,
          overflow: 'hidden',
        },
        innerStyle,
      ]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View
      style={[
        {
          borderRadius: BORDER_RADIUS.xl,
          padding: 16,
          backgroundColor: glass ? COLORS.glass : COLORS.surface,
          borderWidth: glass ? 1 : 0,
          borderColor: glass ? COLORS.glassBorder : 'transparent',
        },
        innerStyle,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[shadow ? SHADOWS.md : undefined, style]}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[shadow ? SHADOWS.md : undefined, style]}>
      {content}
    </View>
  );
};

export default GradientCard;
