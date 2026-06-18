/**
 * Full-screen live-campaign overlay (confetti, water splash, paper planes…).
 *
 * Rendered absolutely over the entire interactive space, but with pointerEvents="none" so
 * every tap/scroll passes straight through to the operational UI beneath — no input
 * occlusion. lottie-react-native caches the remote animation it fetches by URL.
 *
 * UX: it plays ONCE (loop=false) as a celebratory burst when a campaign becomes active,
 * then settles — instead of distracting forever. The parent remounts it per campaign (via
 * a `key`) so the burst replays each time you switch campaigns. Reduced opacity keeps it
 * tasteful over the shopping UI.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import type { OverlayConfig } from '../types/schema';

export function CampaignOverlay({
  overlay,
}: {
  overlay?: OverlayConfig;
}): React.JSX.Element | null {
  if (!overlay) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.layer]} pointerEvents="none">
      <LottieView
        source={{ uri: overlay.animation_url }}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    opacity: 0.85,
  },
});
