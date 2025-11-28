import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTopicStore } from '@/store/topicStore';
import { Card } from '@/components/ui/Card';

export default function TopicDetailScreen() {
  const params = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const topic = useTopicStore((state) =>
    state.topics.find((item) => item.id === topicId || item.tempId === topicId)
  );
  const setSelectedTopic = useTopicStore((state) => state.setSelectedTopic);

  useEffect(() => {
    if (topicId) {
      setSelectedTopic(topicId);
    }
  }, [topicId, setSelectedTopic]);

  if (!topic) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>Topic not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>{topic.name}</Text>
        {topic.description ? <Text style={styles.description}>{topic.description}</Text> : null}
        {topic.isLocalOnly ? (
          <Text style={styles.offline}>Pending sync. Actions will be queued offline.</Text>
        ) : null}
      </Card>
      <View style={styles.actions}>
        <Button
          title="View Flashcards"
          variant="secondary"
          onPress={() => router.push({ pathname: '/flashcards/[topicId]', params: { topicId: topic.id } })}
        />
        <Button
          title="Create Flashcard"
          onPress={() =>
            router.push({ pathname: '/flashcards/[topicId]/create-flashcard', params: { topicId: topic.id } })
          }
        />
        <Button
          title="Study Mode"
          onPress={() => router.push({ pathname: '/flashcards/[topicId]/study', params: { topicId: topic.id } })}
        />
        <Button
          title="Quiz Mode"
          variant="outline"
          onPress={() => router.push({ pathname: '/flashcards/[topicId]/quiz', params: { topicId: topic.id } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background
  },
  card: {
    gap: spacing.sm
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  description: {
    fontSize: 16,
    color: colors.muted
  },
  offline: {
    color: colors.warning,
    fontSize: 14
  },
  actions: {
    gap: spacing.md
  },
  missing: {
    fontSize: 18,
    color: colors.muted
  }
});
