import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Card } from './ui/Card';

interface FlashcardProps {
  question: string;
  answer: string;
  revealed: boolean;
  onToggle: () => void;
  index: number;
  total: number;
}

export function Flashcard({ question, answer, revealed, onToggle, index, total }: FlashcardProps) {
  return (
    <Pressable onPress={onToggle} accessibilityRole="button">
      <Card style={styles.card}>
        <View>
          <Text style={styles.counter}>
            {index + 1} / {total}
          </Text>
          <Text style={styles.question}>{question}</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.answerLabel}>{revealed ? 'Answer' : 'Tap to reveal'}</Text>
        {revealed ? <Text style={styles.answer}>{answer}</Text> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 260,
    justifyContent: 'space-between'
  },
  counter: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.sm
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md
  },
  answerLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.xs
  },
  answer: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '500'
  }
});
