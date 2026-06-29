import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';
import { COLORS } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10,
    },
  },
});

function RootLayoutContent() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await SplashScreen.hideAsync();
    };
    init();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right', gestureEnabled: false }} />
        <Stack.Screen name="screens/activity-detail" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/add-activity" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="screens/water-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/sleep-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/workout-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/study-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/weight-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/meal-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/ai-report" options={{ animation: 'slide_from_right' }} />
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
          <RootLayoutContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
