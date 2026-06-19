import React from 'react';
import type { UINode } from '../../shared/uiSchema';
import { getNodeRenderer } from './nodeRegistry';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';

export function SafeNode({ node }: { node: UINode }): React.JSX.Element | null {
  const Renderer = getNodeRenderer(node.type);
  if (!Renderer) {
    if (__DEV__) console.warn(`[SafeNode] Unknown node type "${(node as { type: string }).type}" — dropped.`);
    return null;
  }
  return (
    <BlockErrorBoundary blockId={node.type} blockType={node.type}>
      {React.createElement(Renderer, { node: node as never })}
    </BlockErrorBoundary>
  );
}
