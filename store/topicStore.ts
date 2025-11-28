import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { CreateTopicInput, Topic } from '@/types/graphql';
import { saveTopicsToCache } from '@/lib/storage/offlineCache';
import { useFlashcardStore } from './flashcardStore';

export interface TopicEntity extends Topic {
  tempId?: string;
  isLocalOnly?: boolean;
}

interface TopicStore {
  topics: TopicEntity[];
  selectedTopicId: string | null;
  hydrated: boolean;
  setTopicsFromServer: (topics: Topic[]) => void;
  hydrateFromCache: (topics: TopicEntity[]) => void;
  setSelectedTopic: (topicId: string | null) => void;
  createTopicOffline: (input: CreateTopicInput) => TopicEntity;
  markTopicSynced: (tempId: string, serverTopic: Topic) => void;
  getPendingTopicCreates: () => TopicEntity[];
}

export const useTopicStore = create<TopicStore>((set, get) => ({
  topics: [],
  selectedTopicId: null,
  hydrated: false,
  setTopicsFromServer: (topics) => {
    set((state) => {
      const serverTopics = topics.map((topic) => ({ ...topic, isLocalOnly: false }));
      const localTopics = state.topics.filter((topic) => topic.isLocalOnly);
      const merged = [...serverTopics];

      localTopics.forEach((localTopic) => {
        const exists = merged.some(
          (topic) => topic.id === localTopic.id || topic.tempId === localTopic.tempId
        );
        if (!exists) {
          merged.push(localTopic);
        }
      });

      void saveTopicsToCache(merged);
      return { ...state, topics: merged };
    });
  },
  hydrateFromCache: (topics) => {
    set((state) => ({ ...state, topics, hydrated: true }));
  },
  setSelectedTopic: (topicId) => {
    set((state) => ({ ...state, selectedTopicId: topicId }));
  },
  createTopicOffline: (input) => {
    const tempId = uuidv4();
    const timestamp = new Date().toISOString();
    const topic: TopicEntity = {
      id: tempId,
      tempId,
      name: input.name,
      description: input.description,
      createdAt: timestamp,
      updatedAt: timestamp,
      isLocalOnly: true
    };

    set((state) => {
      const topics = [...state.topics, topic];
      void saveTopicsToCache(topics);
      return { ...state, topics };
    });

    return topic;
  },
  markTopicSynced: (tempId, serverTopic) => {
    set((state) => {
      const topics = state.topics.map((topic) => {
        if (topic.id === tempId || topic.tempId === tempId) {
          return { ...serverTopic, isLocalOnly: false };
        }
        return topic;
      });
      void saveTopicsToCache(topics);
      return { ...state, topics };
    });
    const flashcardStore = useFlashcardStore.getState();
    flashcardStore.reassignTopicId(tempId, serverTopic.id);
  },
  getPendingTopicCreates: () => {
    return get().topics.filter((topic) => topic.isLocalOnly);
  }
}));
