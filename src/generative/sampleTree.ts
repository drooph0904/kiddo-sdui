import type { GeneratedPayload } from '../../shared/uiSchema';

export const sampleTree: GeneratedPayload = {
  theme: {
    primary: '#FF6B6B',
    background: '#FFF9F9',
    surface: '#FFFFFF',
    text: '#2D2D2D',
    accent: '#FFD93D',
  },
  tree: {
    type: 'Column',
    gap: 0,
    children: [
      {
        type: 'Banner',
        title: '🍼 New Arrivals for Your Little One!',
        subtitle: 'Hand-picked essentials — delivered in 10 minutes',
        cta: {
          label: 'Shop Now',
          action: { type: 'DEEP_LINK', payload: { url: 'kiddo://new-arrivals' } },
        },
        background: '#FF6B6B',
        radius: 14,
        padding: 20,
      },
      {
        type: 'Carousel',
        gap: 12,
        children: [
          {
            type: 'ProductCard',
            title: 'Huggies Soft Diapers (S)',
            price: 349,
            emoji: '🧷',
            action: { type: 'ADD_TO_CART', payload: { id: 'huggies-s' } },
          },
          {
            type: 'ProductCard',
            title: 'Pampers Active Baby (M)',
            price: 419,
            emoji: '👶',
            action: { type: 'ADD_TO_CART', payload: { id: 'pampers-m' } },
          },
          {
            type: 'ProductCard',
            title: 'Mamy Poko Pants (L)',
            price: 389,
            emoji: '🌸',
            action: { type: 'ADD_TO_CART', payload: { id: 'mamypoko-l' } },
          },
          {
            type: 'ProductCard',
            title: 'Pigeon Baby Wipes 80s',
            price: 199,
            emoji: '🌿',
            action: { type: 'ADD_TO_CART', payload: { id: 'pigeon-wipes-80' } },
          },
          {
            type: 'ProductCard',
            title: 'Himalaya Baby Lotion',
            price: 165,
            emoji: '🧴',
            action: { type: 'ADD_TO_CART', payload: { id: 'himalaya-lotion' } },
          },
        ],
      },
      {
        type: 'Text',
        content: 'Top Picks for Baby',
        variant: 'title',
        padding: 4,
      },
      {
        type: 'Grid',
        columns: 2,
        gap: 12,
        children: [
          {
            type: 'ProductCard',
            title: 'Nestle NAN Pro 1 (400g)',
            price: 699,
            emoji: '🍼',
            action: { type: 'ADD_TO_CART', payload: { id: 'nestle-nan-400' } },
          },
          {
            type: 'ProductCard',
            title: 'Enfamil A+ Stage 1',
            price: 849,
            emoji: '⭐',
            action: { type: 'ADD_TO_CART', payload: { id: 'enfamil-a1' } },
          },
          {
            type: 'ProductCard',
            title: 'Fisher-Price Rattle Set',
            price: 299,
            emoji: '🎀',
            action: { type: 'ADD_TO_CART', payload: { id: 'fp-rattle' } },
          },
          {
            type: 'ProductCard',
            title: 'Chicco Soft Teether',
            price: 249,
            emoji: '🦷',
            action: { type: 'ADD_TO_CART', payload: { id: 'chicco-teether' } },
          },
          {
            type: 'ProductCard',
            title: 'Johnson Baby Powder',
            price: 145,
            emoji: '🌼',
            action: { type: 'ADD_TO_CART', payload: { id: 'jb-powder' } },
          },
          {
            type: 'ProductCard',
            title: 'Sebamed Baby Wash',
            price: 395,
            emoji: '🛁',
            action: { type: 'ADD_TO_CART', payload: { id: 'sebamed-wash' } },
          },
        ],
      },
    ],
  },
};
