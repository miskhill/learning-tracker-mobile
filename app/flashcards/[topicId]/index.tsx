import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useTopicStore } from '@/store/topicStore';

export default function FlashcardListScreen() {
  const params = useLocalSearchParams<{ topicId: string }>();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const router = useRouter();
  const topic = useTopicStore((state) =>
    state.topics.find((item) => item.id === topicId || item.tempId === topicId)
  );
  const { flashcards, loading, refetch } = useFlashcards(topicId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{topic?.name ?? 'Flashcards'}</Text>
          <Text style={styles.count}>{flashcards.length} cards</Text>
        </View>
        <Button
          title="Add Card"
          onPress={() =>
            router.push({ pathname: '/flashcards/[topicId]/create-flashcard', params: { topicId } })
          }
        />
      </View>
      <FlatList
        data={flashcards}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.divider}>Answer</Text>
            <Text style={styles.answer}>{item.answer}</Text>
            {item.isLocalOnly ? <Text style={styles.offline}>Pending sync</Text> : null}
          </Card>
        )}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>No flashcards yet. Create one to begin studying.</Text>
          )
        }
        contentContainerStyle={flashcards.length === 0 ? styles.emptyContainer : undefined}
      />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  count: {
    color: colors.muted
  },
  card: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  divider: {
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase'
  },
  answer: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500'
  },
  offline: {
    fontSize: 12,
    color: colors.warning
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
