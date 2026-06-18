/**
 * Root engine node. Holds active-campaign state and derives the theme,
 * feed blocks, and Lottie overlay from it. ThemeProvider wraps the entire
 * tree so switching campaigns recolors every component instantly (OTA theming).
 */
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { CampaignOverlay } from './src/components/CampaignOverlay';
import { CartBadge } from './src/components/CartBadge';
import { CampaignPicker, type PickerOption } from './src/components/CampaignPicker';
import { useDebugStore } from './src/store/debugStore';
import { campaigns, homePayload } from './src/data';
import type { OverlayConfig, Theme, UnknownBlock } from './src/types/schema';

const HOME_ID = 'home';

interface ActiveContext {
  theme: Theme;
  blocks: UnknownBlock[];
  overlay?: OverlayConfig;
}

export default function App(): React.JSX.Element {
  const [activeId, setActiveId] = useState<string>(HOME_ID);
  const toggleBadges = useDebugStore((s) => s.toggleBadges);

  const options: PickerOption[] = useMemo(
    () => [
      { id: HOME_ID, label: '🏠 Home' },
      ...campaigns.map((c) => ({ id: c.id, label: c.name })),
    ],
    [],
  );

  const active: ActiveContext = useMemo(() => {
    const campaign = campaigns.find((c) => c.id === activeId);
    return campaign
      ? { theme: campaign.theme, blocks: campaign.blocks, overlay: campaign.overlay }
      : { theme: homePayload.theme, blocks: homePayload.blocks };
  }, [activeId]);

  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 44;

  const listHeader = (
    <View style={styles.header}>
      {/* Brand row */}
      <View style={styles.brandRow}>
        <View>
          <Text style={[styles.brand, { color: active.theme.primary }]}>kiddo 🩷</Text>
          <Text style={[styles.tagline, { color: active.theme.text }]}>
            the best for your kiddo
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Debug toggle for render badges */}
          <Pressable
            onPress={toggleBadges}
            hitSlop={10}
            style={[styles.debugBtn, { borderColor: active.theme.primary }]}
          >
            <Text style={styles.debugIcon}>🐞</Text>
          </Pressable>
          {/* Delivery badge */}
          <View style={[styles.deliveryBadge, { backgroundColor: active.theme.primary + '18' }]}>
            <Text style={styles.deliveryIcon}>⚡</Text>
            <View>
              <Text style={[styles.deliveryMin, { color: active.theme.primary }]}>10 min</Text>
              <Text style={[styles.deliveryLabel, { color: active.theme.text }]}>delivery</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search bar (Blinkit-style, visual) */}
      <View style={[styles.searchBar, { backgroundColor: active.theme.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={[styles.searchText, { color: active.theme.text }]}>
          Search “diapers”, “formula”, “toys”…
        </Text>
      </View>

      {/* Campaign picker */}
      <CampaignPicker options={options} activeId={activeId} onSelect={setActiveId} />
    </View>
  );

  return (
    <ThemeProvider theme={active.theme}>
      <View
        style={[
          styles.root,
          { backgroundColor: active.theme.background, paddingTop: topInset },
        ]}
      >
        <StatusBar barStyle="dark-content" backgroundColor={active.theme.background} />
        <HomeScreen blocks={active.blocks} listHeader={listHeader} />
        <CampaignOverlay key={activeId} overlay={active.overlay} />
        <CartBadge />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 6,
    paddingBottom: 16,
    gap: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugIcon: {
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchText: {
    fontSize: 13,
    opacity: 0.55,
    fontWeight: '500',
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    opacity: 0.65,
    marginTop: 1,
    fontWeight: '500',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deliveryIcon: {
    fontSize: 18,
  },
  deliveryMin: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 17,
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
  },
});
