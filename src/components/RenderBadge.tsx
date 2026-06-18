/**
 * Dev-only render counter badge.
 *
 * Shows a small chip in the top-right corner of each block counting how many times that
 * component has re-rendered since the app loaded. When a reviewer taps "Add to Cart" on
 * one card and watches this badge, they can see with their own eyes that only the tapped
 * card's count ticks up — every other block's badge stays frozen. This makes the
 * React.memo + Zustand-selector render isolation visible without needing to read logs.
 *
 * Rendered only in __DEV__ builds; invisible in production.
 *
 * NOTE: this file intentionally reads and bumps a ref during render — that is exactly how a
 * render counter must work. The `react-hooks/refs` rule (which guards against accidental
 * ref-during-render) is therefore disabled for this one diagnostic-only component.
 */
/* eslint-disable react-hooks/refs */
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useShowBadges } from '../store/debugStore';

interface RenderBadgeProps {
  label: string;
}

export function RenderBadge({ label }: RenderBadgeProps): React.JSX.Element | null {
  const count = useRef(0);
  count.current += 1;
  const show = useShowBadges();

  if (!__DEV__ || !show) return null;

  return (
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.text}>{label} · renders: {count.current}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
