import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UINode } from '../../../shared/uiSchema';
import { SafeNode } from '../SafeNode';

type C = { node: Extract<UINode, { children: UINode[] }> };

const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

function base(node: { padding?: number; gap?: number; background?: string; radius?: number; align?: 'start' | 'center' | 'end' }) {
  return {
    padding: node.padding,
    gap: node.gap,
    backgroundColor: node.background,
    borderRadius: node.radius,
    alignItems: node.align ? alignMap[node.align] : undefined,
  };
}

export function ColumnNode({ node }: C): React.JSX.Element {
  return (
    <View style={[styles.col, base(node)]}>
      {node.children.map((c, i) => <SafeNode key={i} node={c} />)}
    </View>
  );
}
export function RowNode({ node }: C): React.JSX.Element {
  return (
    <View style={[styles.row, base(node)]}>
      {node.children.map((c, i) => <SafeNode key={i} node={c} />)}
    </View>
  );
}
export function GridNode({ node }: { node: Extract<UINode, { type: 'Grid' }> }): React.JSX.Element {
  const w = `${100 / node.columns - 2}%` as const;
  return (
    <View style={[styles.grid, base(node)]}>
      {node.children.map((c, i) => (
        <View key={i} style={{ width: w }}><SafeNode node={c} /></View>
      ))}
    </View>
  );
}
export function CarouselNode({ node }: C): React.JSX.Element {
  return (
    <View style={styles.carousel}>
      <FlashList
        horizontal
        data={node.children}
        renderItem={({ item }) => <View style={styles.cItem}><SafeNode node={item} /></View>}
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  carousel: { height: 250 },
  cItem: { width: 160, marginRight: 12 },
});
