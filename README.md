# Kiddo — Server-Driven UI Homepage Renderer

A production-style, **configuration-driven** React Native homepage for Kiddo (a Q-commerce
app for kids & baby essentials). The client is a deliberately **"dumb" rendering engine**: it
ingests a JSON payload, builds the entire screen tree at runtime from a Component Registry,
injects an operational theme, plays a live-campaign overlay, and routes every interaction
through one action dispatcher.

The point of the architecture: **the homepage can be completely restyled and re-laid-out from
the server with zero App Store / Play Store releases.** Marketing ships a new JSON payload;
the binary never changes.

> Built with React Native (Expo) · TypeScript **strict** · `@shopify/flash-list` ·
> `lottie-react-native` · `zustand` · `expo-linear-gradient`.

---

## 1. Quick start

```bash
npm install
npx expo start          # then press 'a' (Android) or 'i' (iOS)
# or:  npx expo start --web   (instant browser preview)
```

For a physical Android phone: install **Expo Go**, plug in via USB (USB debugging on), press
**`a`**. Or scan the QR with Expo Go over the same Wi-Fi.

Quality gates (all run clean):

```bash
npm run typecheck   # tsc --noEmit, strict mode
npm run lint        # eslint (eslint-config-expo)
npm test            # jest-expo unit tests
```

---

## 2. The mental model

```
            ┌─────────────────────────── ThemeProvider (Context) ──────────────────────────┐
            │                                                                                │
 JSON payload ──▶ data boundary ──▶ Component Registry ──▶ ONE vertical FlashList            │
 (theme +         (typed, the      (type → component,        renders each block as a row     │
  blocks[])        only `as` cast)   a hash-map)              via <SafeBlock>                 │
                                                                  │                          │
                                          interactive nodes ──────┘                          │
                                          fire a raw Action object                           │
                                                  │                                          │
                                                  ▼                                          │
                                          handleAction(action) ──▶ Zustand cart store        │
            │                             (the single dispatcher)   (selector subscriptions) │
            └────────────────────────────────────────────────────────────────────────────────┘
                                          CampaignOverlay (Lottie, pointerEvents="none") floats on top
```

One-directional data flow, two cross-cutting layers (theme + overlay). Every box below maps
to one small, single-responsibility file (see §6).

---

## 3. Key design decisions (the *why*)

This section is the heart of the submission — each decision is a deliberate trade, not a default.

### 3.1 Component Registry as a hash-map, not a `switch`
`src/registry/componentRegistry.ts` is a plain object: `{ BANNER_HERO: BannerHero, … }`.
Resolving a block is one `O(1)` lookup; a miss returns `undefined`.

*Why not a `switch`?* A switch couples block-resolution to a single growing function — every
new block type edits that function, and an unhandled `case` falls through silently or throws.
A map is **open for extension**: registering a new block type is a one-line addition that
touches nothing else, and "unknown type" is a first-class, testable value (`undefined`) rather
than a control-flow gap. This is the Factory Pattern the brief asked for, and it's what the
"architectural cleanliness" criterion rewards.

### 3.2 Defensive resilience: two independent layers
The brief's "critical rule" is that a bad node must never take down the feed. Two layers:

1. **Unknown type** → `SafeBlock` looks the type up in the registry; on a miss it returns
   `null` and warns. The node is dropped; its siblings render untouched.
2. **A known block that throws at runtime** (corrupt metadata, unexpected shape) →
   `BlockErrorBoundary` wraps every row and contains the crash to that single row.

These are separate failure modes (unrecognized vs. recognized-but-broken) handled separately,
so the feed is stable against *both*. `homepage.json` ships a real `NEW_COMPONENT_V2` block to
prove layer 1 on every launch.

### 3.3 Render isolation: Zustand selectors + `React.memo`
The brief's hardest mandate: tapping **Add to Cart** on one card must **not** re-render the
other 30+ blocks. The mechanism:

- The cart store keeps a flat `items: Record<id, qty>` map.
- Components never read the whole store. A card subscribes via `useItemQty(id)` (returns a
  primitive `number`); the badge via `useCartCount()`. Zustand compares each selector result
  with `Object.is`, so a card re-renders **only** when *its own* quantity changes.
- Every block and card is wrapped in `React.memo`, so a parent re-render can't cascade.
- The dispatcher mutates via `useCartStore.getState().addItem(id)` — `getState()` does **not**
  subscribe the caller, so firing an action never itself triggers a render.

Net result: one tap re-renders exactly two components (the tapped card + the badge). You can
*see* this — flip on the debug badges (§5) and watch the counters.

### 3.4 One vertical `FlashList` for the entire feed
The whole heterogeneous feed streams through a single `FlashList` in `HomeScreen.tsx`, with a
stable `keyExtractor` (block `id`, never index) and a memoized `renderItem`. FlashList
recycles off-screen rows, so a 100-block payload costs roughly the same as a 10-block one.
The horizontal carousel (`DynamicCollection`) is its **own** nested `FlashList`, which forms a
separate virtualization/gesture boundary — horizontal drags are absorbed there and never steal
the parent's vertical scroll momentum.

### 3.5 Centralized action dispatcher, "dumb" components
Every interactive node (banner CTA, product card) does exactly one thing on press: hand its
declarative `action` object to `handleAction(action)`. All business logic lives in that one
coordinator. Components carry **zero** knowledge of the cart, navigation, or coupons — they're
pure presentation, which keeps them trivially reusable and testable.

### 3.6 OTA theming via Context
The payload carries a `theme` palette. `ThemeProvider` puts it on Context at the root; every
component samples it with `useTheme()`. Switching campaigns swaps the theme object → the whole
UI recolors instantly, no reload, no rebuild.

### 3.7 TypeScript: discriminated unions as contracts
`Action` and `Block` are discriminated unions keyed on `type`. The dispatcher's `switch` has a
`never` exhaustiveness guard, so **adding an action variant without handling it fails the
build**. Server data enters through exactly one `as` cast at the data boundary
(`src/data/index.ts`) — everywhere past that point is fully typed, and untrusted shapes are
modeled honestly as `UnknownBlock` until the registry validates them.

---

## 4. Requirement → implementation

| Requirement (from brief) | Where / how |
|---|---|
| Mock JSON payload, ingested dynamically | `src/data/*.json` → `src/data/index.ts` |
| Component Registry (Factory Pattern), **not** a switch | `src/registry/componentRegistry.ts` |
| `BANNER_HERO`, `PRODUCT_GRID_2X2`, `DYNAMIC_COLLECTION` | `src/components/blocks/*` |
| **Resilience**: drop unknown types, stay stable | `SafeBlock` + `BlockErrorBoundary` |
| Horizontal carousel nested in vertical feed | `DynamicCollection` (nested `FlashList`) |
| Vertical scroll not disturbed by horizontal drag | separate nested-list virtualization boundary |
| Universal `handleAction(action)` dispatcher | `src/actions/handleAction.ts` |
| Decoupled, logic-free components | all blocks/cards only call `handleAction` |
| Single vertical `FlashList`, strict `keyExtractor`, `React.memo` | `src/screens/HomeScreen.tsx` |
| 3 distinct live campaigns, instant runtime switch | `src/data/campaigns/*` + `CampaignPicker` |
| `FULL_SCREEN_OVERLAY` Lottie, `pointerEvents="none"`, cached media | `src/components/CampaignOverlay.tsx` + `src/utils/lottieCache.ts` |
| OTA theming via Context Provider | `src/theme/ThemeContext.tsx` |
| Add-to-cart re-render isolation | `src/store/cartStore.ts` selectors + `React.memo` |
| TypeScript strict, full contracts | `src/types/schema.ts`, `tsconfig` strict |

---

## 5. How to verify it (demo script)

1. **JSON-driven** — everything on screen is built from `src/data/homepage.json`.
2. **Resilience** — `homepage.json` contains a `NEW_COMPONENT_V2` block; it's dropped silently
   while neighbors render. The Metro console logs `[SafeBlock] Unsupported block type …`.
3. **Live campaigns** — tap the top chips. Theme, feed, layout order, and the Lottie overlay
   all change instantly; taps pass **through** the overlay animation.
4. **Render isolation** — tap the **🐞** button in the header to switch on the dev render
   counters. Tap one card's **ADD**: only that card's counter and the cart badge increment;
   every other block stays frozen. (Same proof appears as `[render] …` lines in the console.)
5. **Cart** — `ADD` becomes a `−  n  +` stepper; the floating badge tracks the total.

---

## 6. Project layout

| Path | Responsibility |
|---|---|
| `App.tsx` | Root: active-campaign state, providers, overlay + badge layering |
| `src/types/schema.ts` | All strict types; discriminated unions for `Action` and `Block` |
| `src/data/` | Mock homepage payload + 3 campaign profiles + typed boundary (`index.ts`) |
| `src/registry/componentRegistry.ts` | Hash-map `type → component` (Factory Pattern) |
| `src/components/SafeBlock.tsx` | Registry lookup + graceful drop of unknown types |
| `src/components/BlockErrorBoundary.tsx` | Contains a runtime crash to one row |
| `src/components/blocks/*` | `BannerHero`, `ProductGrid2x2`, `DynamicCollection` |
| `src/components/ProductCard.tsx` | Memoized atomic card; subscribes to its own cart slice |
| `src/components/CampaignOverlay.tsx` | Full-screen Lottie, `pointerEvents="none"` (+ `.web` stub) |
| `src/components/CampaignPicker.tsx` | Runtime campaign switcher (stands in for the server) |
| `src/components/CartBadge.tsx` | Floating total; subscribes only to `useCartCount()` |
| `src/components/RenderBadge.tsx` | Dev-only re-render counter (toggled by 🐞) |
| `src/actions/handleAction.ts` | The single centralized dispatcher |
| `src/store/cartStore.ts` | Zustand cart + selector hooks for render isolation |
| `src/store/debugStore.ts` | Toggles the render badges |
| `src/theme/ThemeContext.tsx` | OTA theming via Context |
| `src/utils/productVisual.ts` | Title → category emoji + pastel (catalog imagery) |
| `src/utils/lottieCache.ts` | Fetch-once, memoized cache for remote campaign animations |
| `src/**/*.test.ts` | jest-expo unit tests (registry, cart, dispatcher, productVisual) |
| `src/screens/HomeScreen.tsx` | The single vertical `FlashList` |

---

## 7. Deliberate trade-offs & scope

These were chosen consciously to keep focus on what the brief grades (architecture,
performance, type-safety, resilience):

- **Product imagery is category emoji tiles, not photos.** A mock has no real product CDN, and
  random stock images render off-topic (a building in a "popcorn" card). Emoji tiles are
  always on-topic, load instantly, and read as an intentional catalog style. Swapping in a
  real image pipeline is a localized change in `ProductCard` (see §8).
- **`DEEP_LINK` shows an alert** instead of navigating — no navigation library is in scope.
- **Cart is in-memory** — no persistence/checkout/auth.
- **The campaign picker** stands in for the upstream service deciding which campaign is live.
- **Banner is a themed gradient**, not a hero photo — guarantees an on-brand look without a
  network dependency.
- **Block order differs per campaign by design** — the JSON controls layout order, which is
  the whole SDUI proposition (the server rearranges the page, not the client).

## 8. How I'd productionize this

- **Schema validation at the boundary** — replace the single `as` cast with a `zod`/`io-ts`
  parse so malformed payloads are caught and reported, not just tolerated.
- **Real image pipeline** — swap emoji tiles for `expo-image` with a real product image URL on
  each `Product`, plus blurhash placeholders and CDN caching. Isolated to `ProductCard`.
- **Navigation** — wire `DEEP_LINK` to `expo-router`/React Navigation.
- **Remote payload + cache** — fetch the payload over HTTP with stale-while-revalidate; the
  renderer already doesn't care where the JSON comes from.
- **Persistence** — back the cart with `AsyncStorage`/MMKV via Zustand middleware.
- **Tests** — unit-test the registry resolution + `SafeBlock` drop path, and the cart
  selectors; snapshot-test each block from fixture payloads.
- **Observability** — emit a metric when `SafeBlock` drops a node, so unknown server types are
  visible in production dashboards rather than only the console.
