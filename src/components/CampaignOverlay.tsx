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
 *
 * Media pipeline: the animation JSON is pulled through `useCachedLottie`, which downloads
 * each URL once and serves every later request from memory (req: efficient cache pipeline).
 * `cacheComposition` additionally caches the parsed composition on Android.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import type { OverlayConfig } from '../types/schema';
import { useCachedLottie } from '../utils/lottieCache';

export function CampaignOverlay({
  overlay,
}: {
  overlay?: OverlayConfig;
}): React.JSX.Element | null {
  if (!overlay) {
    return null;
  }
  return <OverlayLottie url={overlay.animation_url} />;
}

/** Inner component so the cache hook is called unconditionally (rules of hooks). */
function OverlayLottie({ url }: { url: string }): React.JSX.Element | null {
  const source = useCachedLottie(url);
  if (!source) {
    return null; // first fetch in flight, or it failed — stay invisible
  }
  return (
    <View style={[StyleSheet.absoluteFill, styles.layer]} pointerEvents="none">
      <LottieView
        source={source}
        autoPlay
        loop={false}
        cacheComposition
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
