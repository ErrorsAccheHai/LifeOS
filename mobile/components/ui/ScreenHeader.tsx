import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: { icon: string; onPress: () => void; label?: string };
  style?: ViewStyle;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title, subtitle, showBack = false, rightAction, style,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20,
    }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={rightAction.icon as any} size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ScreenHeader;
