import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true,
  variant = 'full'
}) => {
  const { colors } = useTheme();

  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const textSizeMap = {
    small: 12,
    medium: 16,
    large: 24,
  };

  const containerSize = sizeMap[size];
  const fontSize = textSizeMap[size];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: size === 'small' ? 6 : size === 'medium' ? 8 : 12,
    },
      iconContainer: {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    icon: {
      color: '#ffffff',
      fontSize: containerSize * 0.6,
      fontWeight: '700',
    },
    textContainer: {
      flexDirection: 'column',
      gap: 2,
    },
    title: {
      fontSize: fontSize,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: fontSize * 0.65,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚡</Text>
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.title}>LifeOS</Text>
          {size !== 'small' && (
            <Text style={styles.subtitle}>Life Score</Text>
          )}
        </View>
      )}
    </View>
  );
};
