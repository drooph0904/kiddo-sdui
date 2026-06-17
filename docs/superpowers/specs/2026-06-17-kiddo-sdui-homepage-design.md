# Kiddo SDUI Homepage Renderer — Design Spec

**Date:** 2026-06-17
**Status:** Approved (design), pending implementation

## 1. Goal

Build a production-style, configuration-driven React Native homepage renderer for
Kiddo (a Q-commerce app for kids/baby essentials). The frontend is a "dumb" rendering
engine: it ingests a deeply structured mock JSON payload, builds the screen tree at
runtime from a Component Registry, injects themes, plays live-campaign overlays, and
routes all interactions through a single action dispatcher — with zero app-store release
cycles needed to change the homepage.

## 2. Stack (mandated by assignment)

- **Framework:** React Native via **Expo** (managed workflow).
- **Language:** **TypeScript, strict mode**.
- **List rendering:** `@shopify/flash-list` (single vertical list for the feed).
- **Animations:** `lottie-react-native` for campaign overlays.
- **State:** **Zustand** (cart, selector-based to avoid global re-renders) +
  **React Context** (theme).
- **Run target:** Expo Go on a USB-connected Android device.

## 3. Architecture

One-directional data flow:

```
mock JSON  ->  parse + validate (typed)  ->  Component Registry (type -> component)
           ->  ONE FlashList renders each block as a row
           ->  blocks fire raw action objects
           ->  handleAction() (single dispatcher)  ->  Zustand cart store
```

Two cross-cutting layers wrap the screen:
- **ThemeProvider (Context):** supplies `{primary, background, ...}` from JSON to all components.
- **CampaignOverlay:** full-screen Lottie on top, `pointerEvents="none"` so taps pass through.

## 4. Folder structure

```
kiddo-sdui/
├── App.tsx                         # root: ThemeProvider + CartStore + HomeScreen + Overlay
├── src/
│   ├── data/
│   │   ├── homepage.json           # main feed payload (incl. an unknown block for resilience demo)
│   │   └── campaigns/
│   │       ├── backToSchool.json
│   │       ├── summerPlayhouse.json
│   │       └── mysteryGift.json
│   ├── types/
│   │   └── schema.ts               # Block, Action, Theme, Campaign, Product interfaces (strict)
│   ├── registry/
│   │   └── componentRegistry.ts    # hash-map type->component (NOT a switch)
│   ├── components/
│   │   ├── blocks/
│   │   │   ├── BannerHero.tsx
│   │   │   ├── ProductGrid2x2.tsx
│   │   │   └── DynamicCollection.tsx
│   │   ├── ProductCard.tsx         # memoized atomic card
│   │   ├── SafeBlock.tsx           # registry lookup + graceful skip + error boundary
│   │   ├── CampaignOverlay.tsx
│   │   └── CartBadge.tsx
│   ├── actions/
│   │   └── handleAction.ts         # single centralized dispatcher
│   ├── store/
│   │   └── cartStore.ts            # Zustand, selector-based
│   ├── theme/
│   │   └── ThemeContext.tsx
│   └── screens/
│       └── HomeScreen.tsx          # the single vertical FlashList + campaign picker (dev control)
├── tsconfig.json                   # strict
└── package.json
```

## 5. Data schema (TypeScript contracts)

- `Action` is a **discriminated union**: `ADD_TO_CART | DEEP_LINK | APPLY_MYSTERY_GIFT_COUPON`,
  each with its own `payload` shape.
- `Block` is a discriminated union on `type`: `BANNER_HERO | PRODUCT_GRID_2X2 | DYNAMIC_COLLECTION`.
  Every block has a unique `id` (used for `keyExtractor`).
- `Theme` = `{ primary, background, surface, text, accent }`.
- `Campaign` = `{ id, name, theme, overlay?: { type: "FULL_SCREEN_OVERLAY", animation_url }, blocks: Block[] }`.
- `Product` = `{ id, title, price, image, action }`.
- Parsing is defensive: unknown/malformed blocks are tolerated, never thrown on.

## 6. How each assignment rule is satisfied

| Rule | Mechanism |
|---|---|
| Registry not switch | `componentRegistry`: object map; unknown type returns `null`. |
| Resilience (skip unknown) | `SafeBlock` wraps each row: unknown type -> render null + `console.warn`; runtime error in a block -> caught by per-block Error Boundary; feed stays stable. |
| One vertical list | `HomeScreen` renders one FlashList; `keyExtractor` = block `id`. |
| Carousel in list | `DynamicCollection` is a horizontal FlashList nested in a row; gesture/nested-scroll configured so vertical momentum is preserved; items virtualized. |
| Central actions | All interactive nodes call `handleAction(action)`; components hold no business logic. |
| 3 campaigns + instant theme switch | Campaign picker swaps active payload -> theme + overlay + blocks change with no reload. |
| Full-screen overlay | `CampaignOverlay`: absolute Lottie, `pointerEvents="none"`; remote media cached. |
| OTA theming | `ThemeContext` from JSON theme; all skins sample context. |
| Add-to-cart re-render isolation | Zustand selectors: only the tapped `ProductCard` (React.memo) + `CartBadge` re-render; other ~30 blocks do not. Headline requirement. |
| TS strict | strict tsconfig; full interfaces; discriminated unions for blocks + actions. |

## 7. Out of scope (YAGNI)

No real backend, navigation library, checkout, or auth. Cart is in-memory. Campaign picker
is a dev control, not a shipped feature. DEEP_LINK logs/toasts the target rather than navigating.

## 8. Verification (how we know it works)

- App boots on the Android device and renders the feed from JSON.
- All three block types render with realistic visuals.
- An injected `NEW_COMPONENT_V2` block is silently skipped; rest of feed intact.
- Horizontal carousel scrolls without breaking vertical scroll.
- Switching campaigns recolors the app and swaps the overlay instantly.
- Tapping Add-to-Cart increments the badge; (verified via render logging) sibling blocks
  do not re-render.
- `tsc --noEmit` passes under strict mode.

## 9. Commit strategy

Granular commits, one per logical feature (scaffold, types, registry, each block,
store, theme, overlay, campaigns, resilience demo). No single mega-commit.
