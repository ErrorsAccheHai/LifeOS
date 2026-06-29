import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS, BORDER_RADIUS, FONT_SIZE } from '@/constants/theme';

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

const SIZES: Record<ButtonSize, { padding: number; fontSize: number; height: number }> = {
  sm: { padding: 12, fontSize: FONT_SIZE.sm, height: 36 },
  md: { padding: 16, fontSize: FONT_SIZE.base, height: 48 },
  lg: { padding: 20, fontSize: FONT_SIZE.md, height: 56 },
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  gradient,
  haptic = true,
  ...props
}) => {
  const { padding, fontSize, height } = SIZES[size];

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const baseStyle: ViewStyle = {
    height,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: padding,
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textColor = variant === 'outline' || variant === 'ghost'
    ? COLORS.primary
    : COLORS.textPrimary;

  const variantStyle: ViewStyle = {
    primary: { backgroundColor: COLORS.primary },
    secondary: { backgroundColor: COLORS.surfaceLight },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: COLORS.error },
    success: { backgroundColor: COLORS.success },
  }[variant];

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              {
                fontSize,
                fontWeight: '600',
                color: textColor,
                marginLeft: icon && iconPosition === 'left' ? 8 : 0,
                marginRight: icon && iconPosition === 'right' ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (gradient && !disabled && !loading) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[baseStyle, { padding: 0 }, style]}
        {...props}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[baseStyle, { width: '100%' }]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[baseStyle, variantStyle, style]}
      {...props}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

export default Button;
