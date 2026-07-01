import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 2 },
  },
});

function RootLayoutContent() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser().finally(() => SplashScreen.hideAsync());
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F23' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="screens/activity-detail" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/add-activity" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/water-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/sleep-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/workout-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/study-tracker" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/weight-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/meal-log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="screens/ai-report" />
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
