import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  PanResponder,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Flashcard as FlashcardView } from '@/components/Flashcard';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useFlashcardStore } from '@/store/flashcardStore';

function shuffleCards<T>(cards: T[]): T[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function StudyScreen() {
  const params = useLocalSearchParams<{ topicId: string }>();
  const topicId = Array.isArray(params.topicId) ? params.topicId[0] : params.topicId;
  const { flashcards } = useFlashcards(topicId);
  const setLastStudyAt = useFlashcardStore((state) => state.setLastStudyAt);
  const [deck, setDeck] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (flashcards.length === 0) {
      setDeck([]);
      setCurrentIndex(0);
      setRevealed(false);
      return;
    }
    setDeck(flashcards);
    setCurrentIndex(0);
    setRevealed(false);
  }, [flashcards]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > 50) {
          handlePrevious();
        } else if (gestureState.dx < -50) {
          handleNext();
        }
      }
    })
  ).current;

  const handleNext = () => {
    if (deck.length === 0) {
      return;
    }
    setCurrentIndex((index) => (index + 1) % deck.length);
    setRevealed(false);
  };

  const handlePrevious = () => {
    if (deck.length === 0) {
      return;
    }
    setCurrentIndex((index) => (index - 1 + deck.length) % deck.length);
    setRevealed(false);
  };

  const handleShuffle = () => {
    if (deck.length < 2) {
      Alert.alert('Not enough cards', 'Add more cards to shuffle the deck.');
      return;
    }
    const shuffled = shuffleCards(deck);
    setDeck(shuffled);
    setCurrentIndex(0);
    setRevealed(false);
  };

  const handleToggle = () => {
    setRevealed((value) => {
      const next = !value;
      if (!value && next) {
        setLastStudyAt(new Date().toISOString());
      }
      return next;
    });
  };

  const currentCard = deck[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <Button title="Previous" variant="secondary" onPress={handlePrevious} />
        <Button title="Shuffle" variant="outline" onPress={handleShuffle} />
        <Button title="Next" onPress={handleNext} />
      </View>
      {currentCard ? (
        <View style={styles.cardWrapper} {...panResponder.panHandlers}>
          <FlashcardView
            question={currentCard.question}
            answer={currentCard.answer}
            revealed={revealed}
            onToggle={handleToggle}
            index={currentIndex}
            total={deck.length}
          />
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No flashcards available. Create one to start studying.</Text>
        </View>
      )}
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
  controls: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between'
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center'
  }
});
