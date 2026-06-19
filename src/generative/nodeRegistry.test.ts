import { getNodeRenderer } from './nodeRegistry';

it('resolves known node types', () => {
  ['Column', 'Row', 'Grid', 'Carousel', 'Text', 'Button', 'ProductCard', 'Banner'].forEach(
    (t) => expect(getNodeRenderer(t)).toBeDefined(),
  );
});

it('returns undefined for unknown node types', () => {
  expect(getNodeRenderer('Hologram')).toBeUndefined();
});
