import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UINode } from '../../../shared/uiSchema';
import { useTheme } from '../../theme/ThemeContext';
import { handleAction } from '../../actions/handleAction';
import { ProductCard } from '../../components/ProductCard';

export function TextNode({ node }: { node: Extract<UINode, { type: 'Text' }> }): React.JSX.Element {
  const theme = useTheme();
  const size = node.variant === 'title' ? 22 : node.variant === 'subtitle' ? 16 : 13;
  const weight = node.variant === 'title' ? '900' : node.variant === 'subtitle' ? '700' : '500';
  return <Text style={{ color: theme.text, fontSize: size, fontWeight: weight }}>{node.content}</Text>;
}

export function ButtonNode({ node }: { node: Extract<UINode, { type: 'Button' }> }): React.JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => handleAction(node.action)}
      style={({ pressed }) => [styles.btn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={styles.btnText}>{node.label}</Text>
    </Pressable>
  );
}

export function ProductCardNode({ node }: { node: Extract<UINode, { type: 'ProductCard' }> }): React.JSX.Element {
  // Adapt the generative node to the existing ProductCard's Product shape.
  return (
    <ProductCard
      product={{ id: `gen-${node.title}`, title: node.title, price: node.price, image: '', action: node.action }}
      emojiOverride={node.emoji}
    />
  );
}

export function BannerNode({ node }: { node: Extract<UINode, { type: 'Banner' }> }): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: theme.primary }]}>
      <Text style={styles.bTitle}>{node.title}</Text>
      {node.subtitle ? <Text style={styles.bSub}>{node.subtitle}</Text> : null}
      {node.cta ? (
        <Pressable onPress={() => handleAction(node.cta!.action)} style={[styles.bCta, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.primary, fontWeight: '800' }}>{node.cta.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '800' },
  banner: { borderRadius: 18, padding: 20, gap: 8 },
  bTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  bSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  bCta: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginTop: 6 },
});
