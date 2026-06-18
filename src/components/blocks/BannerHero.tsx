/**
 * BANNER_HERO — full-width promotional graphic card for immediate marketing focus.
 * Memoized; CTA forwards its declarative action to the central dispatcher.
 */
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BannerHeroBlock } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { handleAction } from '../../actions/handleAction';
import { RenderBadge } from '../RenderBadge';

function BannerHeroBase({ block }: { block: BannerHeroBlock }): React.JSX.Element {
  const theme = useTheme();
  const { cta } = block;

  if (__DEV__) {
    console.log(`[render] BannerHero ${block.id}`);
  }

  return (
    <View>
    <RenderBadge label="BANNER_HERO" />
    <ImageBackground
      source={{ uri: block.image }}
      style={styles.banner}
      imageStyle={styles.image}
    >
      <View style={styles.scrim}>
        <Text style={styles.title}>{block.title}</Text>
        {block.subtitle ? <Text style={styles.subtitle}>{block.subtitle}</Text> : null}
        {cta ? (
          <Pressable
            onPress={() => handleAction(cta.action)}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>{cta.label}</Text>
          </Pressable>
        ) : null}
      </View>
    </ImageBackground>
    </View>
  );
}

export const BannerHero = React.memo(BannerHeroBase);

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#DDD',
  },
  image: {
    borderRadius: 16,
  },
  scrim: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
    marginBottom: 10,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
