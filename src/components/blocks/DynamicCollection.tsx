/**
 * DYNAMIC_COLLECTION — horizontal carousel with "See all →" section header.
 * Nested horizontal FlashList inside the vertical feed. Gesture separation
 * ensures horizontal drags don't steal vertical scroll momentum.
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { DynamicCollectionBlock, Product } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { ProductCard } from '../ProductCard';
import { RenderBadge } from '../RenderBadge';

const CARD_WIDTH = 158;

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
      <RenderBadge label="DYNAMIC_COLLECTION" />

      {/* Section header: title + "See all" */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{block.title}</Text>
        <TouchableOpacity activeOpacity={0.6}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See all →</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  listWrap: {
    height: 252,
  },
  content: {
    paddingRight: 4,
  },
  separator: {
    width: 12,
  },
});
