import React from 'react';
import { ColumnNode, RowNode, GridNode, CarouselNode } from './nodes/Containers';
import { TextNode, ButtonNode, ProductCardNode, BannerNode } from './nodes/Leaves';

export type NodeRenderer = React.ComponentType<{ node: never }>;

const registry: Record<string, React.ComponentType<{ node: never }>> = {
  Column: ColumnNode as never,
  Row: RowNode as never,
  Grid: GridNode as never,
  Carousel: CarouselNode as never,
  Text: TextNode as never,
  Button: ButtonNode as never,
  ProductCard: ProductCardNode as never,
  Banner: BannerNode as never,
};

export function getNodeRenderer(type: string): React.ComponentType<{ node: never }> | undefined {
  return registry[type];
}
