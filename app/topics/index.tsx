import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TopicCard } from '@/components/TopicCard';
import { useTopics } from '@/hooks/useTopics';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useFlashcardStore } from '@/store/flashcardStore';

export default function TopicsScreen() {
  const router = useRouter();
  const { topics, loading, refetch } = useTopics();
  const { isConnected } = useNetworkStatus();
  const flashcardCounts = useFlashcardStore((state) => state.flashcardsByTopic);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Topics</Text>
        <Button title="Create Topic" onPress={() => router.push('/topics/create-topic')} />
      </View>
      {!isConnected ? (
        <Text style={styles.offlineBanner}>Offline mode: showing cached topics.</Text>
      ) : null}
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        renderItem={({ item }) => (
          <TopicCard
            topic={item}
            flashcardCount={flashcardCounts[item.id]?.length ?? 0}
            onPress={() => router.push({ pathname: '/topics/[topicId]', params: { topicId: item.id } })}
          />
        )}
        ListEmptyComponent={
          loading ? null : (
            <Text style={styles.empty}>No topics yet. Create your first topic to begin.</Text>
          )
        }
        contentContainerStyle={topics.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  offlineBanner: {
    color: colors.warning,
    marginBottom: spacing.sm
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
