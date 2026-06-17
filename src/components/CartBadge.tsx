/**
 * Floating cart badge. Subscribes ONLY to the cart-count selector, so it re-renders when
 * the total changes — and crucially, it is the only thing besides the tapped card that does.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCartCount } from '../store/cartStore';
import { useTheme } from '../theme/ThemeContext';

export function CartBadge(): React.JSX.Element {
  const count = useCartCount();
  const theme = useTheme();

  if (__DEV__) {
    console.log(`[render] CartBadge (count=${count})`);
  }

  return (
    <View style={[styles.badge, { backgroundColor: theme.primary }]} pointerEvents="none">
      <Text style={styles.label}>🛒 {count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    minWidth: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
