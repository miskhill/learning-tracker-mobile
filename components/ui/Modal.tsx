import type { PropsWithChildren } from 'react';
import { Modal as RNModal, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  title?: string;
  onDismiss: () => void;
}

export function Modal({ visible, title, onDismiss, children }: PropsWithChildren<ModalProps>) {
  return (
    <RNModal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <View style={styles.content}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <View style={styles.body}>{children}</View>
          <Button title="Close" variant="outline" onPress={onDismiss} />
        </View>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  content: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  body: {
    gap: spacing.sm
  }
});
