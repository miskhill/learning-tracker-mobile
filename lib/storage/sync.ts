import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { CREATE_FLASHCARD_MUTATION, CREATE_TOPIC_MUTATION, FLASHCARDS_BY_TOPIC_QUERY, TOPICS_QUERY } from '@/lib/apollo/queries';
import { loadFlashcardsFromCache, loadLastStudyAt, loadTopicsFromCache } from './offlineCache';
import { useTopicStore } from '@/store/topicStore';
import { useFlashcardStore } from '@/store/flashcardStore';

export async function hydrateStoresFromCache(): Promise<void> {
  const [topics, flashcardsByTopic, lastStudyAt] = await Promise.all([
    loadTopicsFromCache(),
    loadFlashcardsFromCache(),
    loadLastStudyAt()
  ]);

  const topicStore = useTopicStore.getState();
  topicStore.hydrateFromCache(topics ?? []);

  const flashcardStore = useFlashcardStore.getState();
  flashcardStore.hydrateFromCache(flashcardsByTopic ?? {});

  if (lastStudyAt) {
    flashcardStore.setLastStudyAt(lastStudyAt);
  }
}

export async function syncOfflineData(
  client: ApolloClient<NormalizedCacheObject>
): Promise<void> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return;
  }

  const topicStore = useTopicStore.getState();
  const flashcardStore = useFlashcardStore.getState();

  const pendingTopics = topicStore.getPendingTopicCreates();
  for (const topic of pendingTopics) {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_TOPIC_MUTATION,
        variables: {
          input: {
            name: topic.name,
            description: topic.description
          }
        }
      });

      const createdTopic = data?.createTopic;
      if (createdTopic) {
        topicStore.markTopicSynced(topic.id, createdTopic);
      }
    } catch (error) {
      console.warn('Failed to sync topic', topic.id, error);
    }
  }

  const pendingFlashcards = flashcardStore.getPendingFlashcardCreates();
  for (const pending of pendingFlashcards) {
    const targetTopic = topicStore.topics.find((topic) => topic.id === pending.topicId);
    if (!targetTopic || targetTopic.isLocalOnly) {
      continue;
    }
    try {
      const { data } = await client.mutate({
        mutation: CREATE_FLASHCARD_MUTATION,
        variables: {
          input: {
            topicId: pending.topicId,
            question: pending.flashcard.question,
            answer: pending.flashcard.answer
          }
        }
      });

      const createdFlashcard = data?.createFlashcard;
      if (createdFlashcard) {
        flashcardStore.markFlashcardSynced(pending.topicId, pending.flashcard.id, createdFlashcard);
      }
    } catch (error) {
      console.warn('Failed to sync flashcard', pending.flashcard.id, error);
    }
  }

  try {
    const { data } = await client.query({
      query: TOPICS_QUERY,
      fetchPolicy: 'network-only'
    });
    if (data?.topics) {
      topicStore.setTopicsFromServer(data.topics);
    }
  } catch (error) {
    console.warn('Failed to refresh topics after sync', error);
  }

  const topics = topicStore.topics.filter((topic) => !topic.isLocalOnly);
  for (const topic of topics) {
    try {
      const { data } = await client.query({
        query: FLASHCARDS_BY_TOPIC_QUERY,
        variables: { topicId: topic.id },
        fetchPolicy: 'network-only'
      });
      if (data?.flashcards) {
        flashcardStore.setFlashcards(topic.id, data.flashcards);
      }
    } catch (error) {
      console.warn('Failed to refresh flashcards for topic', topic.id, error);
    }
  }
}

export function subscribeToNetworkChanges(
  client: ApolloClient<NormalizedCacheObject>
): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncOfflineData(client).catch((error) => {
        console.warn('Sync failure', error);
      });
    }
  });

  return unsubscribe;
}
