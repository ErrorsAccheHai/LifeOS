import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, LIGHT_COLORS, AMOLED_COLORS } from '@/constants/theme';

export type ThemeMode = 'dark' | 'light' | 'amoled' | 'system';
export type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

const ACCENT_COLORS: Record<AccentColor, string> = {
  purple: '#6366F1',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F97316',
  pink: '#EC4899',
};

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceLight: string;
  surfaceLighter: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderLight: string;
  glass: string;
  glassBorder: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  accentColor: AccentColor;
  isDark: boolean;
  colors: ThemeColors;
  accent: string;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'lifeos_theme_mode';
const ACCENT_STORAGE_KEY = 'lifeos_accent_color';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('purple');

  useEffect(() => {
    const load = async () => {
      try {
        const [savedMode, savedAccent] = await Promise.all([
          AsyncStorage.getItem(THEME_STORAGE_KEY),
          AsyncStorage.getItem(ACCENT_STORAGE_KEY),
        ]);
        if (savedMode) setModeState(savedMode as ThemeMode);
        if (savedAccent) setAccentColorState(savedAccent as AccentColor);
      } catch {}
    };
    load();
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try { await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode); } catch {}
  }, []);

  const setAccentColor = useCallback(async (color: AccentColor) => {
    setAccentColorState(color);
    try { await AsyncStorage.setItem(ACCENT_STORAGE_KEY, color); } catch {}
  }, []);

  const resolvedMode = mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;
  const isDark = resolvedMode !== 'light';
  const accent = ACCENT_COLORS[accentColor];

  let colors: ThemeColors;
  if (resolvedMode === 'light') {
    colors = {
      ...COLORS,
      ...LIGHT_COLORS,
      primary: accent,
      primaryLight: accent + 'CC',
      primaryDark: accent + 'AA',
    };
  } else if (resolvedMode === 'amoled') {
    colors = {
      ...COLORS,
      ...AMOLED_COLORS,
      primary: accent,
      primaryLight: accent + 'CC',
      primaryDark: accent + 'AA',
    };
  } else {
    colors = {
      ...COLORS,
      primary: accent,
      primaryLight: accent + 'CC',
      primaryDark: accent + 'AA',
    };
  }

  return (
    <ThemeContext.Provider value={{ mode, accentColor, isDark, colors, accent, setMode, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export { ACCENT_COLORS };
