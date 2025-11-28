import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export const API_URL = extra?.apiUrl ?? 'http://localhost:4000/graphql';
export const NOTIFICATION_CHANNEL_ID = 'study-reminders';
