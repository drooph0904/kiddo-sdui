/**
 * Maps a product title to a representative emoji + soft pastel background.
 *
 * Why: the mock payload can't ship real product photography, and random stock photos look
 * broken (a building in a "popcorn" card). Category emoji tiles are always on-topic, load
 * instantly (no network), and read as an intentional, polished catalog style.
 */

interface ProductVisual {
  emoji: string;
  bg: string;
}

/** Ordered keyword → emoji rules. First match wins, so put specific words first. */
const RULES: readonly (readonly [RegExp, string, string])[] = [
  [/diaper|pant/i, '🧷', '#FFF1F2'],
  [/wipe/i, '🧻', '#F0FDFA'],
  [/formula|nan|cerelac|milk/i, '🍼', '#EFF6FF'],
  [/oil|lotion|sunscreen|cream/i, '🧴', '#FEF3F2'],
  [/puff|biscuit|cerel|snack/i, '🍪', '#FEF7E0'],
  [/noodle/i, '🍜', '#FFF7ED'],
  [/juice/i, '🧃', '#FEFCE8'],
  [/chocolate|munch/i, '🍫', '#F5F0EB'],
  [/popcorn/i, '🍿', '#FFFBEB'],
  [/candy|lollipop|chupa/i, '🍬', '#FDF2F8'],
  [/balloon/i, '🎈', '#FEF2F2'],
  [/mask/i, '🎭', '#F5F3FF'],
  [/mystery|gift|box|surprise/i, '🎁', '#FEF2F2'],
  [/rattle|stacker|toy|funskool|fisher/i, '🧸', '#FFF7ED'],
  [/teether/i, '🦷', '#F0F9FF'],
  [/musical|mat|leapfrog/i, '🎵', '#F5F3FF'],
  [/bath|float|bubble/i, '🛁', '#ECFEFF'],
  [/lunch|tiffin/i, '🍱', '#FEFCE8'],
  [/backpack|bag/i, '🎒', '#EFF6FF'],
  [/bottle|sipper|water/i, '🍶', '#F0F9FF'],
  [/pencil|crayon/i, '🖍️', '#FEF7E0'],
  [/notebook|book/i, '📓', '#EFF6FF'],
  [/watercolour|watercolor|paint|art/i, '🎨', '#FDF4FF'],
  [/glue|fevistik/i, '🩹', '#FEF7E0'],
  [/pool/i, '🏊', '#ECFEFF'],
  [/\bhat\b|\bcap\b/i, '🧢', '#FFF7ED'],
  [/ball/i, '⚽', '#F0FDF4'],
  [/zoo|petting/i, '🦒', '#FEFCE8'],
  [/splash|park/i, '💦', '#ECFEFF'],
  [/puppet|theatre|show/i, '🎪', '#FDF2F8'],
  [/craft|workshop/i, '✂️', '#FFF7ED'],
  [/ticket|pass|seat|event/i, '🎟️', '#F5F3FF'],
];

const FALLBACK: ProductVisual = { emoji: '🛒', bg: '#F3F4F6' };

export function getProductVisual(title: string): ProductVisual {
  for (const [pattern, emoji, bg] of RULES) {
    if (pattern.test(title)) {
      return { emoji, bg };
    }
  }
  return FALLBACK;
}
