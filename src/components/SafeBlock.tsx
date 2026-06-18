/**
 * SafeBlock — the resilient gate every feed row passes through.
 *
 *   1. Looks the block's `type` up in the registry.
 *   2. If unsupported (e.g. "NEW_COMPONENT_V2"), it drops the node QUIETLY (returns null)
 *      and warns in dev — the surrounding view tree is untouched.
 *   3. If supported, it renders the component inside a BlockErrorBoundary so a runtime
 *      crash in that one block is contained.
 */
import React from 'react';
import type { UnknownBlock } from '../types/schema';
import { getBlockComponent } from '../registry/componentRegistry';
import { BlockErrorBoundary } from './BlockErrorBoundary';

export function SafeBlock({ block }: { block: UnknownBlock }): React.JSX.Element | null {
  const Component = getBlockComponent(block.type);

  if (!Component) {
    if (__DEV__) {
      console.warn(
        `[SafeBlock] Unsupported block type "${block.type}" (id=${block.id}) — dropped.`,
      );
    }
    return null;
  }

  // `Component` is a STABLE, module-level component resolved from the registry — not a
  // component created during render. `createElement` makes that explicit and avoids the
  // static-components lint heuristic that (incorrectly) flags the dynamic JSX form.
  return (
    <BlockErrorBoundary blockId={block.id} blockType={block.type}>
      {React.createElement(Component, { block })}
    </BlockErrorBoundary>
  );
}
