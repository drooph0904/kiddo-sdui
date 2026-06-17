/**
 * OTA theming. The active payload's `theme` palette is pushed into this Context at the
 * root, and every component samples it via `useTheme()` — so changing the JSON theme (or
 * switching campaigns) recolors the whole UI with no code change and no app release.
 */
import React, { createContext, useContext } from 'react';
import type { Theme } from '../types/schema';

/** Safe fallback used if a payload omits a theme or a value is malformed. */
export const DEFAULT_THEME: Theme = {
  primary: '#FF6B6B',
  background: '#FFF5E6',
  surface: '#FFFFFF',
  text: '#1F2933',
  accent: '#FFD23F',
};

const ThemeContext = createContext<Theme>(DEFAULT_THEME);

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps): React.JSX.Element {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Read the active theme palette. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
