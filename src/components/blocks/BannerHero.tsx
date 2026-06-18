/**
 * BANNER_HERO — premium themed gradient promo card.
 *
 * Uses the campaign theme (not a network photo) so it always looks on-brand and never shows
 * a mismatched stock image. A large translucent emoji adds character; the CTA forwards its
 * declarative action to the central dispatcher.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { BannerHeroBlock } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { handleAction } from '../../actions/handleAction';
import { RenderBadge } from '../RenderBadge';

/** Decorative emoji chosen from the banner copy. */
function bannerEmoji(title: string): string {
  if (/school/i.test(title)) return '🎒';
  if (/summer|playhouse/i.test(title)) return '☀️';
  if (/mystery|carnival|gift/i.test(title)) return '🎁';
  return '🛵';
}

/** Darken a hex color toward black for the gradient's second stop. */
function darken(hex: string, amount = 0.78): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;
  const r = Math.round(parseInt(m.slice(0, 2), 16) * amount);
  const g = Math.round(parseInt(m.slice(2, 4), 16) * amount);
  const b = Math.round(parseInt(m.slice(4, 6), 16) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function BannerHeroBase({ block }: { block: BannerHeroBlock }): React.JSX.Element {
  const theme = useTheme();

  if (__DEV__) {
    console.log(`[render] BannerHero ${block.id}`);
  }

  return (
    <View style={styles.wrapper}>
      <RenderBadge label="BANNER_HERO" />
      <LinearGradient
        colors={[theme.primary, darken(theme.primary)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        {/* Decorative emoji */}
        <Text style={styles.decoEmoji}>{bannerEmoji(block.title)}</Text>

        <View style={styles.content}>
          <Text style={styles.title}>{block.title}</Text>
          {block.subtitle ? <Text style={styles.subtitle}>{block.subtitle}</Text> : null}
          {block.cta ? (
            <Pressable
              onPress={() => handleAction(block.cta!.action)}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: theme.surface, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.ctaText, { color: theme.primary }]}>{block.cta.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

export const BannerHero = React.memo(BannerHeroBase);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  banner: {
    width: '100%',
    minHeight: 168,
    justifyContent: 'center',
    padding: 22,
  },
  decoEmoji: {
    position: 'absolute',
    right: 6,
    top: -6,
    fontSize: 130,
    opacity: 0.18,
  },
  content: {
    maxWidth: '78%',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13.5,
    marginTop: 6,
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
  },
  ctaText: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
