import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useFlashcardStore } from '@/store/flashcardStore';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const lastStudyAt = useFlashcardStore((state) => state.lastStudyAt);

  const lastStudyLabel = useMemo(() => {
    if (!lastStudyAt) {
      return 'You have not studied yet. Start your first session!';
    }
    return `Last study session: ${dayjs(lastStudyAt).format('MMMM D, YYYY h:mm A')}`;
  }, [lastStudyAt]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Learning Tracker</Text>
      <Text style={styles.subtitle}>
        Keep your knowledge sharp with flashcards, quizzes, and smart reminders.
      </Text>

      <View style={styles.actions}>
        <Button title="View Topics" onPress={() => router.push('/topics')} size="lg" />
        <Button title="Study Flashcards" onPress={() => router.push('/flashcards')} size="lg" />
        <Button title="Take a Quiz" onPress={() => router.push({ pathname: '/flashcards', params: { mode: 'quiz' } })} size="lg" />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Study Progress</Text>
        <Text style={styles.cardText}>{lastStudyLabel}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted
  },
  actions: {
    gap: spacing.md
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text
  },
  cardText: {
    fontSize: 16,
    color: colors.muted
  }
});
