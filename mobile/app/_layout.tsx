import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 2 },
  },
});

function RootLayoutContent() {
  const { loadUser } = useAuthStore();
  const { isDark, colors } = useTheme();

  useEffect(() => {
    loadUser().finally(async () => {
      SplashScreen.hideAsync();
      // Register for push notifications and send token to backend
      try { await registerForPushNotificationsAsync(); } catch {}
    });
  }, []);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="screens/activity-detail" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/add-activity" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/water-tracker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/sleep-tracker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/workout-log" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/study-tracker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/weight-log" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/meal-log" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/ai-report" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="screens/settings/edit-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/settings/notifications" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/settings/appearance" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/settings/schedule-goals" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/settings/about" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/settings/change-password" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/add-habit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootLayoutContent />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
