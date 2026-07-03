import React from 'react';
import { View, Text, ViewStyle } from 'react-native';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'custom';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  dot?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'rgba(99,102,241,0.2)',  text: '#818CF8' },
  success: { bg: 'rgba(16,185,129,0.2)',  text: '#10B981' },
  warning: { bg: 'rgba(245,158,11,0.2)',  text: '#F59E0B' },
  error:   { bg: 'rgba(239,68,68,0.2)',   text: '#EF4444' },
  info:    { bg: 'rgba(59,130,246,0.2)',  text: '#3B82F6' },
  custom:  { bg: 'rgba(255,255,255,0.1)', text: '#FFFFFF' },
};

const Badge: React.FC<BadgeProps> = ({
  label, variant = 'primary', color, backgroundColor, size = 'sm', style, dot = false,
}) => {
  const { bg, text } = VARIANT_STYLES[variant];
  const fontSize = size === 'sm' ? 11 : 12;
  const paddingH = size === 'sm' ? 8 : 12;
  const paddingV = size === 'sm' ? 3 : 5;

  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: backgroundColor || bg,
      borderRadius: 999,
      paddingHorizontal: paddingH, paddingVertical: paddingV,
      alignSelf: 'flex-start',
    }, style]}>
      {dot && (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color || text, marginRight: 6 }} />
      )}
      <Text style={{ color: color || text, fontSize, fontWeight: '600' }}>{label}</Text>
    </View>
  );
};

export default Badge;
