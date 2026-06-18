/**
 * HomeScreen — the entire feed streams through ONE vertical FlashList.
 *
 * Each block is rendered via SafeBlock (registry lookup + fault isolation). keyExtractor is
 * stable (block id) and renderItem is memoized, so virtualization stays smooth and unrelated
 * rows never re-render. The campaign picker is passed in as the list header.
 */
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UnknownBlock } from '../types/schema';
import { SafeBlock } from '../components/SafeBlock';


interface HomeScreenProps {
  blocks: UnknownBlock[];
  listHeader: React.ReactElement;
}

export function HomeScreen({ blocks, listHeader }: HomeScreenProps): React.JSX.Element {
  const renderItem = useCallback(
    ({ item }: { item: UnknownBlock }) => (
      <View style={styles.row}>
        <SafeBlock block={item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: UnknownBlock) => item.id, []);

  return (
    <FlashList
      data={blocks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },
  row: {
    marginBottom: 22,
  },
});
