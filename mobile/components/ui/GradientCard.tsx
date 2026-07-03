import React from 'react';
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

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
          borderRadius: 20,
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
          borderRadius: 20,
          padding: 16,
          backgroundColor: glass ? 'rgba(255,255,255,0.05)' : '#1E1E3A',
          borderWidth: glass ? 1 : 0,
          borderColor: glass ? 'rgba(255,255,255,0.05)'Border : 'transparent',
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
        style={[shadow ? { shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 } : undefined, style]}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[shadow ? { shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 } : undefined, style]}>
      {content}
    </View>
  );
};

export default GradientCard;
