import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TopicEntity } from '@/store/topicStore';
import type { FlashcardEntity } from '@/store/flashcardStore';

const TOPICS_CACHE_KEY = '@learning-tracker/topics';
const FLASHCARDS_CACHE_KEY = '@learning-tracker/flashcards';
const LAST_STUDY_AT_KEY = '@learning-tracker/lastStudyAt';

export async function saveTopicsToCache(topics: TopicEntity[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TOPICS_CACHE_KEY, JSON.stringify(topics));
  } catch (error) {
    console.warn('Failed to save topics to cache', error);
  }
}

export async function loadTopicsFromCache(): Promise<TopicEntity[] | null> {
  try {
    const stored = await AsyncStorage.getItem(TOPICS_CACHE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as TopicEntity[];
  } catch (error) {
    console.warn('Failed to load topics from cache', error);
    return null;
  }
}

export async function saveFlashcardsToCache(
  flashcardsByTopic: Record<string, FlashcardEntity[]>
): Promise<void> {
  try {
    await AsyncStorage.setItem(FLASHCARDS_CACHE_KEY, JSON.stringify(flashcardsByTopic));
  } catch (error) {
    console.warn('Failed to save flashcards to cache', error);
  }
}

export async function loadFlashcardsFromCache(): Promise<
  Record<string, FlashcardEntity[]> | null
> {
  try {
    const stored = await AsyncStorage.getItem(FLASHCARDS_CACHE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as Record<string, FlashcardEntity[]>;
  } catch (error) {
    console.warn('Failed to load flashcards from cache', error);
    return null;
  }
}

export async function saveLastStudyAt(value: string | null): Promise<void> {
  try {
    if (!value) {
      await AsyncStorage.removeItem(LAST_STUDY_AT_KEY);
      return;
    }
    await AsyncStorage.setItem(LAST_STUDY_AT_KEY, value);
  } catch (error) {
    console.warn('Failed to save lastStudyAt', error);
  }
}

export async function loadLastStudyAt(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(LAST_STUDY_AT_KEY)) ?? null;
  } catch (error) {
    console.warn('Failed to load lastStudyAt', error);
    return null;
  }
}
