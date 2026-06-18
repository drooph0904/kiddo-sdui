import { useCartStore } from './cartStore';

// Reset store between tests so each starts from an empty cart.
beforeEach(() => {
  useCartStore.setState({ items: {} });
});

describe('cart store', () => {
  it('addItem increments quantity for an id', () => {
    const { addItem } = useCartStore.getState();
    addItem('p1');
    addItem('p1');
    addItem('p2');
    expect(useCartStore.getState().items).toEqual({ p1: 2, p2: 1 });
  });

  it('removeItem decrements, then deletes the key at zero', () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem('p1');
    addItem('p1');
    removeItem('p1');
    expect(useCartStore.getState().items).toEqual({ p1: 1 });
    removeItem('p1');
    expect(useCartStore.getState().items).toEqual({}); // key removed, not left at 0
  });

  it('removeItem on an absent id is a no-op', () => {
    useCartStore.getState().removeItem('ghost');
    expect(useCartStore.getState().items).toEqual({});
  });
});
