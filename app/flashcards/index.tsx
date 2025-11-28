import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTopics } from '@/hooks/useTopics';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function FlashcardsHomeScreen() {
  const router = useRouter();
  const { topics } = useTopics();
  const params = useLocalSearchParams<{ mode?: string }>();
  const preferredMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  const handleNavigate = (topicId: string, mode: 'list' | 'study' | 'quiz') => {
    if (mode === 'list') {
      router.push({ pathname: '/flashcards/[topicId]', params: { topicId } });
      return;
    }
    router.push({ pathname: `/flashcards/[topicId]/${mode}`, params: { topicId } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>
      <Text style={styles.subtitle}>
        Choose a topic to review cards, run through a study session, or take a quiz.
      </Text>
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        contentContainerStyle={topics.length === 0 ? styles.emptyContainer : undefined}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? <Text style={styles.cardDescription}>{item.description}</Text> : null}
            <View style={styles.cardActions}>
              <Button
                title="View"
                variant="secondary"
                onPress={() => handleNavigate(item.id, 'list')}
              />
              <Button
                title="Study"
                onPress={() => handleNavigate(item.id, 'study')}
                variant={preferredMode === 'study' ? 'primary' : 'secondary'}
              />
              <Button
                title="Quiz"
                variant={preferredMode === 'quiz' ? 'primary' : 'secondary'}
                onPress={() => handleNavigate(item.id, 'quiz')}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No topics available yet. Create a topic to start adding flashcards.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: spacing.md
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text
  },
  cardDescription: {
    color: colors.muted
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap'
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  empty: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center'
  }
});
