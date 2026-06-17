/**
 * Component Registry — a declarative hash-map from a backend block `type` string to the
 * React component that renders it (the Factory Pattern, NOT a switch statement).
 *
 * Adding support for a new block type is a one-line registration here; nothing else in the
 * renderer changes. Lookup misses return `undefined`, which the SafeBlock turns into a
 * graceful drop.
 *
 * Each component internally consumes its specific, fully-typed block. They are registered
 * against the open `UnknownBlock` shape via a single deliberate cast — this is the one
 * boundary where "the registry guarantees the type matches the key" is asserted.
 */
import React from 'react';
import type { UnknownBlock } from '../types/schema';
import { BannerHero } from '../components/blocks/BannerHero';
import { ProductGrid2x2 } from '../components/blocks/ProductGrid2x2';
import { DynamicCollection } from '../components/blocks/DynamicCollection';

export type BlockComponent = React.ComponentType<{ block: UnknownBlock }>;

export const componentRegistry: Record<string, BlockComponent> = {
  BANNER_HERO: BannerHero as unknown as BlockComponent,
  PRODUCT_GRID_2X2: ProductGrid2x2 as unknown as BlockComponent,
  DYNAMIC_COLLECTION: DynamicCollection as unknown as BlockComponent,
};

/** Returns the renderer for a block type, or `undefined` if unsupported. */
export function getBlockComponent(type: string): BlockComponent | undefined {
  return componentRegistry[type];
}
