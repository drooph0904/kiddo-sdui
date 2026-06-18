/**
 * Kiddo SDUI — type contracts for the server-driven payload.
 *
 * These types are the single source of truth for the shape of data flowing from the
 * (mock) backend into the renderer. Everything is strict: no `any` in any contract.
 *
 * Design notes:
 * - `Action` and the block types are *discriminated unions* keyed on `type`, so
 *   TypeScript can narrow them safely in the dispatcher and components.
 * - `UnknownBlock` models a block exactly as it arrives over the wire: a `type`
 *   string we have not validated yet and an open bag of other fields. The renderer
 *   only trusts a block after the registry confirms its `type` (see SafeBlock).
 */

/* ------------------------------------------------------------------ Theme */

/** Operational color palette injected by the server (OTA theming). */
export interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

/* ----------------------------------------------------------------- Actions */

/** Add a product to the cart. */
export interface AddToCartAction {
  type: 'ADD_TO_CART';
  payload: { id: string };
}

/** Navigate to an in-app destination. */
export interface DeepLinkAction {
  type: 'DEEP_LINK';
  payload: { url: string };
}

/** Remove / decrement one unit from the cart. */
export interface RemoveFromCartAction {
  type: 'REMOVE_FROM_CART';
  payload: { id: string };
}

/** Apply a mystery-gift coupon (Mystery Gift Carnival campaign). */
export interface ApplyMysteryGiftCouponAction {
  type: 'APPLY_MYSTERY_GIFT_COUPON';
  payload: { couponId: string };
}

/** Every interactive node carries one of these. Discriminated on `type`. */
export type Action =
  | AddToCartAction
  | RemoveFromCartAction
  | DeepLinkAction
  | ApplyMysteryGiftCouponAction;

/* ---------------------------------------------------------------- Products */

export interface Product {
  id: string;
  title: string;
  /** Price in INR (whole rupees). */
  price: number;
  image: string;
  action: Action;
}

/* ------------------------------------------------------------------ Blocks */

export interface BannerHeroBlock {
  id: string;
  type: 'BANNER_HERO';
  title: string;
  subtitle?: string;
  image: string;
  cta?: { label: string; action: Action };
}

export interface ProductGrid2x2Block {
  id: string;
  type: 'PRODUCT_GRID_2X2';
  title?: string;
  /** Exactly four products are expected, but the renderer tolerates fewer. */
  products: Product[];
}

export interface DynamicCollectionBlock {
  id: string;
  type: 'DYNAMIC_COLLECTION';
  /** Contextual marketing theme, e.g. "Snacks under ₹99". */
  title: string;
  products: Product[];
}

/** The blocks this client knows how to render. Discriminated on `type`. */
export type KnownBlock =
  | BannerHeroBlock
  | ProductGrid2x2Block
  | DynamicCollectionBlock;

/**
 * A block exactly as it arrives from the server: `type` is an unvalidated string
 * and any number of extra fields may be present. The renderer narrows this to a
 * `KnownBlock` only after the registry confirms the `type` is supported.
 */
export interface UnknownBlock {
  id: string;
  type: string;
  [key: string]: unknown;
}

/* --------------------------------------------------------------- Campaigns */

/** Full-screen live-campaign overlay (e.g. confetti, water splash). */
export interface OverlayConfig {
  type: 'FULL_SCREEN_OVERLAY';
  animation_url: string;
}

/** A live marketing campaign: its skin, optional overlay, and feed. */
export interface Campaign {
  id: string;
  name: string;
  theme: Theme;
  overlay?: OverlayConfig;
  blocks: UnknownBlock[];
}

/** The default (no-campaign) homepage payload. */
export interface HomePayload {
  theme: Theme;
  blocks: UnknownBlock[];
}
