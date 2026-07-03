import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  ViewStyle, TextStyle, TouchableOpacityProps, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradient?: readonly [string, string, ...string[]];
  haptic?: boolean;
}

const SIZES = {
  sm: { padding: 12, fontSize: 12, height: 36 },
  md: { padding: 16, fontSize: 14, height: 48 },
  lg: { padding: 20, fontSize: 16, height: 56 },
};

const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, icon, iconPosition = 'left',
  style, textStyle, fullWidth = false, gradient, haptic = true, ...props
}) => {
  const { colors } = useTheme();
  const { padding, fontSize, height } = SIZES[size];

  const handlePress = () => {
    if (haptic && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const baseStyle: ViewStyle = {
    height, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', paddingHorizontal: padding,
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textColor = variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff';

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary:   { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.surfaceLight },
    outline:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    ghost:     { backgroundColor: 'transparent' },
    danger:    { backgroundColor: '#EF4444' },
    success:   { backgroundColor: '#10B981' },
  };

  const content = loading ? (
    <ActivityIndicator color={textColor} size="small" />
  ) : (
    <>
      {icon && iconPosition === 'left' && icon}
      <Text style={[{
        fontSize, fontWeight: '600', color: textColor,
        marginLeft: icon && iconPosition === 'left' ? 8 : 0,
        marginRight: icon && iconPosition === 'right' ? 8 : 0,
      }, textStyle]}>
        {title}
      </Text>
      {icon && iconPosition === 'right' && icon}
    </>
  );

  if (gradient && !disabled && !loading) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[baseStyle, { padding: 0, overflow: 'hidden' }, style]}
        {...props}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[baseStyle, { width: '100%' }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[baseStyle, variantStyles[variant], style]}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

export default Button;
