/**
 * Tiny dev-only UI toggle for the render-counter badges.
 *
 * The badges prove the assignment's render-isolation mandate (tap one card → only that
 * card re-renders), but they clutter the production-style UI. So they are OFF by default
 * for a clean Blinkit-style look, and a 🐞 button in the header flips them on for the demo.
 */
import { create } from 'zustand';

interface DebugState {
  showBadges: boolean;
  toggleBadges: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  showBadges: false,
  toggleBadges: () => set((s) => ({ showBadges: !s.showBadges })),
}));

export function useShowBadges(): boolean {
  return useDebugStore((s) => s.showBadges);
}
