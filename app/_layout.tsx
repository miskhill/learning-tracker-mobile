import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getApolloClient } from '@/lib/apollo/client';
import { hydrateStoresFromCache, subscribeToNetworkChanges, syncOfflineData } from '@/lib/storage/sync';
import { initializeNotifications, scheduleDailyReminder } from '@/lib/notifications/scheduler';
import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const prepare = async () => {
      try {
        const apolloClient = await getApolloClient();
        await hydrateStoresFromCache();
        await initializeNotifications();
        await scheduleDailyReminder();
        if (!isMounted) {
          return;
        }
        setClient(apolloClient);
        setReady(true);
        await syncOfflineData(apolloClient);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.warn('Failed to bootstrap application', error);
        await SplashScreen.hideAsync();
      }
    };

    void prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }

    const unsubscribe = subscribeToNetworkChanges(client);
    return unsubscribe;
  }, [client]);

  if (!ready || !client) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApolloProvider client={client}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: colors.background
              },
              headerTintColor: colors.text,
              contentStyle: {
                backgroundColor: colors.background
              }
            }}
          />
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
