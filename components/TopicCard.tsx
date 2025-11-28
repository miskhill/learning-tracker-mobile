import type { TopicEntity } from '@/store/topicStore';
import { Card } from './ui/Card';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Pressable } from 'react-native';

interface TopicCardProps {
  topic: TopicEntity;
  flashcardCount?: number;
  onPress?: () => void;
}

export function TopicCard({ topic, flashcardCount, onPress }: TopicCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={[styles.card, topic.isLocalOnly ? styles.pending : null]}>
        <View style={styles.header}>
          <Text style={styles.title}>{topic.name}</Text>
          {topic.isLocalOnly ? <Text style={styles.badge}>Offline</Text> : null}
        </View>
        {topic.description ? <Text style={styles.description}>{topic.description}</Text> : null}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {flashcardCount ?? 0} flashcard{(flashcardCount ?? 0) === 1 ? '' : 's'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.warning,
    color: colors.warning
  },
  description: {
    color: colors.muted,
    marginBottom: spacing.sm
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  metaText: {
    fontSize: 14,
    color: colors.muted
  },
  pending: {
    borderStyle: 'dashed'
  }
});
