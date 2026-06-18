/**
 * Cart state (Zustand).
 *
 * Render-isolation is the whole point here. The store keeps a flat `items` map. Components
 * never subscribe to the whole store — they use the narrow selector hooks below:
 *
 *   - `useItemQty(id)`  -> a ProductCard re-renders only when ITS quantity changes.
 *   - `useCartCount()`  -> the CartBadge re-renders only when the total changes.
 *
 * Because each hook returns a primitive that Zustand compares with Object.is, tapping
 * "Add to Cart" on one card cannot trigger re-renders in the other ~30 feed blocks.
 *
 * Non-React code (the action dispatcher) mutates via `useCartStore.getState().addItem(id)`.
 */
import { create } from 'zustand';

interface CartState {
  items: Record<string, number>;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: {},
  addItem: (id: string) =>
    set((state) => ({
      items: { ...state.items, [id]: (state.items[id] ?? 0) + 1 },
    })),
  removeItem: (id: string) =>
    set((state) => {
      const current = state.items[id] ?? 0;
      if (current <= 1) {
        const next = { ...state.items };
        delete next[id];
        return { items: next };
      }
      return { items: { ...state.items, [id]: current - 1 } };
    }),
}));

/** Quantity of a single product. Subscribers re-render only when this id changes. */
export function useItemQty(id: string): number {
  return useCartStore((state) => state.items[id] ?? 0);
}

/** Total items in the cart. Subscribers re-render only when the total changes. */
export function useCartCount(): number {
  return useCartStore((state) =>
    Object.values(state.items).reduce((sum, qty) => sum + qty, 0),
  );
}
