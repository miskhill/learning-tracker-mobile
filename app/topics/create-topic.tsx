import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useTopics } from '@/hooks/useTopics';

export default function CreateTopicScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { createTopic, creating } = useTopics();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }

    setError(null);

    try {
      const result = await createTopic({ name: name.trim(), description: description.trim() });
      Alert.alert(
        'Topic saved',
        result.offline
          ? 'Topic stored locally and will sync when you are back online.'
          : 'Topic created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/topics')
          }
        ]
      );
    } catch (err) {
      console.warn('Failed to create topic', err);
      setError('Could not create topic. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create Topic</Text>
      <Input label="Name" value={name} onChangeText={setName} autoFocus />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Optional description"
        multiline
        numberOfLines={4}
        style={styles.descriptionInput}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button
          title="Save Topic"
          onPress={handleSubmit}
          loading={creating}
          disabled={creating}
        />
        <Button title="Cancel" variant="outline" onPress={() => router.back()} />
      </View>
    </KeyboardAvoidingView>
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
    color: colors.text,
    marginBottom: spacing.md
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  error: {
    color: colors.danger
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm
  }
});
