/**
 * BANNER_HERO — full-width promotional graphic card.
 * Taller, stronger gradient overlay, bolder typography — Q-commerce standard.
 */
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BannerHeroBlock } from '../../types/schema';
import { useTheme } from '../../theme/ThemeContext';
import { handleAction } from '../../actions/handleAction';
import { RenderBadge } from '../RenderBadge';

function BannerHeroBase({ block }: { block: BannerHeroBlock }): React.JSX.Element {
  const theme = useTheme();

  if (__DEV__) {
    console.log(`[render] BannerHero ${block.id}`);
  }

  return (
    <View style={styles.wrapper}>
      <RenderBadge label="BANNER_HERO" />
      <ImageBackground
        source={{ uri: block.image }}
        style={styles.banner}
        imageStyle={styles.image}
        fadeDuration={300}
      >
        {/* Multi-stop gradient: transparent top → dark bottom */}
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom}>
          <Text style={styles.title}>{block.title}</Text>
          {block.subtitle ? (
            <Text style={styles.subtitle}>{block.subtitle}</Text>
          ) : null}
          {block.cta ? (
            <Pressable
              onPress={() => handleAction(block.cta!.action)}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.ctaText}>{block.cta.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
}

export const BannerHero = React.memo(BannerHeroBase);

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  banner: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-end',
    backgroundColor: '#C8C8C8',
  },
  image: {
    borderRadius: 18,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  gradientBottom: {
    padding: 18,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
    fontWeight: '500',
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
