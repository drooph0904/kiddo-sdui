import { create } from 'zustand';
import type { GeneratedPayload } from '../../shared/uiSchema';

interface GenerativeState {
  payload: GeneratedPayload | null;
  setPayload: (p: GeneratedPayload) => void;
  clear: () => void;
}
export const useGenerativeStore = create<GenerativeState>((set) => ({
  payload: null,
  setPayload: (payload) => set({ payload }),
  clear: () => set({ payload: null }),
}));
