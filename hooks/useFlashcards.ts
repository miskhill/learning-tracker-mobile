import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { FLASHCARDS_BY_TOPIC_QUERY, CREATE_FLASHCARD_MUTATION } from '@/lib/apollo/queries';
import type { CreateFlashcardInput, Flashcard } from '@/types/graphql';
import { useFlashcardStore } from '@/store/flashcardStore';

interface CreateFlashcardResult {
  flashcard: Flashcard;
  offline: boolean;
}

type FlashcardFromServer = Omit<Flashcard, 'topicId'> & {
  topic?: { id: string | null } | null;
};

function normalizeFlashcards(
  cards: ReadonlyArray<FlashcardFromServer>,
  fallbackTopicId: string
): Flashcard[] {
  return cards.map((card) => {
    const { topic, ...rest } = card;
    return {
      ...rest,
      topicId: topic?.id ?? fallbackTopicId
    };
  });
}

export function useFlashcards(topicId: string | string[] | undefined) {
  const parsedTopicId = Array.isArray(topicId) ? topicId[0] : topicId;
  const flashcards = useFlashcardStore((state) =>
    parsedTopicId ? state.flashcardsByTopic[parsedTopicId] ?? [] : []
  );
  const setFlashcards = useFlashcardStore((state) => state.setFlashcards);
  const addFlashcardOffline = useFlashcardStore((state) => state.addFlashcardOffline);

  const { loading, refetch } = useQuery(FLASHCARDS_BY_TOPIC_QUERY, {
    variables: { topicId: parsedTopicId ?? '' },
    skip: !parsedTopicId,
    onCompleted: (result) => {
      if (parsedTopicId && result?.flashcardsByTopic) {
        const normalized = normalizeFlashcards(result.flashcardsByTopic, parsedTopicId);
        setFlashcards(parsedTopicId, normalized);
      }
    },
    onError: (error) => {
      console.warn('Flashcards query error', error);
    }
  });

  const [createFlashcardMutation, createState] = useMutation(CREATE_FLASHCARD_MUTATION);

  const createFlashcard = useCallback(
    async (input: CreateFlashcardInput): Promise<CreateFlashcardResult> => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        const card = addFlashcardOffline(input.topicId, input);
        return { flashcard: card, offline: true };
      }

      const result = await createFlashcardMutation({
        variables: { input }
      });

      const created = result.data?.createFlashcard;
      if (created) {
        const [normalized] = normalizeFlashcards([created], input.topicId);
        await refetch();
        return { flashcard: normalized, offline: false };
      }

      throw new Error('Failed to create flashcard');
    },
    [addFlashcardOffline, createFlashcardMutation, refetch]
  );

  return {
    flashcards,
    loading,
    creating: createState.loading,
    refetch,
    createFlashcard,
    topicId: parsedTopicId
  };
}
