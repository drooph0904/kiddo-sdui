/**
 * Atomic product card. Memoized so it only re-renders when its own props or its own cart
 * quantity change — never because a sibling card or another feed block updated.
 *
 * It is "dumb": pressing Add-to-Cart just forwards the product's declarative `action` to
 * the central dispatcher. It holds no cart logic of its own.
 */
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../types/schema';
import { useTheme } from '../theme/ThemeContext';
import { useItemQty } from '../store/cartStore';
import { handleAction } from '../actions/handleAction';
import { RenderBadge } from './RenderBadge';

interface ProductCardProps {
  product: Product;
  /** Fixed width for horizontal carousels; omit to flex inside a grid cell. */
  width?: number;
}

function ProductCardBase({ product, width }: ProductCardProps): React.JSX.Element {
  const theme = useTheme();
  const qty = useItemQty(product.id);

  // Verification aid: watch Metro logs — only the tapped card logs again.
  if (__DEV__) {
    console.log(`[render] ProductCard ${product.id} (qty=${qty})`);
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, width: width ?? undefined },
        width === undefined && styles.flexCell,
      ]}
    >
      <RenderBadge label={product.id} />
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
      <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
        {product.title}
      </Text>
      <Text style={[styles.price, { color: theme.text }]}>₹{product.price}</Text>

      <Pressable
        onPress={() => handleAction(product.action)}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>
          {qty > 0 ? `In cart · ${qty}` : 'Add to Cart'}
        </Text>
      </Pressable>
    </View>
  );
}

export const ProductCard = React.memo(ProductCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  flexCell: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 110,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
  },
  title: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    minHeight: 34,
  },
  price: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '800',
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
