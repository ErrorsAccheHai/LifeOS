import React, { useState } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  ViewStyle, TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, FONT_SIZE } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  isPassword = false,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? COLORS.error
    : focused
    ? COLORS.primary
    : COLORS.border;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: FONT_SIZE.sm,
            fontWeight: '500',
            marginBottom: 8,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.lg,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: 16,
          minHeight: 52,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: 12 }}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            {
              flex: 1,
              color: COLORS.textPrimary,
              fontSize: FONT_SIZE.base,
              paddingVertical: 14,
            },
            style,
          ]}
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={{ marginLeft: 12 }}>{rightIcon}</View>
        )}
      </View>

      {error && (
        <Text
          style={{
            color: COLORS.error,
            fontSize: FONT_SIZE.xs,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONT_SIZE.xs,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};

export default Input;
