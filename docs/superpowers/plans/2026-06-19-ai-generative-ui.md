# AI Generative-UI Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> Adaptation: RN visual pieces are verified MANUALLY on the emulator + `npx tsc --noEmit`;
> pure logic (shared schema, node registry, backend) gets automated tests.

**Goal:** Add an in-app "✨ Generate" mode where a prompt → backend → OpenAI → a recursive UI
layout tree that the app renders live, with the AI deciding the screen's shape.

**Architecture:** A shared Zod schema (`shared/uiSchema.ts`) is the single source of truth for
a recursive `UINode` tree. A Node+TypeScript (Fastify) server turns a prompt into a Zod-valid
tree via OpenAI (JSON mode + validate + retry). The app renders the tree with a recursive,
registry-driven renderer (`SafeNode`), reusing existing theming, cart, and `handleAction`. The
feature is additive — the existing 3-block app is untouched.

**Tech Stack:** Expo RN + TypeScript (app), Zod (shared), Fastify + OpenAI SDK + tsx +
node:test (server).

## Global Constraints

- TypeScript **strict** everywhere; no `any` on schema/action boundaries.
- One Zod schema in `shared/uiSchema.ts` is the source of truth; TS types via `z.infer`.
- LLM provider is **OpenAI** (`gpt-4o-mini`, overridable by `OPENAI_MODEL`). Key only in
  `server/.env` (gitignored) — never in the app bundle.
- Renderer uses a **hash-map node registry** (no switch); unknown node types drop via
  `SafeNode` (resilience), never crash.
- Single vertical FlashList at the feed root; existing app, lint, tests stay green.
- Granular commits — one per task.

---

### Task 1: Shared recursive Zod schema

**Files:**
- Create: `shared/uiSchema.ts`
- Create: `shared/uiSchema.test.ts`
- Modify: `package.json` (add `zod`), `metro.config.js` (watch `shared/`), `tsconfig.json`
- Test: `shared/uiSchema.test.ts` (run via app jest)

**Interfaces:**
- Produces: `UINodeSchema` (Zod), `GeneratedPayloadSchema` (Zod `{ theme, tree }`), and types
  `UINode`, `GeneratedPayload`, `UIAction` via `z.infer`.

- [ ] **Step 1: Install zod in the app**

Run: `npx expo install zod`

- [ ] **Step 2: Write the schema**

Create `shared/uiSchema.ts`:

```ts
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
```

- [ ] **Step 3: Write the failing test**

Create `shared/uiSchema.test.ts`:

```ts
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
```

- [ ] **Step 4: Wire Metro + tsconfig to resolve `shared/`**

Create `metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, 'shared')];
module.exports = config;
```

Add to `tsconfig.json` `compilerOptions`: `"paths": { "@shared/*": ["shared/*"] }` and
`"baseUrl": "."`. (Imports will use a relative path `../../shared/uiSchema` from app code; the
path alias is optional convenience.)

- [ ] **Step 5: Run tests**

Run: `CI=1 npx jest shared/uiSchema.test.ts`
Expected: 3 passed.

- [ ] **Step 6: Typecheck + commit**

Run: `npx tsc --noEmit` → clean.
```bash
git add shared/ package.json package-lock.json metro.config.js tsconfig.json
git commit -m "feat: add shared recursive Zod UINode schema (single source of truth)"
```

---

### Task 2: Node registry + leaf/container renderers + SafeNode

**Files:**
- Create: `src/generative/nodeRegistry.ts`, `src/generative/SafeNode.tsx`
- Create: `src/generative/nodes/Containers.tsx`, `src/generative/nodes/Leaves.tsx`
- Create: `src/generative/nodeRegistry.test.ts`

**Interfaces:**
- Consumes: `UINode` from `shared/uiSchema`; existing `useTheme`, `handleAction`,
  `ProductCard` patterns, `BlockErrorBoundary`.
- Produces: `getNodeRenderer(type: string): NodeRenderer | undefined`,
  `SafeNode({ node }: { node: UINode })`, `NodeRenderer = React.ComponentType<{ node: any }>`.

- [ ] **Step 1: Write the failing registry test**

Create `src/generative/nodeRegistry.test.ts`:

```ts
import { getNodeRenderer } from './nodeRegistry';

it('resolves known node types', () => {
  ['Column', 'Row', 'Grid', 'Carousel', 'Text', 'Button', 'ProductCard', 'Banner'].forEach(
    (t) => expect(getNodeRenderer(t)).toBeDefined(),
  );
});

it('returns undefined for unknown node types', () => {
  expect(getNodeRenderer('Hologram')).toBeUndefined();
});
```

- [ ] **Step 2: Run it (fails — module missing)**

Run: `CI=1 npx jest src/generative/nodeRegistry.test.ts`
Expected: FAIL (cannot find module).

- [ ] **Step 3: Implement container renderers**

Create `src/generative/nodes/Containers.tsx`:

```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UINode } from '../../../shared/uiSchema';
import { SafeNode } from '../SafeNode';

type C = { node: Extract<UINode, { children: UINode[] }> };

const alignMap = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

function base(node: { padding?: number; gap?: number; background?: string; radius?: number; align?: 'start' | 'center' | 'end' }) {
  return {
    padding: node.padding,
    gap: node.gap,
    backgroundColor: node.background,
    borderRadius: node.radius,
    alignItems: node.align ? alignMap[node.align] : undefined,
  };
}

export function ColumnNode({ node }: C): React.JSX.Element {
  return (
    <View style={[styles.col, base(node)]}>
      {node.children.map((c, i) => <SafeNode key={i} node={c} />)}
    </View>
  );
}
export function RowNode({ node }: C): React.JSX.Element {
  return (
    <View style={[styles.row, base(node)]}>
      {node.children.map((c, i) => <SafeNode key={i} node={c} />)}
    </View>
  );
}
export function GridNode({ node }: { node: Extract<UINode, { type: 'Grid' }> }): React.JSX.Element {
  const w = `${100 / node.columns - 2}%` as const;
  return (
    <View style={[styles.grid, base(node)]}>
      {node.children.map((c, i) => (
        <View key={i} style={{ width: w }}><SafeNode node={c} /></View>
      ))}
    </View>
  );
}
export function CarouselNode({ node }: C): React.JSX.Element {
  return (
    <View style={styles.carousel}>
      <FlashList
        horizontal
        data={node.children}
        renderItem={({ item }) => <View style={styles.cItem}><SafeNode node={item} /></View>}
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  carousel: { height: 250 },
  cItem: { width: 160, marginRight: 12 },
});
```

- [ ] **Step 4: Implement leaf renderers**

Create `src/generative/nodes/Leaves.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { UINode } from '../../../shared/uiSchema';
import { useTheme } from '../../theme/ThemeContext';
import { handleAction } from '../../actions/handleAction';
import { ProductCard } from '../../components/ProductCard';

export function TextNode({ node }: { node: Extract<UINode, { type: 'Text' }> }): React.JSX.Element {
  const theme = useTheme();
  const size = node.variant === 'title' ? 22 : node.variant === 'subtitle' ? 16 : 13;
  const weight = node.variant === 'title' ? '900' : node.variant === 'subtitle' ? '700' : '500';
  return <Text style={{ color: theme.text, fontSize: size, fontWeight: weight }}>{node.content}</Text>;
}

export function ButtonNode({ node }: { node: Extract<UINode, { type: 'Button' }> }): React.JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => handleAction(node.action)}
      style={({ pressed }) => [styles.btn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={styles.btnText}>{node.label}</Text>
    </Pressable>
  );
}

export function ProductCardNode({ node }: { node: Extract<UINode, { type: 'ProductCard' }> }): React.JSX.Element {
  // Adapt the generative node to the existing ProductCard's Product shape.
  return (
    <ProductCard
      product={{ id: `gen-${node.title}`, title: node.title, price: node.price, image: '', action: node.action }}
      emojiOverride={node.emoji}
    />
  );
}

export function BannerNode({ node }: { node: Extract<UINode, { type: 'Banner' }> }): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: theme.primary }]}>
      <Text style={styles.bTitle}>{node.title}</Text>
      {node.subtitle ? <Text style={styles.bSub}>{node.subtitle}</Text> : null}
      {node.cta ? (
        <Pressable onPress={() => handleAction(node.cta!.action)} style={[styles.bCta, { backgroundColor: theme.surface }]}>
          <Text style={{ color: theme.primary, fontWeight: '800' }}>{node.cta.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '800' },
  banner: { borderRadius: 18, padding: 20, gap: 8 },
  bTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  bSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  bCta: { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginTop: 6 },
});
```

- [ ] **Step 5: Add `emojiOverride` prop to ProductCard**

Modify `src/components/ProductCard.tsx`: add optional `emojiOverride?: string` to
`ProductCardProps`; in the body, `const { emoji, bg } = emojiOverride ? { emoji: emojiOverride, bg: '#F3F4F6' } : getProductVisual(product.title);`.

- [ ] **Step 6: Implement the registry + SafeNode**

Create `src/generative/nodeRegistry.ts`:

```ts
import React from 'react';
import { ColumnNode, RowNode, GridNode, CarouselNode } from './nodes/Containers';
import { TextNode, ButtonNode, ProductCardNode, BannerNode } from './nodes/Leaves';

export type NodeRenderer = React.ComponentType<{ node: never }>;

const registry: Record<string, React.ComponentType<{ node: never }>> = {
  Column: ColumnNode as never,
  Row: RowNode as never,
  Grid: GridNode as never,
  Carousel: CarouselNode as never,
  Text: TextNode as never,
  Button: ButtonNode as never,
  ProductCard: ProductCardNode as never,
  Banner: BannerNode as never,
};

export function getNodeRenderer(type: string): React.ComponentType<{ node: never }> | undefined {
  return registry[type];
}
```

Create `src/generative/SafeNode.tsx`:

```tsx
import React from 'react';
import type { UINode } from '../../shared/uiSchema';
import { getNodeRenderer } from './nodeRegistry';
import { BlockErrorBoundary } from '../components/BlockErrorBoundary';

export function SafeNode({ node }: { node: UINode }): React.JSX.Element | null {
  const Renderer = getNodeRenderer(node.type);
  if (!Renderer) {
    if (__DEV__) console.warn(`[SafeNode] Unknown node type "${(node as { type: string }).type}" — dropped.`);
    return null;
  }
  return (
    <BlockErrorBoundary blockId={node.type} blockType={node.type}>
      {React.createElement(Renderer, { node: node as never })}
    </BlockErrorBoundary>
  );
}
```

- [ ] **Step 7: Run registry test + typecheck**

Run: `CI=1 npx jest src/generative/nodeRegistry.test.ts` → 2 passed.
Run: `npx tsc --noEmit` → clean.

- [ ] **Step 8: Commit**

```bash
git add src/generative src/components/ProductCard.tsx
git commit -m "feat: recursive generative renderer — node registry, SafeNode, leaf/container nodes"
```

---

### Task 3: GenerativeScreen renders a hardcoded sample tree (no AI yet)

**Files:**
- Create: `src/generative/GenerativeScreen.tsx`, `src/generative/sampleTree.ts`
- Create: `src/store/generativeStore.ts`
- Modify: `App.tsx` (add "✨ Generate" entry + generative mode)

**Interfaces:**
- Consumes: `GeneratedPayload`, `SafeNode`, `ThemeProvider`.
- Produces: `useGenerativeStore` with `{ payload: GeneratedPayload | null, setPayload, clear }`;
  `GenerativeScreen` component.

- [ ] **Step 1: Sample tree + store**

Create `src/generative/sampleTree.ts` exporting a `GeneratedPayload` const with a `Column`
root containing a `Banner`, a `Carousel` of `ProductCard`s, and a `Grid` (columns 2) of
`ProductCard`s — realistic kid products, ₹ prices, emojis, `ADD_TO_CART` actions.

Create `src/store/generativeStore.ts`:

```ts
import { create } from 'zustand';
import type { GeneratedPayload } from '../../shared/uiSchema';

interface GenerativeState {
  payload: GeneratedPayload | null;
  setPayload: (p: GeneratedPayload) => void;
  clear: () => void;
}
export const useGenerativeStore = create<GenerativeState>((set) => ({
  payload: null,
  setPayload: (payload) => set({ payload }),
  clear: () => set({ payload: null }),
}));
```

- [ ] **Step 2: GenerativeScreen renders the root tree in a FlashList**

Create `src/generative/GenerativeScreen.tsx`:

```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { UINode } from '../../shared/uiSchema';
import { SafeNode } from './SafeNode';

export function GenerativeScreen({ tree }: { tree: UINode }): React.JSX.Element {
  // Virtualize top-level sections: if root is a Column, render its children as list items.
  const items: UINode[] = tree.type === 'Column' ? tree.children : [tree];
  return (
    <FlashList
      data={items}
      renderItem={({ item }) => <View style={styles.section}><SafeNode node={item} /></View>}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 96 },
  section: { marginBottom: 22 },
});
```

- [ ] **Step 3: Wire into App.tsx**

In `App.tsx`: add `{ id: 'generate', label: '✨ Generate' }` to `options`. When `activeId ===
'generate'`: seed `useGenerativeStore` with `sampleTree` if empty, wrap in `ThemeProvider`
with `payload.theme`, and render `<GenerativeScreen tree={payload.tree} />` instead of
`<HomeScreen>`. Keep `CartBadge`. (No `CampaignOverlay` in generative mode.)

- [ ] **Step 4: Verify on emulator (manual)**

Run the app, tap "✨ Generate" → the sample tree renders (banner + carousel + grid), cart
ADD works, theme applies. `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add src/generative src/store/generativeStore.ts App.tsx
git commit -m "feat: generative screen renders a sample UINode tree (no AI yet)"
```

---

### Task 4: Backend scaffold (Fastify + TS) with /health

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/.env.example`, `server/.gitignore`
- Create: `server/src/index.ts`
- Modify: root `.gitignore` (ignore `server/.env`, `server/node_modules`)

- [ ] **Step 1: Scaffold the server package**

```bash
mkdir -p server/src
cd server && npm init -y && npm install fastify @fastify/cors openai zod && npm install -D tsx typescript @types/node
```

Set `server/package.json` scripts: `"dev": "tsx watch src/index.ts"`, `"start": "tsx
src/index.ts"`, `"test": "node --import tsx --test src/**/*.test.ts"`, and `"type": "module"`.

Create `server/tsconfig.json`: `{ "compilerOptions": { "strict": true, "module": "ESNext",
"moduleResolution": "Bundler", "target": "ES2022", "esModuleInterop": true, "skipLibCheck":
true } }`.

Create `server/.env.example`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=8787
```
Create `server/.gitignore`: `node_modules/` and `.env`.

- [ ] **Step 2: Health endpoint**

Create `server/src/index.ts`:

```ts
import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get('/health', async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 8787);
app.listen({ port, host: '0.0.0.0' }).catch((e) => {
  app.log.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Verify**

Run: `cd server && OPENAI_API_KEY=x npm run dev` (background), then
`curl localhost:8787/health` → `{"ok":true}`. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add server .gitignore
git commit -m "chore: scaffold Fastify + TypeScript backend with /health"
```

---

### Task 5: /generate endpoint (OpenAI JSON mode + Zod validate + retry)

**Files:**
- Create: `server/src/generate.ts`, `server/src/prompt.ts`, `server/src/generate.test.ts`
- Modify: `server/src/index.ts` (register the route)

**Interfaces:**
- Consumes: `GeneratedPayloadSchema` from `../../shared/uiSchema` (relative import across the
  repo; server tsconfig includes it via `moduleResolution: Bundler`).
- Produces: `generatePayload(prompt: string, deps): Promise<GeneratedPayload>` where `deps`
  injects the model-call function so tests can mock OpenAI.

- [ ] **Step 1: Prompt builder**

Create `server/src/prompt.ts`:

```ts
export const SYSTEM_PROMPT = `You compose the homepage of "Kiddo", a Q-commerce app for kids & baby essentials.
Return ONLY JSON: { "theme": {...}, "tree": <UINode> }.
theme keys: primary, background, surface, text (all hex). accent (hex).
UINode types:
- Containers (have "children": UINode[]): "Column", "Row", "Grid" (also "columns": 2|3|4), "Carousel".
- Leaves: "Text" {content, variant: "title"|"subtitle"|"body"},
  "Button" {label, action}, "ProductCard" {title, price (number, INR), emoji, action},
  "Banner" {title, subtitle?, cta?: {label, action}}.
Optional style on any node: padding, gap, background(hex), radius, align("start"|"center"|"end").
action types: {"type":"ADD_TO_CART","payload":{"id":string}} or
{"type":"DEEP_LINK","payload":{"url":string}}.
Rules: root MUST be a "Column". Nest at most 4 levels. Invent realistic kid/baby products with
INR prices and a fitting emoji per ProductCard. Make the theme match the prompt's mood.`;
```

- [ ] **Step 2: Write the failing test (mocked model)**

Create `server/src/generate.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert';
import { generatePayload } from './generate.ts';

const valid = JSON.stringify({
  theme: { primary: '#e11', background: '#fff', surface: '#fff', text: '#111', accent: '#f90' },
  tree: { type: 'Column', children: [{ type: 'Banner', title: 'Diwali Sale' }] },
});

test('returns a validated payload from a good model response', async () => {
  const p = await generatePayload('diwali sale', { callModel: async () => valid });
  assert.equal(p.tree.type, 'Column');
});

test('retries once then throws on persistently invalid output', async () => {
  let calls = 0;
  await assert.rejects(() =>
    generatePayload('x', { callModel: async () => { calls++; return '{"bad":true}'; } }),
  );
  assert.equal(calls, 2);
});
```

- [ ] **Step 3: Run it (fails — module missing)**

Run: `cd server && node --import tsx --test src/generate.test.ts`
Expected: FAIL (cannot find `./generate.ts`).

- [ ] **Step 4: Implement generate**

Create `server/src/generate.ts`:

```ts
import OpenAI from 'openai';
import { GeneratedPayloadSchema, type GeneratedPayload } from '../../shared/uiSchema.ts';
import { SYSTEM_PROMPT } from './prompt.ts';

export interface GenerateDeps {
  callModel: (prompt: string) => Promise<string>;
}

export function makeOpenAIDeps(): GenerateDeps {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    callModel: async (prompt) => {
      const res = await client.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      });
      return res.choices[0]?.message?.content ?? '';
    },
  };
}

export async function generatePayload(prompt: string, deps: GenerateDeps): Promise<GeneratedPayload> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await deps.callModel(prompt);
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      continue;
    }
    const parsed = GeneratedPayloadSchema.safeParse(json);
    if (parsed.success) return parsed.data;
  }
  throw new Error('Model did not return a valid UI payload');
}
```

- [ ] **Step 5: Run test (passes)**

Run: `cd server && node --import tsx --test src/generate.test.ts`
Expected: 2 passed.

- [ ] **Step 6: Register the route**

In `server/src/index.ts`, add:

```ts
import { generatePayload, makeOpenAIDeps } from './generate.ts';
const deps = makeOpenAIDeps();

app.post('/generate', async (req, reply) => {
  const prompt = (req.body as { prompt?: string })?.prompt;
  if (!prompt || typeof prompt !== 'string') return reply.code(400).send({ error: 'prompt required' });
  try {
    return await generatePayload(prompt, deps);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'generation failed';
    return reply.code(msg.includes('valid UI payload') ? 422 : 502).send({ error: msg });
  }
});
```

- [ ] **Step 7: Live smoke test (needs real key)**

Run with a real key in `server/.env`: `npm run dev`, then
`curl -s localhost:8787/generate -H 'content-type: application/json' -d '{"prompt":"diwali sale, festive toys under ₹199"}' | head -c 400`
Expected: JSON with `theme` + `tree` (a Column). (Skip if no key yet; the unit tests already prove the logic.)

- [ ] **Step 8: Commit**

```bash
git add server
git commit -m "feat: /generate endpoint — OpenAI JSON mode + Zod validate + retry"
```

---

### Task 6: In-app GenerateScreen — full loop (prompt → backend → render)

**Files:**
- Create: `src/config.ts`, `src/generative/api.ts`
- Modify: `src/generative/GenerativeScreen.tsx` (add prompt UI + fetch), `App.tsx` (pass mode)

**Interfaces:**
- Consumes: `GeneratedPayloadSchema` (runtime guard), `useGenerativeStore`.
- Produces: `API_BASE_URL`, `generateFromPrompt(prompt: string): Promise<GeneratedPayload>`.

- [ ] **Step 1: Config + API client**

Create `src/config.ts`:

```ts
import { Platform } from 'react-native';
// Android emulator reaches the host machine at 10.0.2.2; iOS sim uses localhost.
export const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';
```

Create `src/generative/api.ts`:

```ts
import { API_BASE_URL } from '../config';
import { GeneratedPayloadSchema, type GeneratedPayload } from '../../shared/uiSchema';

export async function generateFromPrompt(prompt: string): Promise<GeneratedPayload> {
  const res = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  const json = await res.json();
  const parsed = GeneratedPayloadSchema.safeParse(json); // defense-in-depth runtime guard
  if (!parsed.success) throw new Error('Received an invalid layout from the server');
  return parsed.data;
}
```

- [ ] **Step 2: Add prompt UI + states to GenerativeScreen**

Modify `GenerativeScreen` to accept no `tree` prop and instead read `useGenerativeStore`: show
a `TextInput` (prompt) + "✨ Generate" `Pressable`; on press call `generateFromPrompt`, set
loading, on success `setPayload`, on error show the message; render the tree (from store, or a
short empty-state hint) below. Keep the FlashList rendering of `payload.tree` sections.

- [ ] **Step 3: App wires generative mode to the store's theme**

In `App.tsx`, generative mode wraps the screen in `ThemeProvider` using
`useGenerativeStore().payload?.theme ?? homePayload.theme`.

- [ ] **Step 4: Verify full loop (manual, needs server + key running)**

Start `cd server && npm run dev`. In the app, tap "✨ Generate", type
"Diwali sale, festive toys under ₹199", press Generate → a new themed homepage renders.
Try an empty/garbage prompt → graceful error, current screen intact. `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add src/config.ts src/generative App.tsx
git commit -m "feat: in-app GenerateScreen — full prompt -> backend -> live render loop"
```

---

### Task 7: Docs

- [ ] Update root `README.md` with an "AI Generative UI" section: what it does, how to run the
  server (`cd server && cp .env.example .env`, add key, `npm run dev`), the emulator URL note,
  and the build-order/architecture. Add `server/README.md` with endpoint docs.
- [ ] Commit: `docs: document AI generative-UI feature and server setup`.

## Self-Review

- **Spec coverage**: shared Zod schema (T1) ✓; recursive renderer + registry + SafeNode (T2) ✓;
  virtualized root + theme + sample render (T3) ✓; backend scaffold (T4) + /generate OpenAI
  JSON-mode + Zod + retry (T5) ✓; config/10.0.2.2 + GenerateScreen full loop + runtime guard
  (T6) ✓; tests for schema/registry/backend ✓; docs (T7) ✓. Products invented inline ✓.
  Additive (existing app untouched) ✓.
- **Refinement vs spec**: spec said "Structured Outputs"; plan uses JSON mode + Zod + retry
  (more robust for a recursive/optional schema, keeps Zod single-source). Documented in T5.
- **Placeholder scan**: none — every code step has concrete code.
- **Type consistency**: `UINode`/`GeneratedPayload`/`UIAction` from `shared/uiSchema`;
  `getNodeRenderer`, `SafeNode`, `useGenerativeStore`, `generateFromPrompt`, `generatePayload`
  used consistently across tasks.
