import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { configureNotifications, ensurePermission } from '@/lib/reminders';
import { PlantStoreProvider } from '@/lib/store';
import { colors } from '@/lib/theme';

configureNotifications();

export default function RootLayout() {
  useEffect(() => {
    ensurePermission().catch(() => {});
  }, []);

  return (
    <PlantStoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plant/[id]" options={{ title: '' }} />
        <Stack.Screen name="add" options={{ title: 'Add plant', presentation: 'modal' }} />
      </Stack>
    </PlantStoreProvider>
  );
}
