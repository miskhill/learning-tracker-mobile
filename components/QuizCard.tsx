import { StyleSheet, Text, View } from 'react-native';
import { Card } from './ui/Card';
import { spacing } from '@/constants/spacing';
import { colors } from '@/constants/colors';
import { Pressable } from 'react-native';

interface QuizCardProps {
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
  selectedOption?: string | null;
  correctOption?: string;
  showResult?: boolean;
}

export function QuizCard({
  question,
  options,
  onSelectOption,
  selectedOption,
  correctOption,
  showResult = false
}: QuizCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option, index) => {
          const optionKey = `${option}-${index}`;
          const isSelected = option === selectedOption;
          const isCorrect = option === correctOption;
          const styleVariant = showResult
            ? isCorrect
              ? styles.correct
              : isSelected
              ? styles.incorrect
              : styles.option
            : isSelected
            ? styles.selected
            : styles.option;
          return (
            <Pressable
              key={optionKey}
              onPress={() => onSelectOption(option)}
              disabled={showResult}
              style={[styles.option, styleVariant]}
            >
              <Text
                style={[
                  styles.optionText,
                  showResult && isCorrect ? styles.correctText : null,
                  !showResult && isSelected ? styles.selectedText : null
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text
  },
  options: {
    gap: spacing.sm
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF'
  },
  correct: {
    borderColor: colors.success,
    backgroundColor: '#ECFDF5'
  },
  incorrect: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2'
  },
  optionText: {
    fontSize: 16,
    color: colors.text
  },
  selectedText: {
    color: colors.primary,
    fontWeight: '600'
  },
  correctText: {
    color: colors.success,
    fontWeight: '600'
  }
});
