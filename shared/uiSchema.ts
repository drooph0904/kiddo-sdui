import { z } from 'zod';

export const ThemeSchema = z.object({
  primary: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  accent: z.string(),
});

export const UIActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ADD_TO_CART'), payload: z.object({ id: z.string() }) }),
  z.object({ type: z.literal('REMOVE_FROM_CART'), payload: z.object({ id: z.string() }) }),
  z.object({ type: z.literal('DEEP_LINK'), payload: z.object({ url: z.string() }) }),
  z.object({
    type: z.literal('APPLY_MYSTERY_GIFT_COUPON'),
    payload: z.object({ couponId: z.string() }),
  }),
]);
export type UIAction = z.infer<typeof UIActionSchema>;

// Optional style props shared by every node.
const StyleProps = {
  padding: z.number().optional(),
  gap: z.number().optional(),
  background: z.string().optional(),
  radius: z.number().optional(),
  align: z.enum(['start', 'center', 'end']).optional(),
};

export type UINode =
  | ({ type: 'Column'; children: UINode[] } & Style)
  | ({ type: 'Row'; children: UINode[] } & Style)
  | ({ type: 'Grid'; columns: 2 | 3 | 4; children: UINode[] } & Style)
  | ({ type: 'Carousel'; children: UINode[] } & Style)
  | ({ type: 'Text'; content: string; variant: 'title' | 'subtitle' | 'body' } & Style)
  | ({ type: 'Button'; label: string; action: UIAction } & Style)
  | ({ type: 'ProductCard'; title: string; price: number; emoji: string; action: UIAction } & Style)
  | ({ type: 'Banner'; title: string; subtitle?: string; cta?: { label: string; action: UIAction } } & Style);

interface Style {
  padding?: number;
  gap?: number;
  background?: string;
  radius?: number;
  align?: 'start' | 'center' | 'end';
}

export const UINodeSchema: z.ZodType<UINode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ type: z.literal('Column'), children: z.array(UINodeSchema), ...StyleProps }),
    z.object({ type: z.literal('Row'), children: z.array(UINodeSchema), ...StyleProps }),
    z.object({
      type: z.literal('Grid'),
      columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
      children: z.array(UINodeSchema),
      ...StyleProps,
    }),
    z.object({ type: z.literal('Carousel'), children: z.array(UINodeSchema), ...StyleProps }),
    z.object({
      type: z.literal('Text'),
      content: z.string(),
      variant: z.enum(['title', 'subtitle', 'body']),
      ...StyleProps,
    }),
    z.object({ type: z.literal('Button'), label: z.string(), action: UIActionSchema, ...StyleProps }),
    z.object({
      type: z.literal('ProductCard'),
      title: z.string(),
      price: z.number(),
      emoji: z.string(),
      action: UIActionSchema,
      ...StyleProps,
    }),
    z.object({
      type: z.literal('Banner'),
      title: z.string(),
      subtitle: z.string().optional(),
      cta: z.object({ label: z.string(), action: UIActionSchema }).optional(),
      ...StyleProps,
    }),
  ]),
);

export const GeneratedPayloadSchema = z.object({
  theme: ThemeSchema,
  tree: UINodeSchema,
});
export type GeneratedPayload = z.infer<typeof GeneratedPayloadSchema>;
