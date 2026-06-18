/**
 * PRODUCT_GRID_2X2 — a balanced 2x2 grid nesting four ProductCard components.
 * Tolerates fewer than four products without breaking layout.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ProductGrid2x2Block } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { ProductCard } from '../ProductCard';
import { RenderBadge } from '../RenderBadge';

function ProductGrid2x2Base({ block }: { block: ProductGrid2x2Block }): React.JSX.Element {
  const theme = useTheme();
  const products = block.products.slice(0, 4);

  if (__DEV__) {
    console.log(`[render] ProductGrid2x2 ${block.id}`);
  }

  return (
    <View>
      <RenderBadge label="GRID_2X2" />
      {block.title ? (
        <Text style={[styles.title, { color: theme.text }]}>{block.title}</Text>
      ) : null}
      <View style={styles.grid}>
        {products.map((product) => (
          <View key={product.id} style={styles.cell}>
            <ProductCard product={product} />
          </View>
        ))}
      </View>
    </View>
  );
}

export const ProductGrid2x2 = React.memo(ProductGrid2x2Base);

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cell: {
    width: '47.5%',
    flexGrow: 1,
  },
});
