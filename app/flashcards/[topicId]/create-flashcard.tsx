import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useTopicStore } from '@/store/topicStore';

export default function CreateFlashcardScreen() {
  const params = useLocalSearchParams<{ topicId: string }>();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { createFlashcard, creating } = useFlashcards(topicId);
  const topic = useTopicStore((state) =>
    state.topics.find((item) => item.id === topicId || item.tempId === topicId)
  );

  const handleSubmit = async () => {
    if (!topicId) {
      setError('Missing topic');
      return;
    }
    if (!question.trim() || !answer.trim()) {
      setError('Question and answer are required');
      return;
    }

    setError(null);

    try {
      const result = await createFlashcard({ topicId, question: question.trim(), answer: answer.trim() });
      Alert.alert(
        'Flashcard saved',
        result.offline
          ? 'Flashcard stored locally and will sync when online.'
          : 'Flashcard created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace({ pathname: '/flashcards/[topicId]', params: { topicId } })
          }
        ]
      );
    } catch (err) {
      console.warn('Failed to create flashcard', err);
      setError('Could not create flashcard. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>New Flashcard{topic ? ` • ${topic.name}` : ''}</Text>
      <Input label="Question" value={question} onChangeText={setQuestion} autoFocus multiline />
      <Input label="Answer" value={answer} onChangeText={setAnswer} multiline />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button title="Save" onPress={handleSubmit} loading={creating} disabled={creating} />
        <Button title="Cancel" variant="outline" onPress={() => router.back()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm
  }
});
