/**
 * Root engine node.
 *
 * Holds the single piece of app-level state — which campaign is live — and from it derives
 * the active theme, feed blocks, and overlay. The whole tree is wrapped in ThemeProvider so
 * switching campaigns recolors everything instantly (OTA theming), with the campaign overlay
 * and cart badge layered above the feed.
 */
import React, { useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ThemeProvider } from './src/theme/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { CampaignOverlay } from './src/components/CampaignOverlay';
import { CartBadge } from './src/components/CartBadge';
import { CampaignPicker, type PickerOption } from './src/components/CampaignPicker';
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

  const options: PickerOption[] = useMemo(
    () => [
      { id: HOME_ID, label: 'Home' },
      ...campaigns.map((campaign) => ({ id: campaign.id, label: campaign.name })),
    ],
    [],
  );

  const active: ActiveContext = useMemo(() => {
    const campaign = campaigns.find((c) => c.id === activeId);
    if (campaign) {
      return { theme: campaign.theme, blocks: campaign.blocks, overlay: campaign.overlay };
    }
    return { theme: homePayload.theme, blocks: homePayload.blocks, overlay: undefined };
  }, [activeId]);

  const listHeader = (
    <View style={styles.header}>
      <Text style={[styles.brand, { color: active.theme.primary }]}>kiddo</Text>
      <Text style={[styles.tagline, { color: active.theme.text }]}>
        the best for your kiddo · delivered in minutes
      </Text>
      <CampaignPicker options={options} activeId={activeId} onSelect={setActiveId} />
    </View>
  );

  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 44;

  return (
    <ThemeProvider theme={active.theme}>
      <View
        style={[
          styles.root,
          { backgroundColor: active.theme.background, paddingTop: topInset },
        ]}
      >
        <StatusBar barStyle="dark-content" />
        <HomeScreen blocks={active.blocks} listHeader={listHeader} />
        <CampaignOverlay overlay={active.overlay} />
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
    paddingTop: 8,
    paddingBottom: 14,
  },
  brand: {
    fontSize: 30,
    fontWeight: '900',
  },
  tagline: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
    opacity: 0.8,
  },
});
