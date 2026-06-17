/**
 * DYNAMIC_COLLECTION — a horizontally-scrolling carousel grouped under a server-pushed
 * marketing theme (e.g. "Snacks under ₹99"), nested inside the master vertical feed.
 *
 * Virtualization boundary: this is its own horizontal FlashList, so cards are virtualized
 * independently and horizontal drags are absorbed here without stealing the parent list's
 * vertical momentum. renderItem/keyExtractor are memoized to keep frames stable.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { DynamicCollectionBlock, Product } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { ProductCard } from '../ProductCard';

const CARD_WIDTH = 150;

function DynamicCollectionBase({ block }: { block: DynamicCollectionBlock }): React.JSX.Element {
  const theme = useTheme();

  if (__DEV__) {
    console.log(`[render] DynamicCollection ${block.id}`);
  }

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} width={CARD_WIDTH} />,
    [],
  );
  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <View>
      <Text style={[styles.title, { color: theme.text }]}>{block.title}</Text>
      <View style={styles.listWrap}>
        <FlashList
          horizontal
          data={block.products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={styles.content}
        />
      </View>
    </View>
  );
}

function Separator(): React.JSX.Element {
  return <View style={styles.separator} />;
}

export const DynamicCollection = React.memo(DynamicCollectionBase);

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  // FlashList needs a bounded cross-axis; the card height (~230) defines the row.
  listWrap: {
    height: 240,
  },
  content: {
    paddingRight: 4,
  },
  separator: {
    width: 12,
  },
});
