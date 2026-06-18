import { getBlockComponent } from './componentRegistry';

describe('Component Registry (Factory Pattern)', () => {
  it('resolves every supported block type to a component', () => {
    expect(getBlockComponent('BANNER_HERO')).toBeDefined();
    expect(getBlockComponent('PRODUCT_GRID_2X2')).toBeDefined();
    expect(getBlockComponent('DYNAMIC_COLLECTION')).toBeDefined();
  });

  it('returns undefined for an unsupported type (resilience contract)', () => {
    // This undefined is exactly what SafeBlock turns into a graceful drop.
    expect(getBlockComponent('NEW_COMPONENT_V2')).toBeUndefined();
    expect(getBlockComponent('')).toBeUndefined();
    expect(getBlockComponent('banner_hero')).toBeUndefined(); // case-sensitive by design
  });
});
