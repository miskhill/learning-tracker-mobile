import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;

function resolveDevApiUrl(): string {
  const legacyManifest = (Constants.manifest as { debuggerHost?: string } | null) ?? null;
  const hostUri = Constants.expoConfig?.hostUri ?? legacyManifest?.debuggerHost ?? null;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) {
      return 'http://' + host + ':4000/graphql';
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/graphql';
  }

  return 'http://localhost:4000/graphql';
}

function resolveApiUrl(): string {
  if (envApiUrl && envApiUrl.length > 0) {
    return envApiUrl;
  }

  if (extra?.apiUrl && extra.apiUrl.length > 0) {
    return extra.apiUrl;
  }

  if (__DEV__) {
    return resolveDevApiUrl();
  }

  throw new Error('API URL is not configured. Set EXPO_PUBLIC_API_URL or expo.extra.apiUrl.');
}

export const API_URL = resolveApiUrl();
export const NOTIFICATION_CHANNEL_ID = 'study-reminders';
