# Kiddo — Server-Driven UI Homepage Renderer

A configuration-driven React Native homepage for Kiddo (a Q-commerce app for kids & baby
essentials). The frontend is a **"dumb" rendering engine**: it ingests a mock JSON payload,
builds the screen at runtime from a Component Registry, injects themes, plays live-campaign
overlays, and routes every interaction through a single action dispatcher — so the homepage
can change with **zero App Store / Play Store releases**.

## Quick start

```bash
npm install
npx expo start
```

Then, with your **Android device plugged in via USB** (USB debugging on) and the **Expo Go**
app installed, press **`a`** in the terminal. (Or scan the QR code with Expo Go over Wi-Fi.)

Type-check the whole project at any time:

```bash
npx tsc --noEmit
```

## How to evaluate it

1. **Feed renders from JSON** — everything you see comes from `src/data/homepage.json`.
2. **Resilience** — `homepage.json` contains a `NEW_COMPONENT_V2` block. It is silently
   dropped; the blocks around it render normally. Check the Metro console for the
   `[SafeBlock] Unsupported block type ...` warning.
3. **Carousel inside the feed** — the "Snacks under ₹99" row scrolls horizontally without
   disturbing the vertical scroll.
4. **Live campaigns** — tap the chips at the top (Home / Back to School / Summer Playhouse /
   Mystery Gift Carnival). The theme, the full-screen Lottie overlay, and the feed all change
   instantly. Taps pass straight **through** the overlay animation.
5. **Render isolation** — watch the Metro console. Tapping **Add to Cart** on one card logs a
   re-render for **only that card** and the `CartBadge`. The other blocks do not re-render.

## Architecture

```
mock JSON  ->  data boundary (typed)  ->  Component Registry (type -> component)
           ->  ONE vertical FlashList renders each block as a row
           ->  blocks fire raw action objects
           ->  handleAction()  ->  Zustand cart store
```

Two cross-cutting layers wrap the screen: a **ThemeProvider** (Context) supplies colors, and
a **CampaignOverlay** (Lottie, `pointerEvents="none"`) floats on top.

## Project layout

| Path | Responsibility |
|---|---|
| `src/types/schema.ts` | All strict types: discriminated unions for `Action` and blocks. |
| `src/registry/componentRegistry.ts` | Hash-map `type -> component` (the Factory Pattern). |
| `src/components/SafeBlock.tsx` | Registry lookup + graceful drop of unknown types. |
| `src/components/BlockErrorBoundary.tsx` | Contains a runtime crash to a single block. |
| `src/components/blocks/*` | `BannerHero`, `ProductGrid2x2`, `DynamicCollection`. |
| `src/components/ProductCard.tsx` | Memoized atomic card; subscribes to its own cart slice. |
| `src/actions/handleAction.ts` | The single centralized dispatcher. |
| `src/store/cartStore.ts` | Zustand store + selector hooks for render isolation. |
| `src/theme/ThemeContext.tsx` | OTA theming via Context. |
| `src/data/*` | Mock homepage payload + three campaign profiles. |
| `src/screens/HomeScreen.tsx` | The single vertical FlashList. |
| `App.tsx` | Root: active-campaign state + providers. |

## How each requirement is met

| Requirement | Where / how |
|---|---|
| Registry, **not** a switch | `componentRegistry.ts` — an object map; lookup miss returns `undefined`. |
| Resilience (drop unknown types) | `SafeBlock` returns `null` + warns; per-block `BlockErrorBoundary`. |
| One vertical list | `HomeScreen` renders a single `FlashList`; `keyExtractor` = block `id`. |
| Carousel nested in feed | `DynamicCollection` = horizontal `FlashList` with memoized render fns. |
| Universal action dispatcher | All nodes call `handleAction(action)`; components hold no logic. |
| 3 live campaigns + instant switch | `src/data/campaigns/*`; picker swaps theme + overlay + feed. |
| Full-screen overlay, taps pass through | `CampaignOverlay` — absolute Lottie, `pointerEvents="none"`. |
| OTA theming | `ThemeContext`; every component samples `useTheme()`. |
| Add-to-cart re-render isolation | Zustand selectors (`useItemQty`, `useCartCount`) + `React.memo`. |
| TypeScript strict | `tsconfig` strict; discriminated unions; no `any` in contracts. |

## Notes & scope

- No real backend, navigation, checkout, or auth (out of scope). `DEEP_LINK` shows an alert
  with the target; the cart is in-memory.
- Campaign overlays load remote Lottie JSON by URL (cached by `lottie-react-native`).
- The campaign picker stands in for the upstream service choosing which campaign is live.

## Stack

React Native (Expo) · TypeScript (strict) · `@shopify/flash-list` · `lottie-react-native` ·
`zustand`.
