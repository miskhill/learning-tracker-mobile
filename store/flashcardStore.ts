import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CreateFlashcardInput, Flashcard } from '@/types/graphql';
import { saveFlashcardsToCache, saveLastStudyAt } from '@/lib/storage/offlineCache';

export interface FlashcardEntity extends Flashcard {
  tempId?: string;
  isLocalOnly?: boolean;
}

interface FlashcardStore {
  flashcardsByTopic: Record<string, FlashcardEntity[]>;
  lastStudyAt: string | null;
  hydrated: boolean;
  setFlashcards: (topicId: string, flashcards: Flashcard[]) => void;
  addFlashcardOffline: (topicId: string, input: CreateFlashcardInput) => FlashcardEntity;
  markFlashcardSynced: (topicId: string, tempId: string, serverFlashcard: Flashcard) => void;
  hydrateFromCache: (payload: Record<string, FlashcardEntity[]>) => void;
  setLastStudyAt: (isoDate: string | null) => void;
  getPendingFlashcardCreates: () => Array<{ topicId: string; flashcard: FlashcardEntity }>;
  reassignTopicId: (oldTopicId: string, newTopicId: string) => void;
}

export const useFlashcardStore = create<FlashcardStore>((set, get) => ({
  flashcardsByTopic: {},
  lastStudyAt: null,
  hydrated: false,
  setFlashcards: (topicId, flashcards) => {
    set((state) => {
      const serverFlashcards = flashcards.map((card) => ({ ...card, isLocalOnly: false }));
      const localFlashcards = state.flashcardsByTopic[topicId]?.filter((card) => card.isLocalOnly) ?? [];
      const merged = [...serverFlashcards];

      localFlashcards.forEach((localCard) => {
        const exists = merged.some(
          (card) => card.id === localCard.id || card.tempId === localCard.tempId
        );
        if (!exists) {
          merged.push(localCard);
        }
      });

      const flashcardsByTopic = { ...state.flashcardsByTopic, [topicId]: merged };
      void saveFlashcardsToCache(flashcardsByTopic);
      return { ...state, flashcardsByTopic };
    });
  },
  addFlashcardOffline: (topicId, input) => {
    const tempId = uuidv4();
    const timestamp = new Date().toISOString();
    const flashcard: FlashcardEntity = {
      id: tempId,
      tempId,
      topicId,
      question: input.question,
      answer: input.answer,
      createdAt: timestamp,
      updatedAt: timestamp,
      isLocalOnly: true
    };

    set((state) => {
      const existing = state.flashcardsByTopic[topicId] ?? [];
      const updated = [...existing, flashcard];
      const flashcardsByTopic = { ...state.flashcardsByTopic, [topicId]: updated };
      void saveFlashcardsToCache(flashcardsByTopic);
      return { ...state, flashcardsByTopic };
    });

    return flashcard;
  },
  markFlashcardSynced: (topicId, tempId, serverFlashcard) => {
    set((state) => {
      const existing = state.flashcardsByTopic[topicId] ?? [];
      const updated = existing.map((card) => {
        if (card.id === tempId || card.tempId === tempId) {
          return { ...serverFlashcard, isLocalOnly: false };
        }
        return card;
      });
      const flashcardsByTopic = { ...state.flashcardsByTopic, [topicId]: updated };
      void saveFlashcardsToCache(flashcardsByTopic);
      return { ...state, flashcardsByTopic };
    });
  },
  hydrateFromCache: (payload) => {
    set((state) => ({ ...state, flashcardsByTopic: payload, hydrated: true }));
  },
  setLastStudyAt: (isoDate) => {
    set((state) => {
      if (isoDate) {
        void saveLastStudyAt(isoDate);
      } else {
        void saveLastStudyAt(null);
      }
      return { ...state, lastStudyAt: isoDate };
    });
  },
  getPendingFlashcardCreates: () => {
    const { flashcardsByTopic } = get();
    return Object.entries(flashcardsByTopic).flatMap(([topicId, cards]) =>
      cards
        .filter((card) => card.isLocalOnly)
        .map((card) => ({ topicId, flashcard: card }))
    );
  },
  reassignTopicId: (oldTopicId, newTopicId) => {
    set((state) => {
      const existing = state.flashcardsByTopic[oldTopicId];
      if (!existing) {
        return state;
      }
      const updatedCards = existing.map((card) => ({ ...card, topicId: newTopicId }));
      const flashcardsByTopic = { ...state.flashcardsByTopic };
      delete flashcardsByTopic[oldTopicId];
      const merged = [...(flashcardsByTopic[newTopicId] ?? []), ...updatedCards];
      flashcardsByTopic[newTopicId] = merged;
      void saveFlashcardsToCache(flashcardsByTopic);
      return { ...state, flashcardsByTopic };
    });
  }
}));
