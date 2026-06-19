import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UINode } from '../../shared/uiSchema';
import { SafeNode } from './SafeNode';

export function GenerativeScreen({ tree }: { tree: UINode }): React.JSX.Element {
  // Virtualize top-level sections: if root is a Column, render its children as list items.
  const items: UINode[] = tree.type === 'Column' ? tree.children : [tree];
  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <View style={styles.section}><SafeNode node={item} /></View>}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  section: { marginBottom: 22 },
});
