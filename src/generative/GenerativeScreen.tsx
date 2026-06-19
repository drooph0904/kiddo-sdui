import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UINode } from '../../shared/uiSchema';
import { SafeNode } from './SafeNode';
import { useGenerativeStore } from '../store/generativeStore';
import { generateFromPrompt } from './api';
import { useTheme } from '../theme/ThemeContext';

export function GenerativeScreen(): React.JSX.Element {
  const theme = useTheme();
  const { payload, setPayload } = useGenerativeStore();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateFromPrompt(prompt.trim());
      setPayload(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const items: UINode[] =
    payload?.tree.type === 'Column' ? payload.tree.children : payload?.tree ? [payload.tree] : [];

  const listHeader = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.promptContainer}
    >
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: theme.primary + '40',
          },
        ]}
        placeholder='Describe the screen you want…'
        placeholderTextColor={theme.text + '66'}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        editable={!loading}
        returnKeyType='done'
        blurOnSubmit
      />
      <Pressable
        style={[
          styles.generateBtn,
          { backgroundColor: loading ? theme.primary + '88' : theme.primary },
        ]}
        onPress={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color='#fff' size='small' />
        ) : (
          <Text style={styles.generateBtnText}>✨ Generate</Text>
        )}
      </Pressable>
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: '#FF3B3020' }]}>
          <Text style={[styles.errorText, { color: '#CC0000' }]}>{error}</Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );

  if (items.length === 0) {
    return (
      <View style={[styles.root, { backgroundColor: theme.background }]}>
        {listHeader}
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon]}>🎨</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No layout yet</Text>
          <Text style={[styles.emptyHint, { color: theme.text + '99' }]}>
            Type a prompt above and tap ✨ Generate to create a themed screen.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <FlashList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <SafeNode node={item} />
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  section: { marginBottom: 22 },
  promptContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 56,
    fontWeight: '500',
  },
  generateBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  errorBox: {
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
