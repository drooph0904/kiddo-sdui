import { GeneratedPayloadSchema, UINodeSchema } from './uiSchema';

const theme = { primary: '#000', background: '#fff', surface: '#fff', text: '#000', accent: '#000' };

it('accepts a nested valid tree', () => {
  const tree = {
    type: 'Column',
    children: [
      { type: 'Banner', title: 'Hi' },
      {
        type: 'Grid',
        columns: 2,
        children: [
          { type: 'ProductCard', title: 'X', price: 99, emoji: '🧸',
            action: { type: 'ADD_TO_CART', payload: { id: 'x' } } },
        ],
      },
    ],
  };
  expect(GeneratedPayloadSchema.safeParse({ theme, tree }).success).toBe(true);
});

it('rejects an unknown node type', () => {
  expect(UINodeSchema.safeParse({ type: 'Hologram' }).success).toBe(false);
});

it('rejects a malformed action', () => {
  const bad = { type: 'Button', label: 'go', action: { type: 'NOPE' } };
  expect(UINodeSchema.safeParse(bad).success).toBe(false);
});
