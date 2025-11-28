import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuizCard } from '@/components/QuizCard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useFlashcardStore } from '@/store/flashcardStore';
import type { QuizQuestion } from '@/types/graphql';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizQuestions(flashcards: { question: string; answer: string; id: string }[]): QuizQuestion[] {
  if (flashcards.length === 0) {
    return [];
  }

  const questions = flashcards.map((card) => {
    const otherAnswers = flashcards
      .filter((other) => other.id !== card.id)
      .map((other) => other.answer);
    while (otherAnswers.length < 3) {
      otherAnswers.push('None of the above');
    }
    const options = shuffleArray([card.answer, ...otherAnswers.slice(0, 3)]);
    return {
      id: card.id,
      question: `What is the answer to: ${card.question}?`,
      options,
      answer: card.answer
    };
  });

  return shuffleArray(questions);
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{ topicId: string }>();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const router = useRouter();
  const { flashcards } = useFlashcards(topicId);
  const setLastStudyAt = useFlashcardStore((state) => state.setLastStudyAt);

  const questions = useMemo(() => buildQuizQuestions(flashcards), [flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (flashcards.length < 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Add at least one flashcard to generate a quiz.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (showResult) {
      return;
    }
    setSelectedOption(option);
    setShowResult(true);
    if (option === currentQuestion.answer) {
      setScore((value) => value + 1);
    }
    setLastStudyAt(new Date().toISOString());
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setSelectedOption(null);
    setShowResult(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <View style={styles.container}>
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Quiz Complete</Text>
          <Text style={styles.resultsText}>
            You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%).
          </Text>
        </View>
        <View style={styles.resultsActions}>
          <Button title="Restart Quiz" onPress={handleRestart} />
          <Button
            title="Back to Cards"
            variant="outline"
            onPress={() =>
              router.replace({ pathname: '/flashcards/[topicId]', params: { topicId } })
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {currentIndex + 1} of {questions.length}
      </Text>
      <QuizCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        onSelectOption={handleSelectOption}
        selectedOption={selectedOption}
        correctOption={currentQuestion.answer}
        showResult={showResult}
      />
      <View style={styles.actions}>
        <Button
          title={currentIndex + 1 === questions.length ? 'Finish' : 'Next Question'}
          onPress={handleNextQuestion}
          disabled={!showResult}
        />
        <Button title="Restart" variant="outline" onPress={handleRestart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center'
  },
  progress: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center'
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between'
  },
  empty: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center'
  },
  resultsCard: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.sm
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  resultsText: {
    fontSize: 16,
    color: colors.muted
  },
  resultsActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center'
  }
});
