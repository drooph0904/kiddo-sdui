# Kiddo SDUI Homepage Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox (`- [ ]`) syntax.
> Adaptation: this is a visual RN app verified MANUALLY on a device (user's explicit
> choice) + `npx tsc --noEmit` for strict-type safety, instead of per-component unit tests.

**Goal:** Build a configuration-driven React Native homepage that renders entirely from a
mock JSON payload via a Component Registry, with resilient parsing, a single action
dispatcher, OTA theming, live-campaign Lottie overlays, and re-render-isolated cart state.

**Architecture:** Single vertical FlashList renders heterogeneous blocks looked up from a
type→component hash-map. Theme flows via Context; cart state via Zustand selectors so only
the tapped card re-renders. Campaign profiles swap theme + overlay + blocks at runtime.

**Tech Stack:** Expo (managed), TypeScript strict, @shopify/flash-list, lottie-react-native,
zustand.

## Global Constraints

- TypeScript **strict mode** everywhere; no `any` in schema/action contracts.
- Component Registry MUST be a hash-map, NOT a switch statement.
- Unknown/corrupt blocks MUST be skipped silently; never crash the feed.
- Entire feed in ONE vertical FlashList; stable `keyExtractor` by block `id`.
- All interactions route through a single `handleAction(action)`; components hold no business logic.
- Add-to-cart MUST NOT re-render sibling blocks (Zustand selectors + React.memo).
- Campaign overlay uses Lottie with `pointerEvents="none"`.
- Granular commits — one per task below.

---

### Task 1: Scaffold Expo + TypeScript strict + dependencies

**Files:** Create project via Expo template; configure `tsconfig.json` strict.

- [ ] Create app: `npx create-expo-app@latest . --template blank-typescript` (in kiddo-sdui)
- [ ] Install deps: `npx expo install @shopify/flash-list lottie-react-native zustand`
- [ ] Set `tsconfig.json` `"strict": true` (template default; verify)
- [ ] Run `npx tsc --noEmit` → passes
- [ ] Commit: `chore: scaffold expo + typescript strict + core deps`

### Task 2: Type schema (`src/types/schema.ts`)

Define `Product`, `Theme`, discriminated-union `Action`, discriminated-union `Block`
(BANNER_HERO | PRODUCT_GRID_2X2 | DYNAMIC_COLLECTION), `OverlayConfig`, `Campaign`,
`HomePayload`. All fields typed; `id: string` on every block.

- [ ] Write `schema.ts` with full interfaces + unions
- [ ] `npx tsc --noEmit` → passes
- [ ] Commit: `feat: add strict TypeScript schema for blocks, actions, theme, campaigns`

### Task 3: Theme Context (`src/theme/ThemeContext.tsx`)

`ThemeProvider` holds a `Theme`; `useTheme()` hook returns it. Default theme fallback.

- [ ] Implement provider + hook
- [ ] Commit: `feat: add ThemeContext provider and useTheme hook`

### Task 4: Cart store (`src/store/cartStore.ts`)

Zustand store: `items: Record<string, number>`, `count` derived, `addItem(id)`. Expose
selector hooks `useCartCount()` and `useItemQty(id)` so subscribers only re-render on their slice.

- [ ] Implement store + selector hooks
- [ ] Commit: `feat: add zustand cart store with selector hooks for render isolation`

### Task 5: Action dispatcher (`src/actions/handleAction.ts`)

`handleAction(action: Action)` — switch on action.type: ADD_TO_CART → cartStore.addItem;
DEEP_LINK → console/alert; APPLY_MYSTERY_GIFT_COUPON → alert. Pure coordinator.

- [ ] Implement dispatcher
- [ ] Commit: `feat: add centralized handleAction dispatcher`

### Task 6: ProductCard (`src/components/ProductCard.tsx`)

Memoized card: image, title, price, themed Add-to-Cart button calling `handleAction`.
Subscribes to `useItemQty(id)` only. Wrapped in `React.memo`.

- [ ] Implement memoized ProductCard
- [ ] Commit: `feat: add memoized ProductCard with isolated cart subscription`

### Task 7: Registry + SafeBlock (`src/registry/componentRegistry.ts`, `src/components/SafeBlock.tsx`)

Registry = object map type→component. `SafeBlock` looks up type; unknown → return null +
`console.warn`; wraps render in an Error Boundary so a throwing block can't crash the feed.

- [ ] Implement registry map + SafeBlock + ErrorBoundary
- [ ] Commit: `feat: add component registry hash-map and resilient SafeBlock wrapper`

### Task 8: BannerHero block (`src/components/blocks/BannerHero.tsx`)

Full-width promo card: background image, title/subtitle, CTA → handleAction. Themed.

- [ ] Implement; register in registry
- [ ] Commit: `feat: add BANNER_HERO block`

### Task 9: ProductGrid2x2 block (`src/components/blocks/ProductGrid2x2.tsx`)

2x2 grid of ProductCard. Themed section header.

- [ ] Implement; register
- [ ] Commit: `feat: add PRODUCT_GRID_2X2 block`

### Task 10: DynamicCollection block (`src/components/blocks/DynamicCollection.tsx`)

Themed title (e.g. "Snacks under ₹99") + horizontal FlashList of ProductCard nested in the
row. `showsHorizontalScrollIndicator={false}`, stable keys, estimatedItemSize. Verify vertical
scroll stays smooth.

- [ ] Implement; register
- [ ] Commit: `feat: add DYNAMIC_COLLECTION horizontal carousel block`

### Task 11: CampaignOverlay (`src/components/CampaignOverlay.tsx`)

Absolute-fill Lottie from `overlay.animation_url`; `pointerEvents="none"`. Renders only when
active campaign has an overlay.

- [ ] Implement
- [ ] Commit: `feat: add full-screen Lottie campaign overlay with pointerEvents none`

### Task 12: CartBadge (`src/components/CartBadge.tsx`)

Floating badge using `useCartCount()` only.

- [ ] Implement
- [ ] Commit: `feat: add CartBadge subscribed to cart count selector`

### Task 13: Mock data (`src/data/homepage.json` + `src/data/campaigns/*.json`)

`homepage.json`: theme + ordered blocks incl. all three types AND one `NEW_COMPONENT_V2`
unknown block (resilience demo). Three campaign files: backToSchool (yellow/blue),
summerPlayhouse (ocean blue), mysteryGift (carnival red) — each with theme, overlay
animation_url (public Lottie), and themed blocks. Realistic product data + image URLs.

- [ ] Author all JSON files (typed against schema)
- [ ] Commit: `feat: add mock homepage payload + three campaign profiles (incl. unknown block)`

### Task 14: HomeScreen (`src/screens/HomeScreen.tsx`)

Single vertical FlashList over active payload blocks; `renderItem` = `<SafeBlock>`;
`keyExtractor` = block id. Dev campaign picker (row of buttons) swaps active payload.
Renders CartBadge + CampaignOverlay above the list.

- [ ] Implement
- [ ] Commit: `feat: add HomeScreen single FlashList + campaign picker`

### Task 15: App.tsx wiring + README

Wrap HomeScreen in ThemeProvider keyed to active campaign theme. Write README documenting
architecture, how each rule is met, and run instructions.

- [ ] Wire App.tsx; write README.md
- [ ] `npx tsc --noEmit` → passes
- [ ] Commit: `feat: wire app root with theme provider; docs: add README`

### Task 16: Manual device verification

- [ ] `npx expo start`, press `a` (USB Android) — feed renders
- [ ] All 3 block types visible & realistic; unknown block skipped
- [ ] Horizontal carousel scrolls without breaking vertical scroll
- [ ] Switch campaigns → theme + overlay change instantly; taps pass through overlay
- [ ] Add-to-cart increments badge; (render logs) siblings don't re-render
- [ ] Commit any fixes found during verification (granular)

## Self-Review

- Spec coverage: every Section-6 rule maps to a task (registry→T7, resilience→T7/T13,
  one list→T14, carousel→T10, actions→T5, campaigns→T13/T14, overlay→T11, theming→T3/T15,
  cart isolation→T4/T6/T12, TS strict→T1/T2). Covered.
- No placeholders; file paths exact.
- Type names consistent across tasks (handleAction, useCartCount, useItemQty, SafeBlock).
