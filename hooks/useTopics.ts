import { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import NetInfo from '@react-native-community/netinfo';
import { TOPICS_QUERY, CREATE_TOPIC_MUTATION } from '@/lib/apollo/queries';
import type { CreateTopicInput, Topic } from '@/types/graphql';
import { useTopicStore } from '@/store/topicStore';

interface CreateTopicResult {
  topic: Topic;
  offline: boolean;
}

export function useTopics() {
  const topics = useTopicStore((state) => state.topics);
  const setTopicsFromServer = useTopicStore((state) => state.setTopicsFromServer);
  const createTopicOffline = useTopicStore((state) => state.createTopicOffline);

  const { loading, refetch } = useQuery(TOPICS_QUERY, {
    onCompleted: (result) => {
      if (result?.topics) {
        setTopicsFromServer(result.topics);
      }
    },
    onError: (error) => {
      console.warn('Topics query error', error);
    }
  });

  const [createTopicMutation, createState] = useMutation(CREATE_TOPIC_MUTATION);

  const createTopic = useCallback(
    async (input: CreateTopicInput): Promise<CreateTopicResult> => {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        const topic = createTopicOffline(input);
        return { topic, offline: true };
      }

      const result = await createTopicMutation({
        variables: { input }
      });

      const createdTopic = result.data?.createTopic;
      if (createdTopic) {
        await refetch();
        return { topic: createdTopic, offline: false };
      }

      throw new Error('Failed to create topic');
    },
    [createTopicMutation, createTopicOffline, refetch]
  );

  return {
    topics,
    loading,
    refreshing: loading,
    refetch,
    createTopic,
    creating: createState.loading
  };
}
