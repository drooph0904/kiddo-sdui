/**
 * Atomic product card — Blinkit/Zepto style.
 *
 * Memoized: only re-renders when its own qty or props change — never because a
 * sibling card or another feed block updated (Zustand selector isolation).
 *
 * UX: when qty = 0 shows an "Add" button; when qty > 0 shows a –  n  + stepper,
 * matching what users expect from a Q-commerce app. All actions route through
 * the central handleAction dispatcher — this component holds zero business logic.
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
  width?: number;
}

function ProductCardBase({ product, width }: ProductCardProps): React.JSX.Element {
  const theme = useTheme();
  const qty = useItemQty(product.id);

  if (__DEV__) {
    console.log(`[render] ProductCard ${product.id} (qty=${qty})`);
  }

  const removeAction = {
    type: 'REMOVE_FROM_CART' as const,
    payload: { id: product.id },
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, width: width ?? undefined },
        width === undefined && styles.flexCell,
      ]}
    >
      <RenderBadge label={product.id} />

      {/* Product image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={200}
        />
      </View>

      {/* Product info */}
      <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
        {product.title}
      </Text>
      <Text style={[styles.price, { color: theme.text }]}>₹{product.price}</Text>

      {/* Cart control */}
      {qty === 0 ? (
        <Pressable
          onPress={() => handleAction(product.action)}
          style={({ pressed }) => [
            styles.addBtn,
            { borderColor: theme.primary, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.addBtnText, { color: theme.primary }]}>ADD +</Text>
        </Pressable>
      ) : (
        <View style={[styles.stepper, { borderColor: theme.primary }]}>
          <Pressable
            onPress={() => handleAction(removeAction)}
            style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={8}
          >
            <Text style={[styles.stepSymbol, { color: theme.primary }]}>−</Text>
          </Pressable>
          <Text style={[styles.stepQty, { color: theme.primary }]}>{qty}</Text>
          <Pressable
            onPress={() => handleAction(product.action)}
            style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
            hitSlop={8}
          >
            <Text style={[styles.stepSymbol, { color: theme.primary }]}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export const ProductCard = React.memo(ProductCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  flexCell: {
    flex: 1,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: 120,
  },
  title: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    minHeight: 34,
  },
  price: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  /* ADD button — outlined, matches Q-commerce apps */
  addBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  /* +/− stepper */
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  stepBtn: {
    padding: 2,
  },
  stepSymbol: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepQty: {
    fontSize: 15,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
});
