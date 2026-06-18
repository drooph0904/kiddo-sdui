/**
 * Atomic product card — premium Q-commerce style (Blinkit/Zepto).
 *
 * Memoized: only re-renders when its own qty or props change — never because a sibling
 * card or another feed block updated (Zustand selector isolation).
 *
 * Visuals: a category emoji tile (always on-topic, zero network), a discount badge, a
 * struck-through MRP, and an ADD button that becomes a –  n  + stepper once in the cart.
 * It is "dumb": every press forwards a declarative action to the central dispatcher.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../types/schema';
import { useTheme } from '../theme/ThemeContext';
import { useItemQty } from '../store/cartStore';
import { handleAction } from '../actions/handleAction';
import { getProductVisual } from '../utils/productVisual';
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

  const { emoji, bg } = getProductVisual(product.title);
  // Synthesize a believable MRP + discount for Q-commerce feel.
  const mrp = Math.round((product.price * 1.3) / 5) * 5 + 4;
  const discount = Math.round((1 - product.price / mrp) * 100);

  const removeAction = { type: 'REMOVE_FROM_CART' as const, payload: { id: product.id } };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, width: width ?? undefined },
        width === undefined && styles.flexCell,
      ]}
    >
      <RenderBadge label={product.id} />

      {/* Emoji tile */}
      <View style={[styles.tile, { backgroundColor: bg }]}>
        {discount > 0 ? (
          <View style={[styles.discountChip, { backgroundColor: theme.primary }]}>
            <Text style={styles.discountText}>{discount}%{'\n'}OFF</Text>
          </View>
        ) : null}
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Title */}
      <Text numberOfLines={2} style={[styles.title, { color: theme.text }]}>
        {product.title}
      </Text>

      {/* Price row */}
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.text }]}>₹{product.price}</Text>
        {discount > 0 ? <Text style={styles.mrp}>₹{mrp}</Text> : null}
      </View>

      {/* Cart control */}
      {qty === 0 ? (
        <Pressable
          onPress={() => handleAction(product.action)}
          style={({ pressed }) => [
            styles.addBtn,
            { borderColor: theme.primary, backgroundColor: theme.primary + '10', opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.addBtnText, { color: theme.primary }]}>ADD</Text>
        </Pressable>
      ) : (
        <View style={[styles.stepper, { backgroundColor: theme.primary }]}>
          <Pressable
            onPress={() => handleAction(removeAction)}
            style={styles.stepBtn}
            hitSlop={8}
          >
            <Text style={styles.stepSymbol}>−</Text>
          </Pressable>
          <Text style={styles.stepQty}>{qty}</Text>
          <Pressable
            onPress={() => handleAction(product.action)}
            style={styles.stepBtn}
            hitSlop={8}
          >
            <Text style={styles.stepSymbol}>+</Text>
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  flexCell: {
    flex: 1,
  },
  tile: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 52,
  },
  discountChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
    textAlign: 'center',
  },
  title: {
    marginTop: 8,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
    marginBottom: 9,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  mrp: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  stepBtn: {
    paddingHorizontal: 2,
  },
  stepSymbol: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
    color: '#FFFFFF',
  },
  stepQty: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    minWidth: 18,
    textAlign: 'center',
  },
});
